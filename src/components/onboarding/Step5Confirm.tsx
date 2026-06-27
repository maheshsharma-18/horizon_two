"use client";

import { api } from "@/trpc/react";

export function Step5Confirm({ onLaunch, isLaunching }: { onLaunch: () => void; isLaunching: boolean }) {
  const { data: status } = api.insights.connectionStatus.useQuery();

  const rows = [
    { icon: "mail", label: "Gmail", ok: Boolean(status?.gmail), okLabel: "Connected" },
    { icon: "calendar_today", label: "Calendar", ok: Boolean(status?.calendar), okLabel: "Connected" },
    { icon: "bolt", label: "Realtime Webhooks", ok: Boolean(status?.webhooks), okLabel: "Listening" },
    { icon: "database", label: "Vector Search", ok: Boolean(status?.vectorSearch), okLabel: "Indexed" },
  ];

  return (
    <div className="flex flex-col h-full pt-4 animate-fade-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
          <span className="material-symbols-outlined">check_circle</span>
        </div>
        <h2 className="text-headline-lg font-bold">Ready to Launch</h2>
      </div>

      <div className="glass-card p-6 rounded-2xl mb-8">
        <h3 className="font-semibold mb-4 uppercase text-body-xs tracking-wider text-on-surface-variant">Active Services</h3>
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row.label} className="flex justify-between items-center text-body-sm">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">{row.icon}</span> {row.label}
              </span>
              <span className={row.ok ? "text-secondary font-medium" : "text-on-surface-variant"}>
                {row.ok ? row.okLabel : "Not yet"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={onLaunch}
        disabled={isLaunching}
        className="mt-auto bg-gradient-to-r from-primary to-orange-400 text-on-primary rounded-full py-4 px-8 font-bold text-body-lg hover:shadow-lg transition-all active:scale-95 w-full shadow-[0_8px_20px_rgba(255,94,58,0.3)] disabled:opacity-60"
      >
        {isLaunching ? "Launching..." : "Launch Workspace"}
      </button>
    </div>
  );
}
