import { formatClock } from "@/lib/utils";
import { RescheduleButton } from "./RescheduleButton";

interface EventCardProps {
  eventId: string;
  summary: string;
  start: string;
  end: string;
  location?: string;
  attendeeCount: number;
  hasConflict?: boolean;
  suggestedStart?: string;
  suggestedEnd?: string;
}

export function EventCard({
  eventId,
  summary,
  start,
  end,
  location,
  attendeeCount,
  hasConflict,
  suggestedStart,
  suggestedEnd,
}: EventCardProps) {
  if (hasConflict) {
    return (
      <div className="bg-corsair-purple/10 border border-corsair-purple/20 shadow-sm p-4 rounded-xl">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h4 className="font-bold text-corsair-purple flex items-center gap-2">
            {summary}
            <span className="bg-white text-body-xs px-2 py-0.5 rounded-full shadow-sm text-on-surface">Conflict</span>
          </h4>
          <span className="text-body-xs font-semibold text-on-surface-variant shrink-0">
            {formatClock(start)} – {formatClock(end)}
          </span>
        </div>
        <p className="text-body-xs text-on-surface-variant mb-3">This overlaps with another event on your calendar.</p>
        {suggestedStart && suggestedEnd ? (
          <RescheduleButton eventId={eventId} suggestedStart={suggestedStart} suggestedEnd={suggestedEnd} />
        ) : null}
      </div>
    );
  }

  return (
    <div className="bg-white/80 border border-white shadow-sm p-4 rounded-xl">
      <div className="flex justify-between items-start mb-2 gap-2">
        <h4 className="font-bold">{summary}</h4>
        <span className="text-body-xs font-semibold text-on-surface-variant shrink-0">
          {formatClock(start)} – {formatClock(end)}
        </span>
      </div>
      {location && <p className="text-body-xs text-on-surface-variant mb-2">{location}</p>}
      {attendeeCount > 0 && (
        <div className="flex -space-x-2 mb-3">
          {Array.from({ length: Math.min(attendeeCount, 4) }).map((_, i) => (
            <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-corsair-blue to-corsair-purple border border-white" />
          ))}
        </div>
      )}
    </div>
  );
}
