import Link from "next/link";
import { PushpinLogo } from "@/components/ui/PushpinLogo";

export function FinalCTA() {
  return (
    <section className="relative py-32 px-6 lg:px-16 overflow-hidden flex flex-col items-center justify-center text-center min-h-[60vh]">
      <div className="absolute inset-0 bg-surface -z-10" />
      <div
        className="absolute inset-0 opacity-20 -z-10"
        style={{
          background:
            "radial-gradient(circle at 10% 20%, #312e81 0%, transparent 50%), radial-gradient(circle at 90% 80%, #581c87 0%, transparent 50%), radial-gradient(circle at 50% 50%, #134e4a 0%, transparent 70%)",
        }}
      />
      <h2 className="text-display-xl text-[36px] sm:text-[48px] leading-tight mb-8 max-w-2xl text-on-surface">
        Let&rsquo;s get your inbox under control.
      </h2>
      <Link href="/onboarding" className="pill-button-primary text-body-md flex items-center gap-2">
        Connect Workspace
        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
      </Link>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="w-full py-8 px-6 lg:px-16 border-t border-white/40">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 font-bold text-on-surface">
          <PushpinLogo className="w-5 h-5 text-primary -rotate-12" />
          Underpin
        </div>
        <div className="text-body-sm text-on-surface-variant">
          Built for the Corsair hackathon · Gmail + Calendar, powered by Corsair
        </div>
      </div>
    </footer>
  );
}
