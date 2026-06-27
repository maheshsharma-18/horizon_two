import Link from "next/link";
import { PushpinLogo } from "@/components/ui/PushpinLogo";

export function LandingHero() {
  return (
    <section className="relative pt-24 pb-32 px-6 lg:px-16 min-h-[90vh] flex flex-col items-center justify-center text-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-corsair-blue/20 via-corsair-purple/10 to-background -z-10" />
      <div className="absolute inset-0 -z-10 overflow-hidden opacity-40">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-corsair-purple/20 rounded-full blur-[100px]" />
      </div>

      <div className="inline-flex items-center gap-2 bg-white/40 backdrop-blur-xl border border-white/60 rounded-full px-4 py-2 mb-8 shadow-sm">
        <span className="bg-secondary-container text-on-secondary-container font-label-caps text-label-caps px-2 py-1 rounded-full uppercase">
          New
        </span>
        <span className="text-body-sm text-on-surface">Built on Corsair · Gmail + Calendar, one inbox</span>
      </div>

      <h1 className="font-display-xl text-[44px] sm:text-[56px] lg:text-[64px] leading-[1.1] tracking-tighter text-on-surface max-w-4xl mb-6">
        Your inbox, run by an agent — not the other way around.
      </h1>
      <p className="text-body-lg text-on-surface-variant max-w-2xl mb-10">
        Underpin connects to Gmail and Google Calendar through Corsair, then gets out of your way: AI-sorted
        priority, one-line summaries, and a chat that can actually send the email and the invite for you.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
        <Link href="/onboarding" className="pill-button-primary text-body-md flex items-center gap-2">
          Connect Workspace
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Link>
        <a href="#features" className="pill-button-secondary text-body-md">
          See how it works
        </a>
      </div>

      {/* Stylized preview — same visual language as the real dashboard, not a screenshot */}
      <div className="w-full max-w-3xl bg-white/40 rounded-lg border border-white/60 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.08)] backdrop-blur-xl p-6 text-left">
        <div className="flex items-center gap-2 mb-5">
          <PushpinLogo className="w-4 h-4 text-primary -rotate-12" />
          <span className="text-body-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Today&rsquo;s Focus
          </span>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="bg-white/60 border border-white/80 rounded-xl p-3 flex items-center justify-between shadow-sm">
            <div>
              <div className="font-semibold text-body-sm">Reply to John&rsquo;s email</div>
              <div className="text-body-xs text-on-surface-variant">AI: board deadline Thursday</div>
            </div>
            <span className="material-symbols-outlined text-primary text-[18px]">chevron_right</span>
          </div>
          <div className="bg-white/60 border border-white/80 rounded-xl p-3 flex items-center justify-between shadow-sm">
            <div>
              <div className="font-semibold text-body-sm">Resolve calendar conflict</div>
              <div className="text-body-xs text-on-surface-variant">2 meetings overlap at 2 PM</div>
            </div>
            <span className="material-symbols-outlined text-corsair-purple text-[18px]">chevron_right</span>
          </div>
        </div>
      </div>
    </section>
  );
}
