"use client";

import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";

export function ArchiveButton({ threadId }: { threadId: string }) {
  const router = useRouter();
  const archive = api.gmail.archiveThread.useMutation({
    onSuccess: () => router.push("/inbox"),
  });

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={() => archive.mutate({ threadId })}
        disabled={archive.isPending}
        className="bg-white/50 hover:bg-white/80 border border-white/60 px-3 py-1.5 rounded-full text-body-sm font-medium shadow-sm flex items-center gap-1 disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-[16px]">archive</span>
        {archive.isPending ? "Archiving..." : "Archive"}
      </button>
      {archive.isError && (
        <span className="text-body-xs text-error max-w-[200px] text-right">
          {archive.error.message} — see README's "unverified" note on this endpoint.
        </span>
      )}
    </div>
  );
}
