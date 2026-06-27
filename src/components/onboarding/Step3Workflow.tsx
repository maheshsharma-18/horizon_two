import type { WorkflowProfile } from "@/lib/types";

const PERSONAS: { id: WorkflowProfile; icon: string; label: string; color: string }[] = [
  { id: "business", icon: "work", label: "Business", color: "text-primary" },
  { id: "founder", icon: "rocket_launch", label: "Founder", color: "text-corsair-purple" },
  { id: "student", icon: "school", label: "Student", color: "text-blue-500" },
  { id: "recruiter", icon: "groups", label: "Recruiter", color: "text-green-500" },
  { id: "sales", icon: "trending_up", label: "Sales", color: "text-orange-500" },
  { id: "developer", icon: "code", label: "Developer", color: "text-on-surface-variant" },
];

interface Step3WorkflowProps {
  value: WorkflowProfile | null;
  onChange: (value: WorkflowProfile) => void;
  onNext: () => void;
}

export function Step3Workflow({ value, onChange, onNext }: Step3WorkflowProps) {
  return (
    <div className="flex flex-col h-full pt-4 animate-fade-up">
      <h2 className="text-headline-lg font-bold mb-2">How do you work?</h2>
      <p className="text-on-surface-variant mb-8">We'll configure your dashboard widgets accordingly.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {PERSONAS.map((p) => (
          <button
            key={p.id}
            onClick={() => onChange(p.id)}
            className={`glass-card p-4 rounded-2xl flex flex-col items-center text-center gap-2 transition-colors ${
              value === p.id ? "border-primary bg-white/80 ring-2 ring-primary/20" : "hover:border-primary/50"
            }`}
          >
            <span className={`material-symbols-outlined text-2xl ${p.color}`}>{p.icon}</span>
            <span className="font-semibold">{p.label}</span>
          </button>
        ))}
      </div>

      <button onClick={onNext} disabled={!value} className="bg-on-surface text-inverse-on-surface rounded-full py-3 px-8 font-semibold hover:opacity-90 transition-opacity active:scale-95 self-end w-full sm:w-auto disabled:opacity-40">
        Continue
      </button>
    </div>
  );
}
