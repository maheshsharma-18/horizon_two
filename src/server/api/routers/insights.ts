import { z } from "zod";
import { desc, sql } from "drizzle-orm";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { corsairEvents, underpinEmailEmbeddings } from "@/server/db/schema";
import { embedText, isEmbeddingConfigured } from "@/lib/embeddings";
import { getTenant } from "@/server/lib/tenant";
import { env } from "@/env";

// UNVERIFIED: these `eventType` strings are a guess at Corsair's naming
// convention (dot-separated "plugin.entity.action", mirroring the
// `result.plugin` / `result.action` the webhook handler already logs).
// The reference repo never prints an actual eventType value. Once you've
// received one real webhook, check `corsair_events.event_type` in Postgres
// directly and adjust this map (and humanizeEventType's parsing below) to
// match the real format.
const ACTIVITY_KIND_BY_EVENT_TYPE: Record<string, string> = {
  "gmail.message.created": "new_email",
  "gmail.message.updated": "new_email",
  "gmail.draft.created": "draft_saved",
  "googlecalendar.event.created": "calendar_updated",
  "googlecalendar.event.updated": "calendar_updated",
};

export const insightsRouter = createTRPCRouter({
  /**
   * Drives the "Powered by Corsair" panel. `gmailConnected`/`calendarConnected`
   * do a real (cheap, cached-DB) call rather than just checking env vars, so
   * the panel reflects whether OAuth actually completed, not just whether
   * CORSAIR_KEK is set.
   */
  connectionStatus: publicProcedure.query(async () => {
    const tenant = getTenant();
    const [gmailOk, calendarOk] = await Promise.all([
      tenant.gmail.db.messages
        .list({ limit: 1, offset: 0 })
        .then(() => true)
        .catch(() => false),
      tenant.googlecalendar.db.events
        .list({ limit: 1, offset: 0 })
        .then(() => true)
        .catch(() => false),
    ]);
    return {
      gmail: gmailOk,
      calendar: calendarOk,
      mcp: Boolean(env.CORSAIR_MCP_URL),
      webhooks: gmailOk || calendarOk, // best proxy available without a dedicated webhook-health endpoint
      aiDrafting: Boolean(env.ANTHROPIC_API_KEY),
      vectorSearch: isEmbeddingConfigured(),
    };
  }),

  /**
   * Bonus task #6: semantic search over underpin_email_embeddings via
   * pgvector cosine distance. Requires VOYAGE_API_KEY (see lib/embeddings)
   * and that embeddings have actually been backfilled — see the webhook
   * handler, which is where new messages get embedded as they arrive.
   */
  vectorSearch: publicProcedure
    .input(z.object({ query: z.string().min(1), limit: z.number().min(1).max(50).default(20) }))
    .query(async ({ ctx, input }) => {
      if (!isEmbeddingConfigured()) {
        return { enabled: false, results: [] as { threadId: string; entityId: string; distance: number }[] };
      }
      const embedding = await embedText(input.query);
      const vectorLiteral = `[${embedding.join(",")}]`;
      const rows = await ctx.db
        .select({
          entityId: underpinEmailEmbeddings.entityId,
          threadId: underpinEmailEmbeddings.threadId,
          distance: sql<number>`${underpinEmailEmbeddings.embedding} <=> ${vectorLiteral}::vector`,
        })
        .from(underpinEmailEmbeddings)
        .orderBy(sql`${underpinEmailEmbeddings.embedding} <=> ${vectorLiteral}::vector`)
        .limit(input.limit);
      return { enabled: true, results: rows };
    }),

  /**
   * Backfills (or refreshes) the embedding for one cached message. Call
   * this from the webhook handler for every new gmail.message entity.
   */
  embedMessage: publicProcedure
    .input(z.object({ entityId: z.string().min(1), threadId: z.string().min(1), text: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const embedding = await embedText(input.text);
      await ctx.db
        .insert(underpinEmailEmbeddings)
        .values({ entityId: input.entityId, threadId: input.threadId, embedding })
        .onConflictDoUpdate({
          target: underpinEmailEmbeddings.entityId,
          set: { embedding, updatedAt: new Date() },
        });
      return { ok: true };
    }),

  /**
   * Activity Timeline feed. Sourced from `corsair_events` — the table
   * `processWebhook()` already writes to on every inbound webhook — rather
   * than a parallel log we'd have to maintain ourselves.
   */
  recentActivity: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(20) }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select()
        .from(corsairEvents)
        .orderBy(desc(corsairEvents.createdAt))
        .limit(input.limit);

      return rows.map((row) => ({
        id: row.id,
        kind: ACTIVITY_KIND_BY_EVENT_TYPE[row.eventType] ?? "webhook_received",
        title: humanizeEventType(row.eventType),
        detail: row.status ?? undefined,
        timestamp: row.createdAt.toISOString(),
      }));
    }),

  /**
   * Rule-based suggestions (no extra LLM call) for the "Today's Focus" /
   * Quick Actions widget — built from the same thread + event data the
   * Priority Inbox and Calendar views already show. Deliberately
   * deterministic rather than another model call: cheaper, and reliable
   * for a live demo.
   */
  suggestions: publicProcedure.query(async () => {
    const tenant = getTenant();
    const [messages, events] = await Promise.all([
      tenant.gmail.db.messages.list({ limit: 100, offset: 0 }),
      tenant.googlecalendar.db.events.list({ limit: 100, offset: 0 }),
    ]);

    const suggestions: {
      id: string;
      kind: string;
      title: string;
      description: string;
      relatedThreadId?: string;
      relatedEventId?: string;
    }[] = [];

    // Conflict detection: any two events whose [start,end) ranges overlap.
    const mapped = events.map((e) => ({
      id: e.entity_id,
      summary: e.data.summary ?? "(no title)",
      start: e.data.start?.dateTime ?? e.data.start?.date,
      end: e.data.end?.dateTime ?? e.data.end?.date,
    }));
    for (let i = 0; i < mapped.length; i++) {
      for (let j = i + 1; j < mapped.length; j++) {
        const a = mapped[i];
        const b = mapped[j];
        if (!a.start || !a.end || !b.start || !b.end) continue;
        const overlap = new Date(a.start) < new Date(b.end) && new Date(b.start) < new Date(a.end);
        if (overlap) {
          suggestions.push({
            id: `conflict_${a.id}_${b.id}`,
            kind: "reschedule",
            title: `Resolve conflict: "${a.summary}" vs "${b.summary}"`,
            description: "These two events overlap — move one to clear your schedule.",
            relatedEventId: a.id,
          });
        }
      }
    }

    // Newsletter/bulk-sender archive suggestion.
    const bulkSenderHints = ["noreply", "no-reply", "newsletter", "digest"];
    const bulkCount = messages.filter((m) =>
      bulkSenderHints.some((hint) => (m.data.from ?? "").toLowerCase().includes(hint)),
    ).length;
    if (bulkCount > 0) {
      suggestions.push({
        id: "archive_bulk",
        kind: "archive",
        title: `Archive ${bulkCount} newsletter${bulkCount === 1 ? "" : "s"}`,
        description: "Low-priority bulk senders detected in your recent mail.",
      });
    }

    return suggestions.slice(0, 8);
  }),
});

function humanizeEventType(eventType: string): string {
  const [, action] = eventType.split(".");
  switch (action) {
    case "created":
      return `New ${eventType.split(".")[0] === "gmail" ? "email" : "calendar event"}`;
    case "updated":
      return `${eventType.split(".")[0] === "gmail" ? "Email" : "Calendar event"} updated`;
    default:
      return eventType;
  }
}
