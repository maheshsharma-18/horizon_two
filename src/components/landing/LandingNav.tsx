import Link from "next/link";
import { PushpinLogo } from "@/components/ui/PushpinLogo";

export function LandingNav() {
  return (
    <nav className="sticky top-0 z-30 flex items-center justify-between px-6 lg:px-16 py-5 backdrop-blur-xl bg-background/70 border-b border-white/40">
      <Link href="/" className="flex items-center gap-2 font-bold text-lg text-on-surface">
        <PushpinLogo className="w-6 h-6 text-primary -rotate-12" />
        Underpin
      </Link>
      <div className="hidden md:flex items-center gap-8">
        <a href="#features" className="text-on-surface-variant font-medium hover:text-primary transition-colors text-body-sm">
          Features
        </a>
        <a href="#corsair" className="text-on-surface-variant font-medium hover:text-primary transition-colors text-body-sm">
          Powered by Corsair
        </a>
      </div>
      <Link href="/onboarding" className="pill-button-secondary text-body-sm py-2 px-5">
        Get Started
      </Link>
    </nav>
  );
}
