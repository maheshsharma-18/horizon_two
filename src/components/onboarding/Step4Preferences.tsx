import type { AIPreferences } from "@/lib/types";

const TOGGLES: { key: keyof AIPreferences; label: string; description: string }[] = [
  { key: "aiDrafting", label: "AI Drafting", description: "Auto-generate context-aware email replies." },
  { key: "smartPriority", label: "Smart Priority Filtering", description: "LLM-based categorization of incoming emails." },
  { key: "autonomousScheduling", label: "Autonomous Scheduling", description: "Allow the agent to resolve calendar conflicts automatically." },
  { key: "realtimeNotifications", label: "Realtime Notifications", description: "Powered by Corsair Webhooks." },
  { key: "keyboardShortcuts", label: "Keyboard Shortcuts", description: "Navigate and act without touching the mouse." },
  { key: "mcpAgentChat", label: "Agent Chat", description: "Chat to send emails and create calendar invites." },
];

interface Step4PreferencesProps {
  value: AIPreferences;
  onChange: (key: keyof AIPreferences, value: boolean) => void;
  onNext: () => void;
}

export function Step4Preferences({ value, onChange, onNext }: Step4PreferencesProps) {
  return (
    <div className="flex flex-col h-full pt-4 animate-fade-up">
      <h2 className="text-headline-lg font-bold mb-2">AI Capabilities</h2>
      <p className="text-on-surface-variant mb-6">Enable the superpowers you want Corsair to handle.</p>

      <div className="space-y-3 overflow-y-auto pr-2 pb-6 max-h-[320px]">
        {TOGGLES.map((toggle) => (
          <label key={toggle.key} className="glass-card p-4 rounded-2xl flex items-start gap-4 cursor-pointer">
            <input
              type="checkbox"
              checked={value[toggle.key]}
              onChange={(e) => onChange(toggle.key, e.target.checked)}
              className="mt-1 accent-primary rounded"
            />
            <div>
              <div className="font-semibold">{toggle.label}</div>
              <div className="text-body-sm text-on-surface-variant">{toggle.description}</div>
            </div>
          </label>
        ))}
      </div>

      <button onClick={onNext} className="bg-on-surface text-inverse-on-surface rounded-full py-3 px-8 font-semibold hover:opacity-90 transition-opacity active:scale-95 self-end w-full sm:w-auto">
        Review Settings
      </button>
    </div>
  );
}
