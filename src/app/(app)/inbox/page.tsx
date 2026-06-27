import { api } from "@/trpc/server";
import { InboxList } from "@/components/dashboard/InboxList";

export default async function InboxPage() {
  const threads = await api.gmail.listThreads({ query: "", limit: 100, offset: 0 }).catch(() => []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-headline-lg font-bold flex items-center gap-2">
          <span className="material-symbols-outlined">inbox</span> Priority Inbox
        </h1>
        <span className="text-body-sm text-on-surface-variant">{threads.length} threads</span>
      </div>

      <InboxList initialThreads={threads} />
    </div>
  );
}
