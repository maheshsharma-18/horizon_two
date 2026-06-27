// Shared domain types. These shapes are the contract between the UI and
// the tRPC routers in src/server/api/routers/*, which read from Corsair's
// cache via the `corsair` SDK (see src/server/lib/tenant.ts).

export type Priority = "high" | "medium" | "low";

export interface EmailAttachment {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
}

export interface EmailMessage {
  id: string;
  threadId: string;
  from: { name: string; email: string };
  to: { name: string; email: string }[];
  subject: string;
  snippet: string;
  bodyHtml?: string;
  bodyText: string;
  receivedAt: string; // ISO timestamp
  isUnread: boolean;
  priority: Priority;
  priorityScore: number; // 0-100, from the priority-classifier LLM call
  priorityReason?: string;
  attachments: EmailAttachment[];
  labels: string[];
}

export interface EmailThread {
  id: string;
  subject: string;
  participants: { name: string; email: string }[];
  messages: EmailMessage[];
  aiSummary?: {
    summary: string;
    keyDecisions: string[];
    actionItems: string[];
    peopleMentioned: string[];
    datesMentioned: string[];
  };
}

export interface CalendarAttendee {
  name: string;
  email: string;
  status: "accepted" | "declined" | "tentative" | "needs_action";
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO timestamp
  end: string; // ISO timestamp
  location?: string;
  videoLink?: string;
  attendees: CalendarAttendee[];
  notes?: string;
  threadId?: string; // linked email thread, if any
  hasConflict?: boolean;
  travelTimeMinutes?: number;
}

export interface AIDraft {
  id: string;
  threadId?: string;
  to: { name: string; email: string }[];
  subject: string;
  bodyText: string;
  createdAt: string;
  status: "draft" | "sent";
}

export type SuggestionKind =
  | "reply"
  | "reschedule"
  | "follow_up"
  | "archive"
  | "accept_invite"
  | "priority_review";

export interface AISuggestion {
  id: string;
  kind: SuggestionKind;
  title: string;
  description: string;
  relatedThreadId?: string;
  relatedEventId?: string;
}

export type ActivityKind =
  | "new_email"
  | "calendar_updated"
  | "meeting_accepted"
  | "draft_saved"
  | "agent_task_completed"
  | "webhook_received";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  title: string;
  detail?: string;
  timestamp: string;
}

export type AgentToolName =
  | "search_emails"
  | "send_email"
  | "create_calendar_event"
  | "search_calendar";

export interface AgentToolCall {
  id: string;
  tool: AgentToolName;
  label: string; // e.g. "Searching Gmail..."
  status: "running" | "done" | "error";
  resultSummary?: string;
}

export interface AgentMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  toolCalls?: AgentToolCall[];
  createdAt: string;
}

export type WorkflowProfile =
  | "business"
  | "founder"
  | "student"
  | "recruiter"
  | "sales"
  | "developer"
  | "personal";

export interface AIPreferences {
  aiDrafting: boolean;
  smartPriority: boolean;
  realtimeNotifications: boolean;
  autonomousScheduling: boolean;
  keyboardShortcuts: boolean;
  mcpAgentChat: boolean;
}

export interface ConnectionStatus {
  google: boolean;
  corsair: boolean;
  webhooks: boolean;
  search: boolean;
  vectorSearch: boolean;
  aiDrafting: boolean;
}
