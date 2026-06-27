// Local dev fallback data ONLY — for storybook-style empty states or UI
// work done before a database is wired up. The real data path is the tRPC
// routers (src/server/api/routers/*), which read from Corsair's cache via
// the `corsair` SDK. Nothing in the routers imports this file.

import type {
  EmailThread,
  CalendarEvent,
  AIDraft,
  AISuggestion,
  ActivityItem,
  ConnectionStatus,
} from "./types";

const now = () => new Date();
const iso = (offsetMinutes: number) =>
  new Date(now().getTime() + offsetMinutes * 60_000).toISOString();

export const mockThreads: EmailThread[] = [
  {
    id: "thr_1",
    subject: "Q3 proposal — feedback before Thursday",
    participants: [
      { name: "John Okafor", email: "john@brightpath.io" },
      { name: "You", email: "me@underpin.app" },
    ],
    messages: [
      {
        id: "msg_1",
        threadId: "thr_1",
        from: { name: "John Okafor", email: "john@brightpath.io" },
        to: [{ name: "You", email: "me@underpin.app" }],
        subject: "Q3 proposal — feedback before Thursday",
        snippet:
          "Wanted to get your eyes on the revised numbers before we send this to the board...",
        bodyText:
          "Hey — wanted to get your eyes on the revised numbers before we send this to the board on Thursday. Pricing changed in section 3, timeline moved up two weeks. Let me know if it works for you.",
        receivedAt: iso(-95),
        isUnread: true,
        priority: "high",
        priorityScore: 92,
        priorityReason: "Sender is a named contact, deadline mentioned (Thursday), board-level decision.",
        attachments: [
          { id: "att_1", filename: "Q3-proposal-v4.pdf", mimeType: "application/pdf", sizeBytes: 482_000 },
        ],
        labels: ["Work"],
      },
    ],
    aiSummary: {
      summary: "John needs sign-off on the revised Q3 proposal before Thursday's board meeting.",
      keyDecisions: ["Pricing updated in section 3", "Timeline moved up by two weeks"],
      actionItems: ["Review attached PDF", "Reply with approval or edits before Thursday"],
      peopleMentioned: ["John Okafor", "the board"],
      datesMentioned: ["Thursday"],
    },
  },
  {
    id: "thr_2",
    subject: "Re: Intro — Alex from Meridian Capital",
    participants: [
      { name: "Alex Chen", email: "alex@meridiancap.com" },
      { name: "You", email: "me@underpin.app" },
    ],
    messages: [
      {
        id: "msg_2",
        threadId: "thr_2",
        from: { name: "Alex Chen", email: "alex@meridiancap.com" },
        to: [{ name: "You", email: "me@underpin.app" }],
        subject: "Re: Intro — Alex from Meridian Capital",
        snippet: "Great catching up last week. Following up on the data room access...",
        bodyText:
          "Great catching up last week. Following up on the data room access we discussed — happy to hop on a call this week if useful.",
        receivedAt: iso(-240),
        isUnread: true,
        priority: "high",
        priorityScore: 81,
        priorityReason: "Active investor conversation with an open action item.",
        attachments: [],
        labels: ["Investors"],
      },
    ],
  },
  {
    id: "thr_3",
    subject: "Your weekly newsletter digest",
    participants: [
      { name: "Product Hunt Digest", email: "digest@producthunt.com" },
      { name: "You", email: "me@underpin.app" },
    ],
    messages: [
      {
        id: "msg_3",
        threadId: "thr_3",
        from: { name: "Product Hunt Digest", email: "digest@producthunt.com" },
        to: [{ name: "You", email: "me@underpin.app" }],
        subject: "Your weekly newsletter digest",
        snippet: "Top launches this week, curated for you...",
        bodyText: "Top launches this week, curated for you.",
        receivedAt: iso(-600),
        isUnread: false,
        priority: "low",
        priorityScore: 12,
        priorityReason: "Bulk newsletter sender, no direct action requested.",
        attachments: [],
        labels: ["Newsletter"],
      },
    ],
  },
  {
    id: "thr_4",
    subject: "Design review notes — onboarding v3",
    participants: [
      { name: "Priya Nair", email: "priya@underpin.app" },
      { name: "You", email: "me@underpin.app" },
    ],
    messages: [
      {
        id: "msg_4",
        threadId: "thr_4",
        from: { name: "Priya Nair", email: "priya@underpin.app" },
        to: [{ name: "You", email: "me@underpin.app" }],
        subject: "Design review notes — onboarding v3",
        snippet: "Left comments on the Figma file, mostly around step 3 copy...",
        bodyText: "Left comments on the Figma file, mostly around step 3 copy. Nothing blocking.",
        receivedAt: iso(-30),
        isUnread: true,
        priority: "medium",
        priorityScore: 54,
        priorityReason: "Internal teammate, non-blocking feedback.",
        attachments: [],
        labels: ["Design"],
      },
    ],
  },
];

export const mockEvents: CalendarEvent[] = [
  {
    id: "evt_1",
    title: "Pipeline review w/ Sales",
    start: iso(60),
    end: iso(120),
    location: "Conference Room A",
    videoLink: "https://meet.google.com/abc-defg-hij",
    attendees: [
      { name: "You", email: "me@underpin.app", status: "accepted" },
      { name: "Maria Lopez", email: "maria@underpin.app", status: "accepted" },
      { name: "Sam Patel", email: "sam@underpin.app", status: "needs_action" },
    ],
    notes: "Bring updated Q3 forecast.",
    threadId: undefined,
    hasConflict: false,
    travelTimeMinutes: 0,
  },
  {
    id: "evt_2",
    title: "Call with Alex (Meridian Capital)",
    start: iso(260),
    end: iso(290),
    videoLink: "https://meet.google.com/xyz-uvwx-yz",
    attendees: [
      { name: "You", email: "me@underpin.app", status: "accepted" },
      { name: "Alex Chen", email: "alex@meridiancap.com", status: "tentative" },
    ],
    threadId: "thr_2",
    hasConflict: false,
  },
  {
    id: "evt_3",
    title: "1:1 with Priya",
    start: iso(380),
    end: iso(410),
    attendees: [
      { name: "You", email: "me@underpin.app", status: "accepted" },
      { name: "Priya Nair", email: "priya@underpin.app", status: "accepted" },
    ],
    hasConflict: true,
    travelTimeMinutes: 0,
  },
];

export const mockDrafts: AIDraft[] = [
  {
    id: "draft_1",
    threadId: "thr_1",
    to: [{ name: "John Okafor", email: "john@brightpath.io" }],
    subject: "Re: Q3 proposal — feedback before Thursday",
    bodyText:
      "Hi John — numbers look good, section 3 pricing works on our end. One small note on the timeline, can we keep two days of buffer before the board sees it? Happy to talk it through today.",
    createdAt: iso(-10),
    status: "draft",
  },
  {
    id: "draft_2",
    threadId: "thr_4",
    to: [{ name: "Priya Nair", email: "priya@underpin.app" }],
    subject: "Re: Design review notes — onboarding v3",
    bodyText: "Thanks Priya — agree on the step 3 copy, I'll tighten it up today.",
    createdAt: iso(-5),
    status: "draft",
  },
];

export const mockSuggestions: AISuggestion[] = [
  {
    id: "sugg_1",
    kind: "reply",
    title: "Reply to John's email",
    description: "A draft is ready for the Q3 proposal thread.",
    relatedThreadId: "thr_1",
  },
  {
    id: "sugg_2",
    kind: "reschedule",
    title: "Move 1:1 with Priya to 3 PM",
    description: "It currently overlaps with the Sales pipeline review.",
    relatedEventId: "evt_3",
  },
  {
    id: "sugg_3",
    kind: "follow_up",
    title: "Schedule follow-up with Alex",
    description: "Suggest a 30-min slot this week for the Meridian Capital data room call.",
    relatedThreadId: "thr_2",
  },
  {
    id: "sugg_4",
    kind: "archive",
    title: "Archive 6 newsletters",
    description: "Low-priority bulk senders from the last 7 days.",
  },
  {
    id: "sugg_5",
    kind: "accept_invite",
    title: "Accept calendar invite",
    description: "Sam Patel hasn't responded to the Pipeline review invite.",
    relatedEventId: "evt_1",
  },
];

export const mockActivity: ActivityItem[] = [
  { id: "act_1", kind: "new_email", title: "New email from Priya Nair", timestamp: iso(-30) },
  { id: "act_2", kind: "draft_saved", title: "Draft saved for John Okafor", timestamp: iso(-10) },
  { id: "act_3", kind: "agent_task_completed", title: "Agent drafted reply to Alex Chen", detail: "via Agent Chat", timestamp: iso(-45) },
  { id: "act_4", kind: "calendar_updated", title: "Pipeline review moved to Conference Room A", timestamp: iso(-70) },
  { id: "act_5", kind: "webhook_received", title: "New calendar invite received", detail: "Corsair webhook", timestamp: iso(-90) },
  { id: "act_6", kind: "meeting_accepted", title: "Maria Lopez accepted Pipeline review", timestamp: iso(-100) },
];

export const mockConnectionStatus: ConnectionStatus = {
  google: false,
  corsair: false,
  webhooks: false,
  search: false,
  vectorSearch: false,
  aiDrafting: false,
};

export function getMockTodayFocus() {
  return {
    meetingsToday: mockEvents.length,
    unreadImportant: mockThreads.filter((t) => t.messages[0].isUnread && t.messages[0].priority === "high").length,
    pendingReplies: mockDrafts.filter((d) => d.status === "draft").length,
    upcomingDeadlines: 1,
  };
}
