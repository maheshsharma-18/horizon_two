import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingHero } from "@/components/landing/LandingHero";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import { PoweredByCorsair } from "@/components/landing/PoweredByCorsair";
import { FinalCTA, LandingFooter } from "@/components/landing/FinalCTA";

// "/" is the public marketing page. The one piece of access control this
// single-tenant demo has is onboarding completion (underpin_onboarding_profile
// .completedAt) — there's no per-browser session/login system, since Corsair's
// OAuth here is tenant-level, not end-user-level (see README). So "logged in"
// is modeled as "this tenant has finished onboarding": if so, hitting the
// domain root sends you straight to your dashboard instead of the landing
// page a first-time visitor would see.
export default async function RootPage() {
  const profile = await api.onboarding.getProfile().catch(() => null);
  if (profile?.completedAt) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <LandingHero />
      <FeatureShowcase />
      <PoweredByCorsair />
      <FinalCTA />
      <LandingFooter />
    </div>
  );
}
