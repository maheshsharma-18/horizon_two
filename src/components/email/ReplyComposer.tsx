"use client";

import { useState } from "react";
import { api } from "@/trpc/react";

export function ReplyComposer({ to, toDisplayName, subject }: { to: string; toDisplayName?: string; subject: string }) {
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);
  const sendEmail = api.gmail.sendEmail.useMutation({ onSuccess: () => setSent(true) });

  if (sent) {
    return (
      <div className="glass-card rounded-2xl rounded-tl-sm p-4 text-body-sm text-secondary flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px]">check_circle</span> Sent.
      </div>
    );
  }

  return (
    <div className="flex gap-4 max-w-3xl flex-row-reverse self-end ml-auto w-full">
      <div className="flex flex-col items-end w-full">
        <div className="flex items-baseline gap-2 mb-1 flex-row-reverse">
          <span className="font-semibold text-body-sm text-primary flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">edit</span> Reply
          </span>
        </div>
        <div className="glass-card p-4 rounded-2xl rounded-tr-sm text-body-sm bg-white/80 border-primary/30 w-full text-left">
          <textarea
            id="reply-textarea"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full bg-transparent border-none resize-none focus:ring-0 p-0 text-body-sm"
            rows={3}
            placeholder={`Reply to ${toDisplayName ?? to}...`}
          />
          <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-on-surface/10">
            <button onClick={() => setBody("")} className="text-body-xs font-semibold px-3 py-1.5 rounded-full hover:bg-surface-variant">
              Discard
            </button>
            <button
              onClick={() => sendEmail.mutate({ to, subject: `Re: ${subject}`, body })}
              disabled={!body.trim() || sendEmail.isPending}
              className="bg-primary text-on-primary text-body-xs font-bold px-4 py-1.5 rounded-full shadow-sm hover:bg-primary/90 flex items-center gap-1 disabled:opacity-40"
            >
              {sendEmail.isPending ? "Sending..." : "Send"}
              <span className="material-symbols-outlined text-[14px]">send</span>
            </button>
          </div>
          {sendEmail.isError && (
            <p className="text-body-xs text-error mt-2">{sendEmail.error.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
