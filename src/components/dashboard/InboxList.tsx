"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { PriorityThreadCard } from "@/components/dashboard/PriorityThreadCard";
import { api } from "@/trpc/react";
import { isTypingTarget } from "@/lib/utils";
import type { Priority } from "@/lib/types";
import type { RouterOutputs } from "@/trpc/react";

type Thread = RouterOutputs["gmail"]["listThreads"][number];

const GROUPS: { key: Priority; label: string }[] = [
  { key: "high", label: "High Priority" },
  { key: "medium", label: "Medium Priority" },
  { key: "low", label: "Low Priority" },
];

export function InboxList({ initialThreads }: { initialThreads: Thread[] }) {
  const router = useRouter();
  const [threads, setThreads] = useState(initialThreads);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const archiveThread = api.gmail.archiveThread.useMutation();

  // Flat order matches render order (grouped by priority) so j/k tracks
  // what's visually on screen.
  const ordered = GROUPS.flatMap((g) => threads.filter((t) => t.priority === g.key));

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) return;
      if (ordered.length === 0) return;

      if (e.key === "j") {
        e.preventDefault();
        setFocusedIndex((i) => Math.min(i + 1, ordered.length - 1));
      } else if (e.key === "k") {
        e.preventDefault();
        setFocusedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" || e.key === "o" || e.key === "r") {
        e.preventDefault();
        const target = ordered[focusedIndex];
        if (target) router.push(`/inbox/${target.id}`);
      } else if (e.key === "e") {
        e.preventDefault();
        const target = ordered[focusedIndex];
        if (!target) return;
        archiveThread.mutate({ threadId: target.id });
        setThreads((prev) => prev.filter((t) => t.id !== target.id));
      }
    }
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [ordered, focusedIndex, archiveThread, router]);

  if (threads.length === 0) {
    return (
      <p className="text-on-surface-variant">
        No cached emails yet. Connect Gmail (see README) and trigger a sync — new mail also arrives here
        automatically via Corsair webhooks.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <p className="text-body-xs text-on-surface-variant -mt-2">
        <kbd className="font-bold">j</kbd>/<kbd className="font-bold">k</kbd> to move ·{" "}
        <kbd className="font-bold">↵</kbd> open · <kbd className="font-bold">e</kbd> archive
      </p>
      {GROUPS.map((group) => {
        const groupThreads = threads.filter((t) => t.priority === group.key);
        if (groupThreads.length === 0) return null;
        return (
          <div key={group.key}>
            <h2 className="text-body-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">
              {group.label} · {groupThreads.length}
            </h2>
            <div className="space-y-3">
              {groupThreads.map((t) => (
                <PriorityThreadCard
                  key={t.id}
                  threadId={t.id}
                  fromName={t.from.name}
                  subject={t.subject}
                  snippet={t.snippet}
                  priority={t.priority as Priority}
                  priorityReason={t.priorityReason}
                  receivedAt={t.receivedAt}
                  focused={ordered[focusedIndex]?.id === t.id}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
