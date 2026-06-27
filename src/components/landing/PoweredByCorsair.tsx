import { api } from "@/trpc/server";

const ITEMS: { key: "gmail" | "calendar" | "mcp" | "webhooks" | "vectorSearch" | "aiDrafting"; label: string; icon: string }[] = [
  { key: "gmail", label: "Gmail Connected", icon: "mail" },
  { key: "calendar", label: "Calendar Connected", icon: "calendar_today" },
  { key: "mcp", label: "MCP Connected", icon: "hub" },
  { key: "webhooks", label: "Webhooks Active", icon: "bolt" },
  { key: "vectorSearch", label: "Vector Search Ready", icon: "database" },
  { key: "aiDrafting", label: "AI Drafting Enabled", icon: "auto_awesome" },
];

export async function PoweredByCorsair() {
  const status = await api.insights.connectionStatus().catch(() => null);

  return (
    <section id="corsair" className="py-20 px-6 lg:px-16 bg-surface-container-low/40">
      <div className="max-w-4xl mx-auto text-center mb-10">
        <h2 className="text-headline-lg font-bold mb-3">Powered by Corsair</h2>
        <p className="text-on-surface-variant">
          This isn&rsquo;t a mockup — it&rsquo;s the live status of this exact deployment.
        </p>
      </div>
      <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ITEMS.map((item) => {
          const ok = Boolean(status?.[item.key]);
          return (
            <div
              key={item.key}
              className={`glass-card rounded-xl p-4 flex flex-col items-center gap-2 text-center ${ok ? "" : "opacity-60"}`}
            >
              <span className={`material-symbols-outlined ${ok ? "text-secondary" : "text-on-surface-variant"}`}>
                {item.icon}
              </span>
              <span className="text-body-xs font-semibold">{item.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
