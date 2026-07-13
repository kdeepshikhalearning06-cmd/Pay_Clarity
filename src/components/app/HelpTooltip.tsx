import { useState, type ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Circle as CircleHelp } from "lucide-react";
import { cn } from "@/lib/utils";

export function HelpTooltip({
  content,
  children,
  side = "top",
  className,
}: {
  content: ReactNode;
  children?: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className={cn(
              "inline-flex items-center justify-center rounded-full text-muted-foreground/60 transition-colors hover:text-teal focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/30",
              className,
            )}
            aria-label="More information"
          >
            {children ?? <CircleHelp className="h-3.5 w-3.5" />}
          </button>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          className="max-w-[280px] rounded-lg border border-border/60 bg-popover px-3 py-2.5 text-xs leading-relaxed text-popover-foreground shadow-[var(--shadow-card)]"
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export const HELP_DEFINITIONS = {
  complianceReadiness:
    "Compliance readiness measures how prepared your organisation is for pay transparency reporting. It factors in data completeness, explanation coverage, and review progress.",
  jointAssessmentRisk:
    "Under the EU Pay Transparency Directive, a joint pay assessment is required when the pay gap exceeds 5% and cannot be objectively justified. This trigger is country-specific.",
  aiConfidenceScore:
    "AI confidence reflects how reliably the model can explain a pay gap using objective factors like tenure, geography, and experience. Lower confidence means human review is strongly recommended.",
  objectiveFactors:
    "Objective factors are non-discriminatory reasons that can explain pay differences. Examples include seniority, performance, experience, certifications, geographic adjustments, and leadership responsibilities.",
  thresholdExceeded:
    "The 5% threshold is the EU directive trigger for joint pay assessment. When the unexplained gender pay gap in a job category exceeds 5%, employers must investigate and document the cause.",
  humanReviewRequired:
    "AI-generated explanations cannot be submitted directly for compliance reporting. A human reviewer must approve, edit, or escalate each explanation to ensure accountability and accuracy.",
  reportingThreshold:
    "The minimum number of employees an organisation must have before pay transparency reporting obligations apply. This varies by country.",
  jointAssessmentThreshold:
    "The pay gap percentage that triggers a mandatory joint pay assessment with employee representatives. Typically 5% under the EU directive.",
  evidenceToKeep:
    "Documentation that supports your pay decisions and explanations. Keeping this evidence is essential for audit defence and compliance verification.",
};
