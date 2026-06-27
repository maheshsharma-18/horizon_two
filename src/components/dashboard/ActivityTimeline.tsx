import { GlassCard } from "@/components/ui/GlassCard";
import { formatRelativeTime } from "@/lib/utils";

interface ActivityRow {
  id: string;
  kind: string;
  title: string;
  detail?: string;
  timestamp: string;
}

const ICON_BY_KIND: Record<string, { icon: string; bg: string; fg: string }> = {
  new_email: { icon: "mail", bg: "bg-blue-100", fg: "text-blue-600" },
  calendar_updated: { icon: "event", bg: "bg-purple-100", fg: "text-purple-600" },
  meeting_accepted: { icon: "event_available", bg: "bg-green-100", fg: "text-green-600" },
  draft_saved: { icon: "edit_document", bg: "bg-purple-100", fg: "text-purple-600" },
  agent_task_completed: { icon: "done_all", bg: "bg-green-100", fg: "text-green-600" },
  webhook_received: { icon: "bolt", bg: "bg-corsair-blue/20", fg: "text-corsair-blue" },
};

export function ActivityTimeline({ items }: { items: ActivityRow[] }) {
  return (
    <div>
      <h3 className="font-bold text-headline-sm mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined">timeline</span> Live Activity
      </h3>
      <GlassCard className="relative">
        {items.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant">
            Nothing yet — activity appears here as Corsair webhooks arrive.
          </p>
        ) : (
          <>
            <div className="absolute left-[35px] top-6 bottom-6 w-px bg-white/60" />
            <div className="space-y-6 relative z-10">
              {items.map((item) => {
                const meta = ICON_BY_KIND[item.kind] ?? ICON_BY_KIND.webhook_received;
                return (
                  <div key={item.id} className="flex gap-4">
                    <div
                      className={`w-8 h-8 rounded-full ${meta.bg} ${meta.fg} flex items-center justify-center flex-shrink-0 border-2 border-background`}
                    >
                      <span className="material-symbols-outlined text-[16px]">{meta.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-body-sm">{item.title}</div>
                      {item.detail && <div className="text-body-xs text-on-surface-variant mb-1">{item.detail}</div>}
                      <div className="text-[10px] text-on-surface-variant/70 uppercase">
                        {formatRelativeTime(item.timestamp)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </GlassCard>
    </div>
  );
}
