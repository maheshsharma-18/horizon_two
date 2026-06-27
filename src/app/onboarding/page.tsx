"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Step1Welcome } from "@/components/onboarding/Step1Welcome";
import { Step2Connect } from "@/components/onboarding/Step2Connect";
import { Step3Workflow } from "@/components/onboarding/Step3Workflow";
import { Step4Preferences } from "@/components/onboarding/Step4Preferences";
import { Step5Confirm } from "@/components/onboarding/Step5Confirm";
import { api } from "@/trpc/react";
import type { AIPreferences, WorkflowProfile } from "@/lib/types";

const DEFAULT_PREFERENCES: AIPreferences = {
  aiDrafting: true,
  smartPriority: true,
  realtimeNotifications: true,
  autonomousScheduling: true,
  keyboardShortcuts: true,
  mcpAgentChat: true,
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [workflowProfile, setWorkflowProfile] = useState<WorkflowProfile | null>(null);
  const [preferences, setPreferences] = useState<AIPreferences>(DEFAULT_PREFERENCES);

  const saveProfile = api.onboarding.saveProfile.useMutation();
  const complete = api.onboarding.complete.useMutation();
  const [isLaunching, setIsLaunching] = useState(false);

  const { data: existingProfile } = api.onboarding.getProfile.useQuery();
  useEffect(() => {
    if (existingProfile?.completedAt) router.replace("/dashboard");
  }, [existingProfile, router]);

  async function handleLaunch() {
    if (!workflowProfile) return;
    setIsLaunching(true);
    try {
      await saveProfile.mutateAsync({ workflowProfile, ...preferences });
      await complete.mutateAsync();
      router.push("/dashboard");
    } finally {
      setIsLaunching(false);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-surface p-4">
      <div className="glass-panel w-full max-w-2xl rounded-lg p-10 relative overflow-hidden flex flex-col min-h-[560px]">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />

        {step === 1 && <Step1Welcome onNext={() => setStep(2)} />}
        {step === 2 && <Step2Connect onNext={() => setStep(3)} />}
        {step === 3 && (
          <Step3Workflow value={workflowProfile} onChange={setWorkflowProfile} onNext={() => setStep(4)} />
        )}
        {step === 4 && (
          <Step4Preferences
            value={preferences}
            onChange={(key, value) => setPreferences((prev) => ({ ...prev, [key]: value }))}
            onNext={() => setStep(5)}
          />
        )}
        {step === 5 && <Step5Confirm onLaunch={handleLaunch} isLaunching={isLaunching} />}
      </div>
    </div>
  );
}
