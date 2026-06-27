"use client";

import { useState } from "react";
import { api } from "@/trpc/react";

interface ThreadSummary {
  summary: string;
  keyDecisions: string[];
  actionItems: string[];
  peopleMentioned: string[];
  datesMentioned: string[];
}

export function AISummaryCard({ threadId, initialSummary }: { threadId: string; initialSummary: ThreadSummary | null }) {
  const [summary, setSummary] = useState(initialSummary);
  const generate = api.gmail.summarizeThread.useMutation({
    onSuccess: (data) => data && setSummary(data),
  });

  if (!summary) {
    return (
      <div className="glass-card rounded-lg p-5 border-l-4 border-l-primary">
        <button
          onClick={() => generate.mutate({ threadId })}
          disabled={generate.isPending}
          className="text-body-sm font-semibold text-primary flex items-center gap-2 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
          {generate.isPending ? "Summarizing..." : "Generate AI Summary"}
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-lg p-5 border-l-4 border-l-primary">
      <h4 className="text-body-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1">
        <span className="material-symbols-outlined text-[14px]">auto_awesome</span> AI Summary
      </h4>
      <p className="text-body-sm text-on-surface-variant mb-3">{summary.summary}</p>
      {(summary.actionItems.length > 0 || summary.keyDecisions.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {summary.actionItems.length > 0 && (
            <span className="bg-white/80 text-body-xs font-semibold px-3 py-1 rounded-md border border-on-surface/10 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">task</span>
              {summary.actionItems.length} action item{summary.actionItems.length === 1 ? "" : "s"}
            </span>
          )}
          {summary.keyDecisions.length > 0 && (
            <span className="bg-white/80 text-body-xs font-semibold px-3 py-1 rounded-md border border-on-surface/10 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">gavel</span>
              {summary.keyDecisions.length} decision{summary.keyDecisions.length === 1 ? "" : "s"}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
