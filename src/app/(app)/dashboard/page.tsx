import { startOfDay, endOfDay } from "date-fns";

import { api } from "@/trpc/server";
import { TodayFocusCard } from "@/components/dashboard/TodayFocusCard";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { PriorityThreadCard } from "@/components/dashboard/PriorityThreadCard";
import Link from "next/link";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const now = new Date();
  const [threads, todaysEvents, drafts, suggestions, activity] = await Promise.all([
    api.gmail.listThreads({ query: "", limit: 50, offset: 0 }).catch(() => []),
    api.calendar
      .searchEvents({
        query: "",
        weekStart: startOfDay(now).toISOString(),
        weekEnd: endOfDay(now).toISOString(),
        limit: 50,
        offset: 0,
      })
      .catch(() => []),
    api.gmail.listDrafts({ limit: 50, offset: 0 }).catch(() => []),
    api.insights.suggestions().catch(() => []),
    api.insights.recentActivity({ limit: 8 }).catch(() => []),
  ]);

  const highPriorityThreads = threads.filter((t) => t.priority === "high");

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <h1 className="text-headline-lg font-bold">{greeting()}.</h1>

      <TodayFocusCard
        meetingsToday={todaysEvents.length}
        highPriorityCount={highPriorityThreads.length}
        pendingReplies={drafts.length}
        suggestions={suggestions}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ActivityTimeline items={activity} />

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-headline-sm flex items-center gap-2">
              <span className="material-symbols-outlined">inbox</span> Priority Queue
            </h3>
            <Link href="/inbox" className="text-body-xs font-bold text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {threads.slice(0, 4).map((t) => (
              <PriorityThreadCard
                key={t.id}
                threadId={t.id}
                fromName={t.from.name}
                subject={t.subject}
                snippet={t.snippet}
                priority={t.priority as "high" | "medium" | "low"}
                priorityReason={t.priorityReason}
                receivedAt={t.receivedAt}
              />
            ))}
            {threads.length === 0 && (
              <p className="text-body-sm text-on-surface-variant">
                No cached emails yet — connect Gmail and run a sync to populate your inbox.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
