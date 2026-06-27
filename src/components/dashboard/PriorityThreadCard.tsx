import Link from "next/link";
import { priorityStyles, formatRelativeTime } from "@/lib/utils";
import type { Priority } from "@/lib/types";

interface PriorityThreadCardProps {
  threadId: string;
  fromName: string;
  subject: string;
  snippet: string;
  priority: Priority;
  priorityReason?: string | null;
  receivedAt?: string | null;
  focused?: boolean;
}

export function PriorityThreadCard({
  threadId,
  fromName,
  subject,
  snippet,
  priority,
  priorityReason,
  receivedAt,
  focused,
}: PriorityThreadCardProps) {
  const style = priorityStyles[priority];
  return (
    <Link
      href={`/inbox/${threadId}`}
      data-thread-id={threadId}
      className={`glass-card rounded-lg p-4 flex flex-col gap-2 transition-colors block ${
        focused ? "border-primary ring-2 ring-primary/30" : "hover:border-primary/30"
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="font-semibold text-body-sm truncate">{fromName || subject}</div>
        <span className={`chip shrink-0 ${style.chip}`}>{style.label}</span>
      </div>
      <div className="text-body-xs text-on-surface-variant line-clamp-2">{snippet || subject}</div>
      <div className="flex items-center justify-between mt-1">
        {priorityReason && (
          <span className="bg-white/60 text-body-xs px-2 py-1 rounded-md border border-white/80 truncate">
            AI: {priorityReason}
          </span>
        )}
        {receivedAt && <span className="text-body-xs text-on-surface-variant shrink-0">{formatRelativeTime(receivedAt)}</span>}
      </div>
    </Link>
  );
}
