"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCommandPalette } from "@/components/command-palette/CommandPaletteProvider";
import { cn } from "@/lib/utils";
import { StatusDot } from "@/components/ui/StatusDot";
import { PushpinLogo } from "@/components/ui/PushpinLogo";

interface NavItem {
  href: string;
  icon: string;
  label: string;
  accent?: "purple";
  badge?: number;
}

interface SidebarProps {
  unreadCount?: number;
  webhooksActive?: boolean;
}

export function Sidebar({ unreadCount, webhooksActive }: SidebarProps) {
  const pathname = usePathname();
  const { open } = useCommandPalette();

  const navItems: NavItem[] = [
    { href: "/dashboard", icon: "home", label: "Home" },
    { href: "/inbox", icon: "inbox", label: "Priority Inbox", badge: unreadCount },
    { href: "/calendar", icon: "calendar_today", label: "Calendar" },
    { href: "/agent", icon: "smart_toy", label: "Agent Chat", accent: "purple" },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-white/40 flex flex-col h-full flex-shrink-0 relative z-20">
      {/* Logo & workspace */}
      <div className="p-6 border-b border-white/20">
        <Link href="/dashboard" className="flex items-center gap-2 text-primary font-display-xl font-bold text-xl mb-4">
          <PushpinLogo className="w-6 h-6 -rotate-12" />
          Underpin
        </Link>
        <button className="w-full bg-white/40 hover:bg-white/60 border border-white/50 rounded-xl p-2 flex items-center justify-between transition-colors shadow-sm text-body-sm">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-corsair-blue to-corsair-purple shrink-0" />
            <span className="font-medium truncate">Workspace</span>
          </div>
          <span className="material-symbols-outlined text-[18px] shrink-0">unfold_more</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className="text-body-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 px-3 mt-2">
          Workspace
        </div>
        {navItems.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors",
                active ? "bg-white/50 shadow-sm border border-white/60" : "hover:bg-white/40",
                item.accent === "purple" && !active && "text-corsair-purple",
              )}
            >
              <span className={cn("material-symbols-outlined text-[20px]", item.accent === "purple" && "text-corsair-purple")}>
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
              {!!item.badge && (
                <span className="ml-auto bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
        <button
          onClick={open}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-white/40 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">search</span>
          <span className="font-medium">Search</span>
          <span className="ml-auto text-body-xs text-on-surface-variant bg-white/50 px-1.5 rounded border border-white/60">
            ⌘K
          </span>
        </button>

        <div className="text-body-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 px-3 mt-6">
          Settings
        </div>
        <Link
          href="/settings"
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-white/40 transition-colors text-on-surface-variant",
            pathname?.startsWith("/settings") && "bg-white/50 shadow-sm border border-white/60",
          )}
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
          <span className="font-medium">Preferences</span>
        </Link>
      </nav>

      {/* Bottom status */}
      <div className="p-4 border-t border-white/20 text-body-xs text-on-surface-variant space-y-2">
        <div className="flex items-center gap-2 font-medium">
          <StatusDot active={Boolean(webhooksActive)} pulse />
          <span className={webhooksActive ? "text-secondary" : ""}>
            {webhooksActive ? "Realtime Sync Active" : "Realtime Sync Offline"}
          </span>
        </div>
      </div>
    </aside>
  );
}
