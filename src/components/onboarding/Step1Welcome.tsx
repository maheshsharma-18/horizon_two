import { PushpinLogo } from "@/components/ui/PushpinLogo";

export function Step1Welcome({ onNext }: { onNext: () => void }) {
  const items = [
    { icon: "check", color: "text-primary bg-primary/10", label: "Manage Email Intelligently" },
    { icon: "check", color: "text-corsair-purple bg-corsair-purple/10", label: "Autonomous Calendar Scheduling" },
    { icon: "check", color: "text-corsair-blue bg-corsair-blue/10", label: "Execute Complex Workflows" },
  ];

  return (
    <div className="flex flex-col h-full justify-center animate-fade-up">
      <div className="w-16 h-16 rounded-2xl bg-white border border-white/60 flex items-center justify-center mb-6 shadow-sm">
        <PushpinLogo className="w-7 h-7 text-primary -rotate-12" />
      </div>
      <h1 className="text-display-xl text-4xl font-bold mb-3 tracking-tight">Welcome to Underpin.</h1>
      <p className="text-on-surface-variant text-body-lg mb-8">Your AI workspace for Gmail and Google Calendar.</p>

      <div className="grid gap-4 mb-10">
        {items.map((item) => (
          <div key={item.label} className="glass-card p-4 rounded-xl flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.color}`}>
              <span className="material-symbols-outlined text-sm">{item.icon}</span>
            </div>
            <span className="font-medium">{item.label}</span>
          </div>
        ))}
      </div>

      <button onClick={onNext} className="pill-button-primary self-end w-full sm:w-auto">
        Connect Workspace
      </button>
    </div>
  );
}
