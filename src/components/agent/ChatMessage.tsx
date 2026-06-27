import type { AgentMessage } from "@/lib/types";

const TOOL_ICON: Record<string, string> = {
  search_emails: "search",
  send_email: "mail",
  create_calendar_event: "event",
  search_calendar: "calendar_today",
};

export function ChatMessage({ message }: { message: AgentMessage }) {
  if (message.role === "user") {
    return (
      <div className="flex flex-col gap-2 items-end">
        <div className="bg-on-surface text-inverse-on-surface p-4 rounded-2xl rounded-tr-sm max-w-[80%] text-body-sm">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 items-start max-w-[80%]">
      <div className="glass-card p-4 rounded-2xl rounded-tl-sm w-full space-y-3 min-w-[250px]">
        {message.toolCalls && message.toolCalls.length > 0 && (
          <>
            <div className="flex items-center gap-2 text-body-xs text-on-surface-variant font-medium">
              <span className="material-symbols-outlined text-[14px] text-corsair-blue">api</span>
              {message.toolCalls.some((t) => t.status === "running") ? "Calling tools..." : "Tools used"}
            </div>
            <div className="pl-4 border-l-2 border-surface-variant space-y-2">
              {message.toolCalls.map((tc) => (
                <div
                  key={tc.id}
                  className={`flex items-center gap-2 text-body-xs ${
                    tc.status === "error" ? "text-error" : tc.status === "done" ? "text-secondary" : "text-on-surface-variant"
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {tc.status === "error" ? "error" : tc.status === "done" ? "check_circle" : "progress_activity"}
                  </span>
                  <span className="material-symbols-outlined text-[14px]">{TOOL_ICON[tc.tool] ?? "bolt"}</span>
                  {tc.label}
                </div>
              ))}
            </div>
          </>
        )}
        <div className="pt-2 text-body-sm border-t border-white/50 first:border-t-0 first:pt-0">{message.text}</div>
      </div>
    </div>
  );
}
