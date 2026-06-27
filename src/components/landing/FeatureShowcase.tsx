const FEATURES = [
  {
    index: "01 / 03",
    title: "An inbox sorted by what actually matters",
    description:
      "Every message is scored High, Medium, or Low by a cheap LLM the moment it arrives via webhook — not when you happen to open the app. No more skimming past newsletters to find the one email that matters.",
    icon: "inbox",
    accent: "primary" as const,
  },
  {
    index: "02 / 03",
    title: "A calendar that flags its own conflicts",
    description:
      "Overlapping meetings surface automatically, with a one-click reschedule suggestion. Sending an invite is one action — not five clicks across two different Google apps.",
    icon: "calendar_today",
    accent: "purple" as const,
  },
  {
    index: "03 / 03",
    title: "Chat to send the email and the invite",
    description:
      "\"Send a calendar invite to Alex at 9am Thursday, and an email saying I look forward to it\" — the agent calls Gmail and Calendar directly through Corsair's MCP and shows you every step it took.",
    icon: "smart_toy",
    accent: "blue" as const,
  },
];

// Tailwind's compiler only picks up class names it can see as literal
// strings — `bg-gradient-to-br from-${accent}/15` would silently produce no
// CSS. This map keeps every class name static and complete.
const ACCENT_CLASSES = {
  primary: { gradient: "bg-gradient-to-br from-primary/15 via-transparent to-transparent", icon: "text-primary" },
  purple: { gradient: "bg-gradient-to-br from-corsair-purple/15 via-transparent to-transparent", icon: "text-corsair-purple" },
  blue: { gradient: "bg-gradient-to-br from-corsair-blue/15 via-transparent to-transparent", icon: "text-corsair-blue" },
};

export function FeatureShowcase() {
  return (
    <section id="features" className="py-24 px-6 lg:px-16 space-y-10">
      {FEATURES.map((f, i) => (
        <div
          key={f.index}
          className="max-w-5xl mx-auto bg-white/40 backdrop-blur-2xl rounded-lg border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col md:flex-row min-h-[380px]"
        >
          <div className={`p-10 flex-1 flex flex-col justify-center ${i % 2 === 1 ? "md:order-2" : ""}`}>
            <span className="font-label-caps text-label-caps text-on-surface-variant mb-6 tracking-widest">
              {f.index}
            </span>
            <h3 className="text-headline-lg text-[28px] text-on-surface mb-4 leading-tight font-bold">{f.title}</h3>
            <p className="text-body-lg text-on-surface-variant max-w-md">{f.description}</p>
          </div>
          <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-white/20 border-white/40 min-h-[240px] md:border-l">
            <div className={`absolute inset-0 ${ACCENT_CLASSES[f.accent].gradient}`} />
            <div className="relative z-10 w-24 h-24 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-lg flex items-center justify-center">
              <span className={`material-symbols-outlined text-4xl ${ACCENT_CLASSES[f.accent].icon}`}>{f.icon}</span>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
