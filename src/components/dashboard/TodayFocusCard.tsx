import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";

interface Suggestion {
  id: string;
  title: string;
  description: string;
  relatedThreadId?: string;
  relatedEventId?: string;
}

interface TodayFocusCardProps {
  meetingsToday: number;
  highPriorityCount: number;
  pendingReplies: number;
  suggestions: Suggestion[];
}

export function TodayFocusCard({ meetingsToday, highPriorityCount, pendingReplies, suggestions }: TodayFocusCardProps) {
  return (
    <GlassCard className="rounded-lg relative overflow-hidden">
      <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
      <div className="relative z-10">
        <h2 className="text-headline-md font-bold mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">auto_awesome</span> Today's Focus
        </h2>
        <p className="text-on-surface-variant text-body-md mb-6">
          You have {meetingsToday} meeting{meetingsToday === 1 ? "" : "s"} today
          {highPriorityCount > 0 && <> and {highPriorityCount} high-priority email{highPriorityCount === 1 ? "" : "s"} needing attention</>}
          {pendingReplies > 0 && <>, with {pendingReplies} reply draft{pendingReplies === 1 ? "" : "s"} ready to review</>}.
        </p>

        <div className="space-y-3">
          {suggestions.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant">You're all caught up — no suggestions right now.</p>
          ) : (
            suggestions.slice(0, 3).map((s) => {
              const href = s.relatedThreadId
                ? `/inbox/${s.relatedThreadId}`
                : s.relatedEventId
                  ? `/calendar`
                  : "/inbox";
              return (
                <div
                  key={s.id}
                  className="bg-white/60 border border-white/80 rounded-xl p-3 flex items-center justify-between gap-3 shadow-sm hover:shadow transition-shadow"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-body-sm truncate">{s.title}</div>
                    <div className="text-body-xs text-on-surface-variant truncate">{s.description}</div>
                  </div>
                  <Link
                    href={href}
                    className="bg-primary/10 text-primary px-3 py-1 rounded-full text-body-xs font-bold hover:bg-primary/20 shrink-0"
                  >
                    Review
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </div>
    </GlassCard>
  );
}
