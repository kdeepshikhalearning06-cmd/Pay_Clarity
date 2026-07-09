import { motion } from "motion/react";
import {
  Upload,
  ShieldCheck,
  Users,
  Workflow,
  LineChart,
  Bot,
  ClipboardCheck,
  FileCheck2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "upload", label: "Upload data", icon: Upload },
  { key: "validate", label: "Validate", icon: ShieldCheck },
  { key: "review", label: "Review data", icon: Users },
  { key: "grouping", label: "AI grouping", icon: Workflow },
  { key: "gap", label: "Gap analysis", icon: LineChart },
  { key: "explain", label: "AI explanations", icon: Bot },
  { key: "human", label: "Human review", icon: ClipboardCheck },
  { key: "report", label: "Generate report", icon: FileCheck2 },
] as const;

export type WorkflowStep = (typeof STEPS)[number]["key"];

export function WorkflowStrip({ current = "upload" }: { current?: WorkflowStep }) {
  const currentIdx = STEPS.findIndex((s) => s.key === current);
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="font-display text-sm font-semibold">Compliance workflow</div>
          <div className="text-xs text-muted-foreground">
            From payroll snapshot to submission-ready report
          </div>
        </div>
        <div className="text-[11px] text-muted-foreground">
          Step {currentIdx + 1} of {STEPS.length}
        </div>
      </div>
      <div className="relative">
        <div className="absolute left-0 right-0 top-4 h-0.5 bg-muted" />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(currentIdx / (STEPS.length - 1)) * 100}%` }}
          transition={{ duration: 0.6 }}
          className="absolute left-0 top-4 h-0.5 bg-teal"
        />
        <ol className="relative grid grid-cols-4 gap-y-4 md:grid-cols-8">
          {STEPS.map((s, i) => {
            const done = i < currentIdx;
            const active = i === currentIdx;
            return (
              <li key={s.key} className="flex flex-col items-center text-center">
                <div
                  className={cn(
                    "grid h-8 w-8 place-items-center rounded-full border-2 bg-background transition-all",
                    done && "border-teal bg-teal text-teal-foreground",
                    active && "border-teal shadow-[var(--shadow-glow)]",
                    !done && !active && "border-border text-muted-foreground",
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : <s.icon className={cn("h-3.5 w-3.5", active && "text-teal")} />}
                </div>
                <div
                  className={cn(
                    "mt-1.5 text-[10px] font-medium leading-tight",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s.label}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}