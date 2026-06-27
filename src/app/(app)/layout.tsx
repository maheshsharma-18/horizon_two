import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { CommandPaletteProvider } from "@/components/command-palette/CommandPaletteProvider";
import { CommandPalette } from "@/components/command-palette/CommandPalette";
import { ComposeModalProvider } from "@/components/email/ComposeModalProvider";
import { ComposeModal } from "@/components/email/ComposeModal";
import { GlobalShortcuts } from "@/components/shortcuts/GlobalShortcuts";
import { api } from "@/trpc/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [threads, status] = await Promise.all([
    api.gmail.listThreads({ query: "", limit: 50, offset: 0 }).catch(() => []),
    api.insights.connectionStatus().catch(() => null),
  ]);
  const highPriorityCount = threads.filter((t) => t.priority === "high").length;

  return (
    <CommandPaletteProvider>
      <ComposeModalProvider>
        <div className="h-screen w-full flex bg-background relative overflow-hidden">
          {/* Ambient background gradient, same recipe as the landing page hero */}
          <div
            className="fixed inset-0 -z-10 animate-gradient-bg"
            style={{
              backgroundImage:
                "radial-gradient(circle at 15% 50%, rgba(255,94,58,0.06), transparent 25%), radial-gradient(circle at 85% 30%, rgba(192,132,252,0.06), transparent 25%), radial-gradient(circle at 50% 80%, rgba(56,189,248,0.06), transparent 25%)",
            }}
          />
          <Sidebar unreadCount={highPriorityCount} webhooksActive={Boolean(status?.webhooks)} />
          <main className="flex-1 flex flex-col h-full relative z-10 min-w-0">
            <TopBar />
            <div className="flex-1 overflow-y-auto p-6 lg:p-10">{children}</div>
          </main>
        </div>
        <CommandPalette />
        <ComposeModal />
        <GlobalShortcuts />
      </ComposeModalProvider>
    </CommandPaletteProvider>
  );
}
