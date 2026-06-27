import { z } from "zod";
import { inArray } from "drizzle-orm";

import {
  encodeRawEmail,
  extractBodyFromPayload,
  getHeader,
} from "@/server/lib/email";
import { getTenant } from "@/server/lib/tenant";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { underpinEmailInsights, underpinThreadSummaries } from "@/server/db/schema";
import { classifyEmailPriority, summarizeThread } from "@/lib/anthropic-agent";

const paginationSchema = z.object({
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

function messageTimestamp(internalDate?: string | null, createdAt?: Date | null): number {
  if (internalDate) return Number(internalDate);
  if (createdAt) return createdAt.getTime();
  return 0;
}

// --- Same mapping/dedupe helpers as corsairdev/google-demo's gmail.ts ------

function mapMessage(message: {
  entity_id: string;
  data: {
    threadId?: string;
    snippet?: string;
    subject?: string;
    from?: string;
    to?: string;
    body?: string;
    internalDate?: string;
    createdAt?: Date | null;
  };
}) {
  return {
    id: message.entity_id,
    threadId: message.data.threadId ?? message.entity_id,
    snippet: message.data.snippet ?? "",
    subject: message.data.subject ?? "",
    from: message.data.from ?? "",
    to: message.data.to ?? "",
    date: message.data.internalDate ?? null,
    timestamp: messageTimestamp(message.data.internalDate, message.data.createdAt),
  };
}

function dedupeByEntityId<T extends { entity_id: string; updated_at: Date }>(items: T[]): T[] {
  const byEntityId = new Map<string, T>();
  for (const item of items) {
    const existing = byEntityId.get(item.entity_id);
    if (!existing || item.updated_at > existing.updated_at) {
      byEntityId.set(item.entity_id, item);
    }
  }
  return Array.from(byEntityId.values());
}

function sortMessagesNewestFirst<T extends { timestamp: number }>(messages: T[]): T[] {
  return [...messages].sort((a, b) => b.timestamp - a.timestamp);
}

/** Parses "Name <email@x.com>" into parts; falls back gracefully. */
function parseNameEmail(raw: string): { name: string; email: string } {
  const match = /^(.*?)\s*<(.+)>$/.exec(raw.trim());
  if (match) return { name: match[1].replace(/"/g, "").trim() || match[2], email: match[2] };
  return { name: raw, email: raw };
}

export const gmailRouter = createTRPCRouter({
  // --- Verbatim from the reference repo --------------------------------

  searchEmails: publicProcedure
    .input(paginationSchema.extend({ query: z.string() }))
    .query(async ({ input }) => {
      const tenant = getTenant();
      const messages = input.query.trim()
        ? await tenant.gmail.db.messages.search({
            data: { snippet: { contains: input.query } },
            limit: input.limit,
            offset: input.offset,
          })
        : await tenant.gmail.db.messages.list({ limit: input.limit, offset: input.offset });
      return sortMessagesNewestFirst(dedupeByEntityId(messages).map(mapMessage));
    }),

  getMessage: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ input }) => {
      const tenant = getTenant();
      const cached = await tenant.gmail.db.messages.findByEntityId(input.id);

      if (cached?.data.body || cached?.data.subject) {
        return {
          id: cached.entity_id,
          threadId: cached.data.threadId ?? cached.entity_id,
          subject: cached.data.subject ?? "",
          from: cached.data.from ?? "",
          to: cached.data.to ?? "",
          body: cached.data.body ?? cached.data.snippet ?? "",
          snippet: cached.data.snippet ?? "",
          date: cached.data.internalDate ?? null,
        };
      }

      const message = await tenant.gmail.api.messages.get({ id: input.id, format: "full" });
      const headers = message.payload?.headers;
      const body = extractBodyFromPayload(message.payload) || message.snippet || "";

      return {
        id: message.id ?? input.id,
        threadId: message.threadId ?? input.id,
        subject: getHeader(headers, "Subject"),
        from: getHeader(headers, "From"),
        to: getHeader(headers, "To"),
        body,
        snippet: message.snippet ?? "",
        date: message.internalDate != null ? String(message.internalDate) : null,
      };
    }),

  listDrafts: publicProcedure.input(paginationSchema).query(async ({ input }) => {
    const tenant = getTenant();
    const drafts = await tenant.gmail.db.drafts.list({ limit: input.limit, offset: input.offset });
    return dedupeByEntityId(drafts).map((draft) => ({
      id: draft.entity_id,
      messageId: draft.data.messageId ?? "",
      createdAt: draft.data.createdAt ?? null,
    }));
  }),

  refreshInbox: publicProcedure.mutation(async () => {
    const tenant = getTenant();
    const result = await tenant.gmail.api.threads.list({ maxResults: 50 });
    return { synced: result.threads?.length ?? 0 };
  }),

  createDraft: publicProcedure
    .input(z.object({ to: z.string().email(), subject: z.string().min(1), body: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const tenant = getTenant();
      const raw = encodeRawEmail(input);
      const draft = await tenant.gmail.api.drafts.create({ draft: { message: { raw } } });
      return { id: draft.id ?? "", messageId: draft.message?.id ?? "" };
    }),

  sendDraft: publicProcedure
    .input(z.object({ draftId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const tenant = getTenant();
      const message = await tenant.gmail.api.drafts.send({ id: input.draftId });
      return { id: message.id ?? "", threadId: message.threadId ?? "" };
    }),

  sendEmail: publicProcedure
    .input(z.object({ to: z.string().email(), subject: z.string().min(1), body: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const tenant = getTenant();
      const raw = encodeRawEmail(input);
      const message = await tenant.gmail.api.messages.send({ raw });
      return { id: message.id ?? "", threadId: message.threadId ?? "" };
    }),

  // --- Underpin additions -------------------------------------------------

  /**
   * Groups cached messages into threads and joins each thread's latest
   * message with our own priority cache (underpin_email_insights). This is
   * what the dashboard's Priority Inbox and the inbox list page consume —
   * NOT a raw Corsair call, since Corsair's cache is message-level, not
   * thread-level.
   */
  listThreads: publicProcedure
    .input(paginationSchema.extend({ query: z.string().default("") }))
    .query(async ({ ctx, input }) => {
      const tenant = getTenant();
      const messages = input.query.trim()
        ? await tenant.gmail.db.messages.search({
            data: { snippet: { contains: input.query } },
            limit: 200,
            offset: 0,
          })
        : await tenant.gmail.db.messages.list({ limit: 200, offset: 0 });

      const mapped = sortMessagesNewestFirst(dedupeByEntityId(messages).map(mapMessage));

      const threadMap = new Map<string, typeof mapped>();
      for (const m of mapped) {
        const list = threadMap.get(m.threadId) ?? [];
        list.push(m);
        threadMap.set(m.threadId, list);
      }

      const entityIds = mapped.map((m) => m.id);
      const insights = entityIds.length
        ? await ctx.db
            .select()
            .from(underpinEmailInsights)
            .where(inArray(underpinEmailInsights.entityId, entityIds))
        : [];
      const insightByEntity = new Map(insights.map((i) => [i.entityId, i]));

      const threads = Array.from(threadMap.entries())
        .map(([threadId, msgs]) => {
          const latest = msgs[0];
          const insight = insightByEntity.get(latest.id);
          const fromParts = parseNameEmail(latest.from);
          return {
            id: threadId,
            subject: latest.subject || "(no subject)",
            latestMessageId: latest.id,
            from: fromParts,
            snippet: latest.snippet,
            receivedAt: latest.timestamp ? new Date(latest.timestamp).toISOString() : null,
            messageCount: msgs.length,
            priority: insight?.priority ?? "medium",
            priorityScore: insight?.priorityScore ?? 50,
            priorityReason: insight?.priorityReason ?? null,
          };
        })
        .slice(input.offset, input.offset + input.limit);

      return threads.sort((a, b) => (b.receivedAt ?? "").localeCompare(a.receivedAt ?? ""));
    }),

  /** All cached messages for one thread, oldest first (for the thread view). */
  getThread: publicProcedure
    .input(z.object({ threadId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const tenant = getTenant();
      // NOTE: filtering by threadId client-side because the reference
      // repo only demonstrates `contains`-style filters on `snippet`/
      // `subject` — an exact-match filter on a nested data field isn't
      // confirmed. Run `pnpm corsair schema gmail.db.messages.search` to
      // check whether `{ data: { threadId: { equals: ... } } }` works,
      // which would let you drop the `.list()` + filter pattern below.
      const all = await tenant.gmail.db.messages.list({ limit: 200, offset: 0 });
      const messages = sortMessagesNewestFirst(dedupeByEntityId(all).map(mapMessage))
        .filter((m) => m.threadId === input.threadId)
        .reverse(); // oldest first for thread display

      const [summary] = await ctx.db
        .select()
        .from(underpinThreadSummaries)
        .where(inArray(underpinThreadSummaries.threadId, [input.threadId]));

      return { threadId: input.threadId, messages, summary: summary ?? null };
    }),

  /** Generates (and caches) the AI Summary card for a thread on demand. */
  summarizeThread: publicProcedure
    .input(z.object({ threadId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const tenant = getTenant();
      const all = await tenant.gmail.db.messages.list({ limit: 200, offset: 0 });
      const messages = dedupeByEntityId(all)
        .map(mapMessage)
        .filter((m) => m.threadId === input.threadId);
      if (messages.length === 0) return null;

      const subject = messages[0]?.subject ?? "";
      const result = await summarizeThread(
        subject,
        messages.map((m) => ({ from: m.from, body: m.snippet })),
      );
      if (!result) return null;

      await ctx.db
        .insert(underpinThreadSummaries)
        .values({ threadId: input.threadId, ...result })
        .onConflictDoUpdate({
          target: underpinThreadSummaries.threadId,
          set: { ...result, updatedAt: new Date() },
        });
      return result;
    }),

  /**
   * Bonus task #3: scores one message with the cheap-model classifier and
   * upserts the result into underpin_email_insights. Call this from the
   * webhook handler for new mail, or on-demand from the UI.
   */
  classifyPriority: publicProcedure
    .input(z.object({ entityId: z.string().min(1), threadId: z.string().min(1), subject: z.string(), body: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await classifyEmailPriority(input.subject, input.body);
      await ctx.db
        .insert(underpinEmailInsights)
        .values({
          entityId: input.entityId,
          threadId: input.threadId,
          priority: result.priority,
          priorityScore: result.score,
          priorityReason: result.reason,
        })
        .onConflictDoUpdate({
          target: underpinEmailInsights.entityId,
          set: {
            priority: result.priority,
            priorityScore: result.score,
            priorityReason: result.reason,
            updatedAt: new Date(),
          },
        });
      return result;
    }),

  /**
   * UNVERIFIED — not demonstrated in the reference repo. Modeled directly
   * on Gmail's real REST API (`threads.modify` with `removeLabelIds`),
   * which Corsair's other endpoints (messages.send, threads.list) mirror
   * closely, but confirm with `pnpm corsair schema gmail.api.threads.modify`
   * before relying on this in production.
   */
  archiveThread: publicProcedure
    .input(z.object({ threadId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const tenant = getTenant();
      // @ts-expect-error — unverified endpoint, see comment above.
      return tenant.gmail.api.threads.modify({
        id: input.threadId,
        removeLabelIds: ["INBOX"],
      });
    }),
});
