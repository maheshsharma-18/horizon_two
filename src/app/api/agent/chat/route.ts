import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import {
  AGENT_TOOLS,
  runAgentTurnViaMcp,
  runAgentTurnWithTools,
} from "@/lib/anthropic-agent";
import { createCaller } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";
import type { AgentMessage } from "@/lib/types";

const requestSchema = z.object({
  message: z.string().min(1),
  history: z
    .array(
      z.object({
        id: z.string(),
        role: z.enum(["user", "assistant"]),
        text: z.string(),
        createdAt: z.string(),
      }),
    )
    .default([]),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { message, history } = parsed.data;

  // Path 1: Corsair MCP, if configured (see lib/anthropic-agent.ts note on
  // why this is unverified). Falls through to local tool-use on null.
  const mcpResult = await runAgentTurnViaMcp(history as AgentMessage[], message).catch(
    (err) => {
      console.error("[agent] MCP path failed, falling back to tool-use:", err);
      return null;
    },
  );
  if (mcpResult) {
    return NextResponse.json(mcpResult);
  }

  // Path 2: tool-use against our own tRPC routers.
  const caller = createCaller(await createTRPCContext({ headers: request.headers }));

  const result = await runAgentTurnWithTools(
    history as AgentMessage[],
    message,
    AGENT_TOOLS,
    async (name, input) => {
      switch (name) {
        case "search_emails":
          return caller.gmail.listThreads({ query: input.query as string, limit: 10, offset: 0 });
        case "send_email":
          return caller.gmail.sendEmail({
            to: input.to as string,
            subject: input.subject as string,
            body: input.body as string,
          });
        case "create_calendar_event": {
          const attendees = (input.attendees as string[] | undefined) ?? [];
          if (attendees.length > 0) {
            return caller.calendar.sendInvite({
              summary: input.summary as string,
              start: input.start as string,
              end: input.end as string,
              attendees,
            });
          }
          return caller.calendar.createDraft({
            summary: input.summary as string,
            start: input.start as string,
            end: input.end as string,
          });
        }
        case "search_calendar":
          return caller.calendar.searchEvents({
            query: input.query as string,
            weekStart: input.weekStart as string,
            weekEnd: input.weekEnd as string,
            limit: 25,
            offset: 0,
          });
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    },
  );

  return NextResponse.json(result);
}
