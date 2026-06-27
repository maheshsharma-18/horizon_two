# Underpin — AI workspace for Gmail & Calendar

Built on Corsair's Gmail + Google Calendar integration, in the same visual
language as the marketing site.

## Architecture

```
Next.js (App Router)
├─ tRPC routers (src/server/api/routers/*)   ← all Gmail/Calendar reads & writes go through here
│   ├─ gmail.ts        — list/search/send/draft, thread grouping, priority join
│   ├─ calendar.ts      — list/search/create/invite, week filtering
│   ├─ insights.ts      — vector search, activity feed, rule-based suggestions
│   └─ onboarding.ts    — wizard state
├─ Corsair SDK (src/server/corsair.ts)        ← createCorsair({ plugins: [gmail(), googlecalendar()] })
│   tenant.gmail.api.*        — live Gmail API calls
│   tenant.gmail.db.*         — Corsair's own Postgres cache (fast reads)
│   tenant.googlecalendar.*   — same pattern for Calendar
├─ Drizzle (src/server/db/schema.ts)
│   corsair_*                 — Corsair's own tables (don't rename columns)
│   underpin_email_insights     — our priority classifier cache
│   underpin_email_embeddings   — our pgvector embeddings (semantic search)
│   underpin_thread_summaries   — our AI thread summaries
│   underpin_onboarding_profile — wizard answers
└─ Webhook handler (src/app/api/webhooks/route.ts)
    processWebhook() updates Corsair's cache, then we classify priority +
    backfill an embedding for any newly-cached message.
```

**No Gmail/Calendar data is ever hardcoded.** Every read goes through
`tenant.gmail.db.*` (Corsair's live cache) or `tenant.gmail.api.*` (a live
Google API call via Corsair). `src/lib/mock-data.ts` exists only as
storybook-style fixtures for UI work and is never imported by a router.

## Layout: 2 columns, not 3

The original spec called for a 3-column shell (sidebar / main / persistent
AI context panel) on every screen. I cut the third column: on Agent Chat
the conversation already *is* the AI surface, on Settings the same
connection status is already in the main content, and Calendar has its own
"Smart Assistant" panel — a global rail repeating the same info on every
page added width without adding information. The "Powered by Corsair"
status that lived there now appears on the landing page (live, not
decorative) and in Settings; "Suggested Actions" already lives in the
dashboard's Today's Focus card. If you'd rather have it back globally, the
old component is straightforward to recreate from `insights.connectionStatus`
+ `insights.suggestions` — both routers are unchanged.

## Landing page & "logged in" routing

`/` is a real marketing page now (it wasn't before — the previous build
only had the authenticated app). Since this is a single-tenant demo with no
per-browser login system (Corsair's OAuth is tenant-level via the CLI, not
end-user-level), "logged in" is modeled as **"this tenant has completed
onboarding"** (`underpin_onboarding_profile.completed_at`). `app/page.tsx`
checks that server-side: if set, it redirects straight to `/dashboard`
before the landing page ever renders; otherwise you see the marketing page.
`/onboarding` has the same guard so a returning user can't land back in the
wizard either.

I rewrote the landing copy rather than porting your uploaded `index.html`
verbatim — that file's actual content (pricing tiers, an "Export my code"
FAQ, a "describe the app you want to build" hero) describes a different
product (an AI app-builder), including unfinished placeholder text. I kept
the visual language (glass cards, gradient blobs, type scale, pill buttons —
all the same Tailwind tokens) and wrote new copy that's actually about
Gmail/Calendar.

## Branding

`components/ui/PushpinLogo.tsx` is your pushpin mark as one `currentColor`
SVG component — no separate light/dark files needed, it's recolored via
Tailwind text-color classes wherever it's used (sidebar, onboarding,
landing nav/footer).

## Setup

1. `pnpm install`
2. Postgres running locally (or update `DATABASE_URL`), with `pgvector`
   available: `create extension if not exists vector;`
3. Copy `.env.example` → `.env.local`, fill in `DATABASE_URL` and
   `CORSAIR_KEK` (generate with `openssl rand -base64 32`).
4. Follow the Corsair setup sequence from the hackathon's reference repo
   (`corsairdev/google-demo`'s README/AGENT_PROMPT.md) — `pnpm corsair
   setup --gmail ...`, `--googlecalendar ...`, then `pnpm corsair auth
   --plugin=gmail --tenant=dev` (and the same for googlecalendar), then
   `--webhooks` for both.
5. `pnpm db:generate && pnpm db:push` — creates Corsair's tables AND
   Underpin's own (insights/embeddings/onboarding) in one schema.
6. Add `ANTHROPIC_API_KEY` to enable agent chat + priority classification.
   Add `VOYAGE_API_KEY` to enable semantic search (optional — Search and the
   command palette fall back to keyword search when it's unset, never to
   fake results).
7. `pnpm dev`. Expose `/api/webhooks` via ngrok for real-time updates.

## Keyboard shortcuts

Global: `c` compose, `/` open command palette, `⌘/Ctrl K` command palette.
Inbox list: `j`/`k` move focus, `↵`/`o`/`r` open focused thread, `e` archive.
Thread view: `r` focus reply box, `e` archive, `Esc` back to inbox. All of
them ignore keystrokes while you're typing in a field (`isTypingTarget` in
`lib/utils.ts`).

## What's verified vs. what isn't

Everything in `gmail.ts`/`calendar.ts` marked **without** a comment is
copied near-verbatim from a working reference implementation
(`corsairdev/google-demo`) and should work as-is.

Three things are explicitly **unverified** — I don't have network access
to confirm them against Corsair's live API, and the reference repo doesn't
demonstrate them. Each is commented at its definition with what to check:

- `gmail.archiveThread` — guessed at `threads.modify`, mirroring Gmail's
  real REST API. Confirm with `pnpm corsair schema gmail.api.threads.modify`.
- `calendar.reschedule` — guessed at `events.patch`, same reasoning.
  Confirm with `pnpm corsair schema googlecalendar.api.events.patch`.
- `CORSAIR_MCP_URL` (agent chat) — the reference repo only shows tRPC/direct
  calls, never Corsair's MCP server. Agent chat tries MCP first if the URL
  is set, and **falls back to a standard Anthropic tool-use loop against
  our own tRPC routers** if it isn't — so agent chat works either way, but
  only the MCP path is literally "Corsair MCP" for bonus-task credit.
- The webhook-event `eventType` naming (`gmail.message.created`, etc.) used
  to drive the Activity Timeline is a guess at Corsair's convention — check
  `corsair_events.event_type` in Postgres after your first real webhook and
  adjust `insights.ts`'s `ACTIVITY_KIND_BY_EVENT_TYPE` map if it differs.

Run `pnpm corsair list` and `pnpm corsair schema <endpoint>` before trusting
any Corsair call you haven't seen demonstrated — that's the CLI-discovery
workflow the reference repo's AGENT_PROMPT.md insists on, and it's the
fastest way to close these four gaps.

## Hackathon bonus tasks — where each one lives

| Bonus task | Implementation |
|---|---|
| Agent chat via Corsair MCP | `app/api/agent/chat/route.ts` + `lib/anthropic-agent.ts` |
| Realtime webhooks | `app/api/webhooks/route.ts` |
| Priority filtering (cheap LLM) | `lib/anthropic-agent.ts:classifyEmailPriority`, cached in `underpin_email_insights` |
| Keyboard shortcuts | `components/shortcuts/GlobalShortcuts.tsx` + `InboxList.tsx` + `ThreadShortcuts.tsx` — see table above, not just Cmd+K |
| Corsair search API + advanced search | `gmail.db.messages.search` (Corsair's cache search) + `lib/search-query.ts` parses `from:`/`after:`/`before:`/`is:` on the Search page |
| Vector DB / fast local search | `underpin_email_embeddings` (pgvector) + `insights.vectorSearch`, actually consumed by Search page + Command Palette (re-ranks results when configured, shows a "Semantic" badge) |

## Known gaps

- `has:attachment` is parsed (so it doesn't pollute the keyword search) but
  not filtered on — I never confirmed Corsair's cached message shape
  exposes attachment metadata, so I didn't fake it. The Search page shows
  an inline note when you type it.
- Reschedule suggests moving the later-starting event in a conflict to
  right after the earlier one ends; the earlier event still shows a
  "Conflict" badge but no button of its own (only one side of the pair
  needs to move).
