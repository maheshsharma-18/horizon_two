import { notFound } from "next/navigation";
import { api } from "@/trpc/server";
import { AISummaryCard } from "@/components/email/AISummaryCard";
import { ReplyComposer } from "@/components/email/ReplyComposer";
import { ArchiveButton } from "@/components/email/ArchiveButton";
import { ThreadShortcuts } from "@/components/email/ThreadShortcuts";
import { Avatar } from "@/components/ui/Avatar";
import { formatRelativeTime, parseNameEmail } from "@/lib/utils";

export default async function ThreadPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params;
  const thread = await api.gmail.getThread({ threadId }).catch(() => null);

  if (!thread || thread.messages.length === 0) notFound();

  const latest = thread.messages[thread.messages.length - 1];
  const { name: replyToName, email: replyToEmail } = parseNameEmail(latest?.from ?? "");

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto">
      <ThreadShortcuts threadId={threadId} />
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-headline-md font-bold flex items-center gap-2 truncate">
          <span className="material-symbols-outlined">forum</span>
          {latest?.subject || "(no subject)"}
        </h1>
        <div className="flex gap-2 shrink-0">
          <ArchiveButton threadId={threadId} />
        </div>
      </div>
      <p className="text-body-xs text-on-surface-variant mb-6">
        <kbd className="font-bold">r</kbd> reply · <kbd className="font-bold">e</kbd> archive ·{" "}
        <kbd className="font-bold">esc</kbd> back to inbox
      </p>

      <AISummaryCard threadId={threadId} initialSummary={thread.summary} />

      <div className="flex-1 overflow-y-auto space-y-6 py-6 pr-1">
        {thread.messages.map((m) => {
          const sender = parseNameEmail(m.from || "Unknown sender");
          return (
            <div key={m.id} className="flex gap-4 max-w-3xl">
              <Avatar name={sender.name} size={40} />
              <div className="min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-semibold text-body-sm">{sender.name}</span>
                  {m.timestamp > 0 && (
                    <span className="text-body-xs text-on-surface-variant">{formatRelativeTime(new Date(m.timestamp).toISOString())}</span>
                  )}
                </div>
                <div className="glass-card p-4 rounded-2xl rounded-tl-sm text-body-sm whitespace-pre-wrap">{m.snippet}</div>
              </div>
            </div>
          );
        })}

        <ReplyComposer to={replyToEmail} toDisplayName={replyToName} subject={latest?.subject ?? ""} />
      </div>
    </div>
  );
}
