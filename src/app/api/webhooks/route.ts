import { processWebhook } from "corsair";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { corsair } from "@/server/corsair";
import { env } from "@/env";
import { getTenant } from "@/server/lib/tenant";
import { classifyEmailPriority } from "@/lib/anthropic-agent";
import { embedText, isEmbeddingConfigured } from "@/lib/embeddings";
import { db } from "@/server/db";
import { underpinEmailInsights, underpinEmailEmbeddings } from "@/server/db/schema";

export async function POST(request: NextRequest) {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const contentType = request.headers.get("content-type");
  let body: string | Record<string, unknown>;
  if (contentType?.includes("application/json")) {
    body = await request.json();
  } else {
    const text = await request.text();
    body = text && text.trim() ? text : {};
  }

  const result = await processWebhook(corsair, headers, body, { tenantId: env.TENANT_ID });
  console.info("Plugin Processed:", result.plugin, result.action);

  // --- Underpin additions: enrich new mail as it arrives ------------------
  // Best-effort, fire-and-forget — never let a classification/embedding
  // failure turn into a failed webhook response (Corsair will retry the
  // delivery if we 5xx, and that's not what we want for our own enrichment
  // bugs). The exact shape of `result` for a new-message event isn't
  // documented in the reference repo, so this re-reads "needs enrichment"
  // messages from the cache rather than trusting a specific payload shape.
  if (result.plugin === "gmail") {
    void enrichRecentMessages().catch((err) =>
      console.error("[webhook] enrichment failed:", err),
    );
  }

  const responseHeaders = result.responseHeaders;
  const nextHeaders = new Headers();
  if (responseHeaders) {
    for (const [key, value] of Object.entries(responseHeaders)) {
      nextHeaders.set(key, value);
    }
  }

  if (!result.response) {
    return NextResponse.json(
      { success: false, message: "No matching webhook handler found" },
      { status: 404 },
    );
  }
  if (result.response !== undefined) {
    return NextResponse.json(result.response, { headers: nextHeaders });
  }
  return new NextResponse(null, { status: 200, headers: nextHeaders });
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}

/**
 * Pulls the most recent cached messages and classifies/embeds any that
 * don't have an insight row yet. Intentionally re-reads from the cache
 * (tenant.gmail.db.messages.list) rather than parsing the webhook payload
 * directly, since the cache shape is documented and the webhook payload
 * shape isn't.
 */
async function enrichRecentMessages() {
  const tenant = getTenant();
  const recent = await tenant.gmail.db.messages.list({ limit: 10, offset: 0 });

  for (const message of recent) {
    const entityId = message.entity_id;
    const threadId = message.data.threadId ?? entityId;
    const subject = message.data.subject ?? "";
    const text = message.data.body ?? message.data.snippet ?? "";

    const existing = await db.query.underpinEmailInsights.findFirst({
      where: (t, { eq }) => eq(t.entityId, entityId),
    });
    if (!existing) {
      const result = await classifyEmailPriority(subject, text);
      await db
        .insert(underpinEmailInsights)
        .values({
          entityId,
          threadId,
          priority: result.priority,
          priorityScore: result.score,
          priorityReason: result.reason,
        })
        .onConflictDoNothing();
    }

    if (isEmbeddingConfigured()) {
      const existingEmbedding = await db.query.underpinEmailEmbeddings.findFirst({
        where: (t, { eq }) => eq(t.entityId, entityId),
      });
      if (!existingEmbedding) {
        const embedding = await embedText(`${subject}\n${text}`);
        await db
          .insert(underpinEmailEmbeddings)
          .values({ entityId, threadId, embedding })
          .onConflictDoNothing();
      }
    }
  }
}
