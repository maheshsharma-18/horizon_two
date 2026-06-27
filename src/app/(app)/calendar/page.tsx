import { startOfDay, endOfDay } from "date-fns";
import { api } from "@/trpc/server";
import { EventCard } from "@/components/calendar/EventCard";

function timeOfDayBucket(startIso: string): "Morning" | "Afternoon" | "Evening" {
  const hour = new Date(startIso).getHours();
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}

function hasOverlap(a: { start: string; end: string }, b: { start: string; end: string }): boolean {
  return new Date(a.start) < new Date(b.end) && new Date(b.start) < new Date(a.end);
}

export default async function CalendarPage() {
  const now = new Date();
  const events = await api.calendar
    .searchEvents({
      query: "",
      weekStart: startOfDay(now).toISOString(),
      weekEnd: endOfDay(now).toISOString(),
      limit: 100,
      offset: 0,
    })
    .catch(() => []);

  const conflictIds = new Set<string>();
  const suggestions = new Map<string, { start: string; end: string }>();
  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      if (events[i].start && events[i].end && events[j].start && events[j].end && hasOverlap(events[i], events[j])) {
        conflictIds.add(events[i].id);
        conflictIds.add(events[j].id);

        // Move whichever of the two starts later — keep the earlier one in
        // place — to right after the earlier one ends, preserving its own duration.
        const [earlier, later] =
          new Date(events[i].start) <= new Date(events[j].start) ? [events[i], events[j]] : [events[j], events[i]];
        if (!suggestions.has(later.id)) {
          const durationMs = new Date(later.end).getTime() - new Date(later.start).getTime();
          const newStart = new Date(earlier.end);
          const newEnd = new Date(newStart.getTime() + durationMs);
          suggestions.set(later.id, { start: newStart.toISOString(), end: newEnd.toISOString() });
        }
      }
    }
  }

  const buckets: Record<string, typeof events> = { Morning: [], Afternoon: [], Evening: [] };
  for (const e of events) {
    if (!e.start) continue;
    buckets[timeOfDayBucket(e.start)].push(e);
  }

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-headline-lg font-bold">Today</h1>
          <p className="text-on-surface-variant">
            {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <button className="pill-button-primary flex items-center gap-2">
          <span className="material-symbols-outlined">add</span> New Event
        </button>
      </div>

      <div className="flex gap-8 h-full min-h-[500px]">
        <div className="flex-1 glass-card rounded-lg p-6 flex flex-col">
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {events.length === 0 && (
              <p className="text-body-sm text-on-surface-variant">No events today.</p>
            )}
            {(["Morning", "Afternoon", "Evening"] as const).map((bucket) =>
              buckets[bucket].length > 0 ? (
                <div key={bucket}>
                  <div className="text-body-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 mt-4 bg-background px-2 inline-block rounded">
                    {bucket}
                  </div>
                  <div className="ml-4 pl-4 border-l-2 border-primary/30 space-y-4">
                    {buckets[bucket].map((e) => (
                      <EventCard
                        key={e.id}
                        eventId={e.id}
                        summary={e.summary}
                        start={e.start}
                        end={e.end}
                        location={e.location}
                        attendeeCount={e.attendees.length}
                        hasConflict={conflictIds.has(e.id)}
                        suggestedStart={suggestions.get(e.id)?.start}
                        suggestedEnd={suggestions.get(e.id)?.end}
                      />
                    ))}
                  </div>
                </div>
              ) : null,
            )}
          </div>
        </div>

        <div className="w-72 hidden md:block">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">auto_awesome</span> Smart Assistant
          </h3>
          <div className="glass-card rounded-lg p-4 space-y-4">
            {conflictIds.size > 0 ? (
              <div className="text-body-sm">
                <div className="font-semibold mb-1">{conflictIds.size} events conflict today</div>
                <div className="text-body-xs text-on-surface-variant">
                  Open the conflicting events above and use &ldquo;Suggest reschedule&rdquo; to resolve.
                </div>
              </div>
            ) : (
              <div className="text-body-sm text-on-surface-variant">No conflicts detected today.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
