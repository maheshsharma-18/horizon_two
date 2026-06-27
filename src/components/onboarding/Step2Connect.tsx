"use client";

import { api } from "@/trpc/react";

// NOTE: in Corsair's single-tenant ("dev") setup demonstrated in the
// reference repo, OAuth is completed via the CLI (`pnpm corsair auth
// --plugin=gmail --tenant=dev`), not a button click inside this app —
// there's no documented `getAuthUrl()`-style endpoint to redirect into from
// here. So this step polls real connection status rather than simulating
// an OAuth click; if you confirm Corsair does support an in-app OAuth
// redirect for multi-tenant setups, swap the instructions block below for
// a real "Continue with Google" button.

export function Step2Connect({ onNext }: { onNext: () => void }) {
  const { data: status, refetch, isFetching } = api.insights.connectionStatus.useQuery();
  const connected = Boolean(status?.gmail && status?.calendar);

  return (
    <div className="flex flex-col h-full justify-center animate-fade-up">
      <h2 className="text-headline-lg font-bold mb-2">Connect your ecosystem</h2>
      <p className="text-on-surface-variant mb-10">Underpin requires access to Gmail and Calendar via Corsair.</p>

      {connected ? (
        <div className="glass-card rounded-2xl p-6 mb-8 space-y-3">
          <div className="flex items-center gap-2 text-secondary font-semibold">
            <span className="material-symbols-outlined">check_circle</span> Gmail Connected
          </div>
          <div className="flex items-center gap-2 text-secondary font-semibold">
            <span className="material-symbols-outlined">check_circle</span> Calendar Connected
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-6 mb-8 space-y-3 text-body-sm">
          <p className="font-semibold">Not connected yet. Run these once, from your project root:</p>
          <pre className="bg-on-surface/5 rounded-lg p-3 overflow-x-auto text-body-xs">
{`pnpm corsair auth --plugin=gmail --tenant=dev
pnpm corsair auth --plugin=googlecalendar --tenant=dev`}
          </pre>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-primary font-semibold text-body-sm flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            {isFetching ? "Checking..." : "I've connected — check again"}
          </button>
        </div>
      )}

      <button
        onClick={onNext}
        disabled={!connected}
        className="pill-button-primary self-end w-full sm:w-auto disabled:opacity-40"
      >
        Continue
      </button>
    </div>
  );
}
