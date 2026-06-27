import {
  pgTable,
  text,
  jsonb,
  timestamp,
  integer,
  boolean,
  vector,
  index,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Corsair-owned tables — copied verbatim from corsairdev/google-demo's
// drizzle schema. `createCorsair({ database: conn, ... })` reads/writes
// these directly; don't rename columns or you'll break the SDK's queries.
// Run `pnpm db:generate && pnpm db:push` after any schema change.
// ---------------------------------------------------------------------------

export const corsairIntegrations = pgTable("corsair_integrations", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  name: text("name").notNull(),
  config: jsonb("config").notNull().default({}),
  dek: text("dek"),
});

export const corsairAccounts = pgTable("corsair_accounts", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  tenantId: text("tenant_id").notNull(),
  integrationId: text("integration_id").notNull().references(() => corsairIntegrations.id),
  config: jsonb("config").notNull().default({}),
  dek: text("dek"),
});

export const corsairEntities = pgTable("corsair_entities", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  accountId: text("account_id").notNull().references(() => corsairAccounts.id),
  entityId: text("entity_id").notNull(),
  entityType: text("entity_type").notNull(),
  version: text("version").notNull(),
  data: jsonb("data").notNull().default({}),
});

export const corsairEvents = pgTable("corsair_events", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  accountId: text("account_id").notNull().references(() => corsairAccounts.id),
  eventType: text("event_type").notNull(),
  payload: jsonb("payload").notNull().default({}),
  status: text("status"),
});

// ---------------------------------------------------------------------------
// Underpin-owned tables — our additions on top of Corsair's cache.
// Keyed by Corsair's `entity_id` (the Gmail message ID), never duplicating
// what Corsair already caches in `corsair_entities.data`.
// ---------------------------------------------------------------------------

/**
 * Bonus task #3 (priority filtering): cache of the Anthropic classifier's
 * output per Gmail message, so we score once on webhook arrival instead of
 * on every dashboard render.
 */
export const underpinEmailInsights = pgTable("underpin_email_insights", {
  entityId: text("entity_id").primaryKey(), // == corsair_entities.entity_id for the gmail message
  threadId: text("thread_id").notNull(),
  priority: text("priority").notNull().default("medium"), // "high" | "medium" | "low"
  priorityScore: integer("priority_score").notNull().default(50),
  priorityReason: text("priority_reason"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Bonus task #6 (vector search): one embedding per cached Gmail message.
 * Dimension assumes a 1536-dim embedding model — adjust to match whatever
 * model you standardize on before backfilling existing rows.
 *
 * PREREQUISITE: run `create extension if not exists vector;` on your
 * Postgres database BEFORE `pnpm db:push` — drizzle-kit won't create the
 * extension for you. Also confirm `vector()` / `.using("hnsw", ...)` match
 * the drizzle-orm version that actually installs (pgvector support landed
 * in drizzle-orm fairly recently; if `db:generate` errors on this table,
 * check the changelog for the installed version and adjust).
 */
export const underpinEmailEmbeddings = pgTable(
  "underpin_email_embeddings",
  {
    entityId: text("entity_id").primaryKey(),
    threadId: text("thread_id").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    embeddingIdx: index("underpin_email_embeddings_idx").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops"),
    ),
  }),
);

/** Per-thread AI summary (key decisions / action items / people / dates). */
export const underpinThreadSummaries = pgTable("underpin_thread_summaries", {
  threadId: text("thread_id").primaryKey(),
  summary: text("summary").notNull(),
  keyDecisions: jsonb("key_decisions").$type<string[]>().notNull().default([]),
  actionItems: jsonb("action_items").$type<string[]>().notNull().default([]),
  peopleMentioned: jsonb("people_mentioned").$type<string[]>().notNull().default([]),
  datesMentioned: jsonb("dates_mentioned").$type<string[]>().notNull().default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Captured at the end of the onboarding wizard (step 3-4 answers). */
export const underpinOnboardingProfile = pgTable("underpin_onboarding_profile", {
  tenantId: text("tenant_id").primaryKey(),
  workflowProfile: text("workflow_profile"), // business | founder | student | recruiter | sales | developer | personal
  aiDrafting: boolean("ai_drafting").notNull().default(true),
  smartPriority: boolean("smart_priority").notNull().default(true),
  realtimeNotifications: boolean("realtime_notifications").notNull().default(true),
  autonomousScheduling: boolean("autonomous_scheduling").notNull().default(true),
  keyboardShortcuts: boolean("keyboard_shortcuts").notNull().default(true),
  mcpAgentChat: boolean("mcp_agent_chat").notNull().default(true),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});
