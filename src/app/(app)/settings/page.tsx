import { api } from "@/trpc/server";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusDot } from "@/components/ui/StatusDot";

const SHORTCUTS = [
  { keys: "⌘ / Ctrl + K", action: "Open command palette" },
  { keys: "Esc", action: "Close any overlay" },
  { keys: "↑ / ↓", action: "Navigate command palette results" },
  { keys: "↵", action: "Select / send" },
];

export default async function SettingsPage() {
  const [status, profile] = await Promise.all([
    api.insights.connectionStatus().catch(() => null),
    api.onboarding.getProfile().catch(() => null),
  ]);

  const connectionRows = [
    { label: "Gmail", ok: Boolean(status?.gmail) },
    { label: "Google Calendar", ok: Boolean(status?.calendar) },
    { label: "Corsair MCP (agent chat)", ok: Boolean(status?.mcp) },
    { label: "Realtime webhooks", ok: Boolean(status?.webhooks) },
    { label: "Vector search", ok: Boolean(status?.vectorSearch) },
    { label: "AI drafting / priority", ok: Boolean(status?.aiDrafting) },
  ];

  const preferenceRows: { label: string; on: boolean }[] = profile
    ? [
        { label: "AI Drafting", on: profile.aiDrafting },
        { label: "Smart Priority Filtering", on: profile.smartPriority },
        { label: "Realtime Notifications", on: profile.realtimeNotifications },
        { label: "Autonomous Scheduling", on: profile.autonomousScheduling },
        { label: "Keyboard Shortcuts", on: profile.keyboardShortcuts },
        { label: "Agent Chat", on: profile.mcpAgentChat },
      ]
    : [];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-headline-lg font-bold">Settings</h1>

      <section>
        <h2 className="text-body-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Connections</h2>
        <GlassCard>
          <ul className="space-y-3">
            {connectionRows.map((row) => (
              <li key={row.label} className="flex items-center justify-between text-body-sm">
                <span className="flex items-center gap-2">
                  <StatusDot active={row.ok} />
                  {row.label}
                </span>
                <span className={row.ok ? "text-secondary font-medium" : "text-on-surface-variant"}>
                  {row.ok ? "Connected" : "Not connected"}
                </span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </section>

      {profile && (
        <section>
          <h2 className="text-body-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">
            AI Preferences · {profile.workflowProfile ?? "—"}
          </h2>
          <GlassCard>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {preferenceRows.map((row) => (
                <li key={row.label} className="flex items-center justify-between text-body-sm">
                  {row.label}
                  <StatusDot active={row.on} />
                </li>
              ))}
            </ul>
          </GlassCard>
        </section>
      )}

      <section>
        <h2 className="text-body-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Keyboard Shortcuts</h2>
        <GlassCard>
          <ul className="space-y-2">
            {SHORTCUTS.map((s) => (
              <li key={s.keys} className="flex items-center justify-between text-body-sm">
                <span className="text-on-surface-variant">{s.action}</span>
                <kbd className="bg-surface-variant px-2 py-0.5 rounded font-bold text-body-xs">{s.keys}</kbd>
              </li>
            ))}
          </ul>
        </GlassCard>
      </section>

      <section>
        <h2 className="text-body-xs font-bold text-error uppercase tracking-wider mb-3">Danger Zone</h2>
        <GlassCard className="border-error/30">
          <p className="text-body-sm text-on-surface-variant mb-3">
            Disconnecting isn't wired up yet — Corsair's docs don't show a documented "revoke" endpoint in the
            reference repo. Revoke access directly from your Google Account's
            {" "}
            <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer" className="text-primary underline">
              third-party access settings
            </a>{" "}
            for now.
          </p>
        </GlassCard>
      </section>
    </div>
  );
}
