// ---------------------------------------------------------------------------
// Anthropic SDK wiring
// ---------------------------------------------------------------------------
// Two jobs live here:
//   1. classifyEmailPriority — a cheap-model call that scores incoming
//      email priority (bonus task #3 in the hackathon brief).
//   2. Agent chat (bonus task #1) — runAgentTurnViaMcp tries Corsair's MCP
//      server directly; runAgentTurnWithTools is the fallback standard
//      tool-use loop, wired to our own tRPC routers from the route handler.
//      See the route handler (app/api/agent/chat/route.ts) for how the two
//      are combined.
//
// NOTE ON THE MCP BETA: passing `mcp_servers` is a beta surface on the
// Anthropic Messages API and both the request shape and the SDK's beta
// namespace/header have moved before. Treat the calls below as the right
// *shape*, but confirm against @anthropic-ai/sdk's current README before
// shipping — I can't hit the live API or npm registry from this sandbox to
// verify the exact version you'll install.

import Anthropic from "@anthropic-ai/sdk";
import type { AgentMessage, AgentToolCall, Priority } from "./types";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const CORSAIR_MCP_URL = process.env.CORSAIR_MCP_URL;

const client = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null;

// Cheap, fast model for high-volume classification work.
const PRIORITY_MODEL = "claude-haiku-4-5-20251001";
// Capable model for agentic tool-use (sending mail, creating events).
const AGENT_MODEL = "claude-sonnet-4-6";

// ---- Priority classification (bonus task #3) -------------------------------

interface PriorityResult {
  priority: Priority;
  score: number; // 0-100
  reason: string;
}

const PRIORITY_FALLBACK_KEYWORDS: Record<Priority, string[]> = {
  high: ["urgent", "asap", "deadline", "board", "invoice overdue", "contract"],
  medium: ["review", "feedback", "follow up", "question"],
  low: ["newsletter", "digest", "unsubscribe", "no-reply", "noreply"],
};

function heuristicPriority(subject: string, body: string): PriorityResult {
  const text = `${subject} ${body}`.toLowerCase();
  for (const word of PRIORITY_FALLBACK_KEYWORDS.high) {
    if (text.includes(word)) return { priority: "high", score: 80, reason: `Keyword match: "${word}" (heuristic fallback, no ANTHROPIC_API_KEY set)` };
  }
  for (const word of PRIORITY_FALLBACK_KEYWORDS.low) {
    if (text.includes(word)) return { priority: "low", score: 15, reason: `Keyword match: "${word}" (heuristic fallback, no ANTHROPIC_API_KEY set)` };
  }
  return { priority: "medium", score: 50, reason: "No strong signal (heuristic fallback, no ANTHROPIC_API_KEY set)" };
}

export async function classifyEmailPriority(
  subject: string,
  body: string
): Promise<PriorityResult> {
  if (!client) {
    console.warn("[anthropic-agent] ANTHROPIC_API_KEY unset — using keyword heuristic, not an LLM.");
    return heuristicPriority(subject, body);
  }

  const response = await client.messages.create({
    model: PRIORITY_MODEL,
    max_tokens: 200,
    system:
      "You triage email priority for a busy professional. Respond with ONLY a JSON object: " +
      '{"priority": "high"|"medium"|"low", "score": 0-100, "reason": "one short sentence"}. ' +
      "No markdown, no preamble.",
    messages: [
      {
        role: "user",
        content: `Subject: ${subject}\n\nBody:\n${body.slice(0, 2000)}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return heuristicPriority(subject, body);
  }

  try {
    const cleaned = textBlock.text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned) as PriorityResult;
    return parsed;
  } catch {
    console.warn("[anthropic-agent] failed to parse priority response, falling back to heuristic");
    return heuristicPriority(subject, body);
  }
}

// ---- Thread summarization (AI Summary card) --------------------------------

export interface ThreadSummaryResult {
  summary: string;
  keyDecisions: string[];
  actionItems: string[];
  peopleMentioned: string[];
  datesMentioned: string[];
}

export async function summarizeThread(
  subject: string,
  messages: { from: string; body: string }[],
): Promise<ThreadSummaryResult | null> {
  if (!client) {
    console.warn("[anthropic-agent] ANTHROPIC_API_KEY unset — thread summarization disabled.");
    return null;
  }

  const transcript = messages
    .map((m, i) => `[${i + 1}] From: ${m.from}\n${m.body.slice(0, 1500)}`)
    .join("\n\n");

  const response = await client.messages.create({
    model: AGENT_MODEL,
    max_tokens: 500,
    system:
      "Summarize this email thread for someone who hasn't read it. Respond with ONLY a JSON object: " +
      '{"summary": "2-3 sentences", "keyDecisions": string[], "actionItems": string[], ' +
      '"peopleMentioned": string[], "datesMentioned": string[]}. Empty arrays are fine. No markdown, no preamble.',
    messages: [{ role: "user", content: `Subject: ${subject}\n\n${transcript.slice(0, 6000)}` }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") return null;

  try {
    const cleaned = textBlock.text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned) as ThreadSummaryResult;
  } catch {
    console.warn("[anthropic-agent] failed to parse thread summary response");
    return null;
  }
}

// ---- Agent chat (bonus task #1) --------------------------------------------
// Two paths, tried in this order:
//   1. Corsair MCP, if CORSAIR_MCP_URL is set — this is the literal "Corsair
//      MCP" the hackathon brief calls out for bonus credit. UNVERIFIED shape;
//      see the file-level note above.
//   2. A standard Anthropic tool-use loop against tools YOU provide via
//      `executeTool` (see app/api/agent/chat/route.ts, which wires these to
//      our own tRPC routers). This path doesn't depend on Corsair's MCP
//      endpoint at all, so the demo works even if you never get the MCP URL
//      confirmed — it's the safe fallback for the demo video.
//
// Tool execution is injected (not imported here) deliberately: this file
// must not import server/api/root, because root.ts imports the gmail
// router, which imports classifyEmailPriority from *this* file — importing
// root.ts back from here would be a circular import.

export interface AgentTurnResult {
  reply: string;
  toolCalls: AgentToolCall[];
}

export interface AgentToolDefinition {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

export type ToolExecutor = (name: string, input: Record<string, unknown>) => Promise<unknown>;

const TOOL_LABELS: Record<string, string> = {
  search_emails: "Searching Gmail...",
  send_email: "Sending email...",
  create_calendar_event: "Creating calendar event...",
  search_calendar: "Searching calendar...",
};

export async function runAgentTurnViaMcp(
  history: AgentMessage[],
  newUserMessage: string,
): Promise<AgentTurnResult | null> {
  if (!client || !CORSAIR_MCP_URL) return null;

  const messages: Anthropic.MessageParam[] = [
    ...history.map((m) => ({ role: m.role, content: m.text })),
    { role: "user" as const, content: newUserMessage },
  ];

  const response = await client.beta.messages.create({
    model: AGENT_MODEL,
    max_tokens: 1024,
    betas: ["mcp-client-2025-04-04"],
    system:
      "You are Underpin's agent. You can search, draft, and send Gmail messages and " +
      "create/update Google Calendar events via the connected Corsair MCP tools. " +
      "Always confirm what you did in one short sentence after acting.",
    mcp_servers: [{ type: "url", url: CORSAIR_MCP_URL, name: "corsair" }],
    messages,
  } as Anthropic.Beta.Messages.MessageCreateParams);

  const toolCalls: AgentToolCall[] = [];
  let reply = "";
  for (const block of response.content as Array<Record<string, unknown>>) {
    if (block.type === "text" && typeof block.text === "string") reply += block.text;
    if (block.type === "mcp_tool_use" && typeof block.name === "string") {
      toolCalls.push({
        id: String(block.id ?? `tool_${toolCalls.length}`),
        tool: block.name as AgentToolCall["tool"],
        label: TOOL_LABELS[block.name] ?? `Calling ${block.name}...`,
        status: "done",
      });
    }
  }
  return { reply: reply || "Done.", toolCalls };
}

export async function runAgentTurnWithTools(
  history: AgentMessage[],
  newUserMessage: string,
  tools: AgentToolDefinition[],
  executeTool: ToolExecutor,
): Promise<AgentTurnResult> {
  if (!client) {
    return {
      reply: "ANTHROPIC_API_KEY isn't set, so agent chat is disabled. Add it to .env.local.",
      toolCalls: [],
    };
  }

  const messages: Anthropic.MessageParam[] = [
    ...history.map((m) => ({ role: m.role, content: m.text })),
    { role: "user" as const, content: newUserMessage },
  ];

  const toolCalls: AgentToolCall[] = [];
  let finalText = "";

  // Tool-use is a loop: model responds with tool_use blocks, we run them,
  // feed tool_result back, repeat until it responds with text only (or we
  // hit a sane turn limit so a buggy tool can't loop forever).
  for (let turn = 0; turn < 6; turn++) {
    const response = await client.messages.create({
      model: AGENT_MODEL,
      max_tokens: 1024,
      system:
        "You are Underpin's agent. You can search, draft, and send Gmail messages and " +
        "create/update Google Calendar events using the provided tools. Always confirm " +
        "what you did in one short sentence after acting.",
      tools: tools as Anthropic.Tool[],
      messages,
    });

    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
    );
    const textBlocks = response.content.filter(
      (b): b is Anthropic.TextBlock => b.type === "text",
    );
    finalText = textBlocks.map((b) => b.text).join("\n") || finalText;

    if (toolUseBlocks.length === 0) break;

    messages.push({ role: "assistant", content: response.content });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of toolUseBlocks) {
      const call: AgentToolCall = {
        id: block.id,
        tool: block.name as AgentToolCall["tool"],
        label: TOOL_LABELS[block.name] ?? `Calling ${block.name}...`,
        status: "running",
      };
      toolCalls.push(call);
      try {
        const result = await executeTool(block.name, block.input as Record<string, unknown>);
        call.status = "done";
        call.resultSummary = typeof result === "string" ? result : JSON.stringify(result).slice(0, 300);
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(result),
        });
      } catch (err) {
        call.status = "error";
        call.resultSummary = err instanceof Error ? err.message : String(err);
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: `Error: ${call.resultSummary}`,
          is_error: true,
        });
      }
    }
    messages.push({ role: "user", content: toolResults });
  }

  return { reply: finalText || "Done.", toolCalls };
}

/** Tool schemas for the fallback path — kept here so the route handler only needs to supply execution, not schemas. */
export const AGENT_TOOLS: AgentToolDefinition[] = [
  {
    name: "search_emails",
    description: "Search the user's cached Gmail messages by keyword.",
    input_schema: {
      type: "object",
      properties: { query: { type: "string" } },
      required: ["query"],
    },
  },
  {
    name: "send_email",
    description:
      "Send an email via Gmail. `to` must be a bare email address (e.g. \"jane@example.com\"), " +
      "not a \"Name <email>\" header — if search_emails returned a sender in that format, extract just the address.",
    input_schema: {
      type: "object",
      properties: {
        to: { type: "string" },
        subject: { type: "string" },
        body: { type: "string" },
      },
      required: ["to", "subject", "body"],
    },
  },
  {
    name: "create_calendar_event",
    description:
      "Create a Google Calendar event. If attendees are given, invites are sent (sendUpdates=all); otherwise it's saved silently.",
    input_schema: {
      type: "object",
      properties: {
        summary: { type: "string" },
        start: { type: "string", description: "ISO 8601 datetime" },
        end: { type: "string", description: "ISO 8601 datetime" },
        attendees: { type: "array", items: { type: "string" }, description: "Email addresses" },
      },
      required: ["summary", "start", "end"],
    },
  },
  {
    name: "search_calendar",
    description: "Search the user's calendar events in a given week range by keyword.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string" },
        weekStart: { type: "string", description: "ISO 8601 datetime" },
        weekEnd: { type: "string", description: "ISO 8601 datetime" },
      },
      required: ["query", "weekStart", "weekEnd"],
    },
  },
];
