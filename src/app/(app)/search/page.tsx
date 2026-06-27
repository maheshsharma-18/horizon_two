"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { startOfWeek, endOfWeek } from "date-fns";

import { api } from "@/trpc/react";
import { PriorityThreadCard } from "@/components/dashboard/PriorityThreadCard";
import { formatClock, formatDayLabel } from "@/lib/utils";
import { parseSearchQuery } from "@/lib/search-query";
import type { Priority } from "@/lib/types";

const PRIORITY_FILTERS: { id: Priority | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "high", label: "High" },
  { id: "medium", label: "Medium" },
  { id: "low", label: "Low" },
];

export default function SearchPage() {
  const [rawQuery, setRawQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const parsed = useMemo(() => parseSearchQuery(rawQuery), [rawQuery]);
  const hasQuery = rawQuery.trim().length > 0;

  const now = new Date();
  const { data: threads, isFetching: threadsLoading } = api.gmail.listThreads.useQuery(
    { query: parsed.freeText, limit: 30, offset: 0 },
    { enabled: hasQuery },
  );
  const { data: vector } = api.insights.vectorSearch.useQuery(
    { query: parsed.freeText, limit: 30 },
    { enabled: hasQuery && parsed.freeText.length > 0 },
  );
  const { data: events, isFetching: eventsLoading } = api.calendar.searchEvents.useQuery(
    {
      query: parsed.freeText,
      weekStart: startOfWeek(now).toISOString(),
      weekEnd: endOfWeek(now).toISOString(),
      limit: 20,
      offset: 0,
    },
    { enabled: hasQuery },
  );

  const semanticRanking = vector?.enabled ? vector.results : null;

  const filteredThreads = useMemo(() => {
    let list = threads ?? [];

    // Re-rank by semantic distance when vector search is configured and
    // actually returned something — falls back to keyword order otherwise.
    if (semanticRanking && semanticRanking.length > 0) {
      const rankByThreadId = new Map(semanticRanking.map((r, i) => [r.threadId, i]));
      const ranked = list.filter((t) => rankByThreadId.has(t.id));
      if (ranked.length > 0) {
        ranked.sort((a, b) => (rankByThreadId.get(a.id) ?? 0) - (rankByThreadId.get(b.id) ?? 0));
        list = ranked;
      }
    }

    return list.filter((t) => {
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      if (parsed.isPriority && t.priority !== parsed.isPriority) return false;
      if (parsed.from && !`${t.from.name} ${t.from.email}`.toLowerCase().includes(parsed.from)) return false;
      if (parsed.after || parsed.before) {
        if (!t.receivedAt) return false;
        const received = new Date(t.receivedAt);
        if (parsed.after && received < parsed.after) return false;
        if (parsed.before && received > parsed.before) return false;
      }
      return true;
    });
  }, [threads, semanticRanking, priorityFilter, parsed]);

  const filteredEvents = useMemo(() => {
    return (events ?? []).filter((e) => {
      if (parsed.from && !e.attendees.some((a) => `${a.name} ${a.email}`.toLowerCase().includes(parsed.from!))) {
        return false;
      }
      if (parsed.after || parsed.before) {
        if (!e.start) return false;
        const start = new Date(e.start);
        if (parsed.after && start < parsed.after) return false;
        if (parsed.before && start > parsed.before) return false;
      }
      return true;
    });
  }, [events, parsed]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-headline-lg font-bold mb-4">Search</h1>
        <div className="glass-pill flex items-center gap-3 px-5 py-3">
          <span className="material-symbols-outlined text-on-surface-variant">search</span>
          <input
            autoFocus
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
            placeholder="from:alex after:2026-01-01 is:high project update"
            className="flex-1 bg-transparent border-none focus:ring-0 text-body-md outline-none"
          />
          {vector?.enabled && parsed.freeText && (
            <span className="chip bg-corsair-blue/10 text-corsair-blue shrink-0">Semantic</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-3 items-center">
          {PRIORITY_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setPriorityFilter(f.id)}
              className={`chip ${priorityFilter === f.id ? "bg-primary text-on-primary" : "bg-surface-variant text-on-surface-variant"}`}
            >
              {f.label}
            </button>
          ))}
          <span className="text-body-xs text-on-surface-variant ml-2">
            Try <code className="bg-surface-variant px-1 rounded">from:</code>{" "}
            <code className="bg-surface-variant px-1 rounded">after:YYYY-MM-DD</code>{" "}
            <code className="bg-surface-variant px-1 rounded">before:YYYY-MM-DD</code>{" "}
            <code className="bg-surface-variant px-1 rounded">is:high</code>
          </span>
        </div>
        {parsed.hasAttachmentRequested && (
          <p className="text-body-xs text-on-surface-variant mt-2">
            <span className="material-symbols-outlined text-[14px] align-middle">info</span> Filtering by
            attachment isn&rsquo;t wired up yet — Corsair's cached message data doesn't confirm attachment
            metadata is available, so I didn&rsquo;t fake it. Ignoring <code>has:attachment</code> for now.
          </p>
        )}
      </div>

      {!hasQuery ? (
        <p className="text-on-surface-variant">Start typing to search your cached emails and this week's calendar.</p>
      ) : (
        <div className="space-y-8">
          <div>
            <h2 className="text-body-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">
              Emails {threadsLoading && "· searching..."}
            </h2>
            {filteredThreads.length === 0 && !threadsLoading && (
              <p className="text-body-sm text-on-surface-variant">No matching emails.</p>
            )}
            <div className="space-y-3">
              {filteredThreads.map((t) => (
                <PriorityThreadCard
                  key={t.id}
                  threadId={t.id}
                  fromName={t.from.name}
                  subject={t.subject}
                  snippet={t.snippet}
                  priority={t.priority as Priority}
                  priorityReason={t.priorityReason}
                  receivedAt={t.receivedAt}
                />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-body-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">
              Calendar (this week) {eventsLoading && "· searching..."}
            </h2>
            {filteredEvents.length === 0 && !eventsLoading && (
              <p className="text-body-sm text-on-surface-variant">No matching events.</p>
            )}
            <div className="space-y-2">
              {filteredEvents.map((e) => (
                <Link
                  key={e.id}
                  href="/calendar"
                  className="glass-card rounded-lg p-3 flex items-center justify-between block hover:border-primary/30"
                >
                  <span className="font-medium text-body-sm">{e.summary}</span>
                  <span className="text-body-xs text-on-surface-variant">
                    {formatDayLabel(e.start)} · {formatClock(e.start)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
