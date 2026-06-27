"use client";

import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { formatClock } from "@/lib/utils";

export function RescheduleButton({
  eventId,
  suggestedStart,
  suggestedEnd,
}: {
  eventId: string;
  suggestedStart: string;
  suggestedEnd: string;
}) {
  const router = useRouter();
  const reschedule = api.calendar.reschedule.useMutation({
    onSuccess: () => router.refresh(),
  });

  if (reschedule.isSuccess) {
    return (
      <span className="text-body-xs font-bold text-secondary flex items-center gap-1">
        <span className="material-symbols-outlined text-[14px]">check_circle</span> Moved to{" "}
        {formatClock(suggestedStart)}
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={() => reschedule.mutate({ eventId, start: suggestedStart, end: suggestedEnd })}
        disabled={reschedule.isPending}
        className="bg-white text-body-xs font-bold px-3 py-1 rounded-md shadow-sm border border-on-surface/10 hover:bg-surface-variant flex items-center gap-1 disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-[14px]">smart_toy</span>
        {reschedule.isPending ? "Moving..." : `Move to ${formatClock(suggestedStart)}`}
      </button>
      {reschedule.isError && (
        <span className="text-body-xs text-error max-w-[220px]">
          {reschedule.error.message} — see README's "unverified" note on this endpoint.
        </span>
      )}
    </div>
  );
}
