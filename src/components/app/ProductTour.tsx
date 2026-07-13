import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  LayoutDashboard,
  Database,
  Workflow,
  ClipboardCheck,
  Scale,
  Bot,
  Bell,
  FileText,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTourActive, markTourCompleted, stopTour } from "@/lib/tour-store";
import { toast } from "sonner";

type TourStep = {
  id: string;
  title: string;
  description: string;
  icon: typeof LayoutDashboard;
  selector: string;
  route?: string;
};

const TOUR_STEPS: TourStep[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    description: "This is your compliance readiness overview. Track pay gaps, active risks, and assessment progress at a glance.",
    icon: LayoutDashboard,
    selector: '[data-tour="dashboard"]',
  },
  {
    id: "data-sources",
    title: "Data Sources",
    description: "Upload payroll exports and employee data here. PayClarity validates and processes your files for analysis.",
    icon: Database,
    selector: '[data-tour="data-sources"]',
  },
  {
    id: "workflow",
    title: "Workflow Strip",
    description: "Every assessment moves through eight stages from upload to final report generation. Track progress at each step.",
    icon: Workflow,
    selector: '[data-tour="workflow"]',
  },
  {
    id: "human-review",
    title: "Human Review",
    description: "AI suggestions always require human approval before becoming report-ready. Review, approve, or escalate each explanation.",
    icon: ClipboardCheck,
    selector: '[data-tour="human-review"]',
  },
  {
    id: "compliance",
    title: "Compliance Library",
    description: "Country-specific legal requirements and implementation guidance live here. Your workspace country determines which rules apply.",
    icon: Scale,
    selector: '[data-tour="compliance"]',
  },
  {
    id: "copilot",
    title: "AI Copilot",
    description: "Ask questions about risks, thresholds, explanations, and reporting requirements. The copilot uses your workspace context.",
    icon: Bot,
    selector: '[data-tour="copilot"]',
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Review assignments, threshold alerts, and deadlines appear here. Stay on top of compliance tasks.",
    icon: Bell,
    selector: '[data-tour="notifications"]',
  },
  {
    id: "generate-report",
    title: "Generate Report",
    description: "Export submission-ready compliance packages once approvals are complete. Reports follow your country's requirements.",
    icon: FileText,
    selector: '[data-tour="generate-report"]',
  },
];

export function ProductTour() {
  const [active, , stop] = useTourActive();
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentStep = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  const updatePosition = useCallback(() => {
    const el = document.querySelector(currentStep.selector) as HTMLElement | null;
    if (!el) {
      setTargetRect(null);
      setTooltipPos({ top: window.innerHeight / 2 - 100, left: window.innerWidth / 2 - 200 });
      return;
    }
    el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    const rect = el.getBoundingClientRect();
    setTargetRect(rect);

    const tooltipWidth = 380;
    const tooltipHeight = 200;
    let top = rect.bottom + 12;
    let left = rect.left + rect.width / 2 - tooltipWidth / 2;

    if (top + tooltipHeight > window.innerHeight - 20) {
      top = rect.top - tooltipHeight - 12;
    }
    if (top < 20) top = rect.bottom + 12;

    if (left < 20) left = 20;
    if (left + tooltipWidth > window.innerWidth - 20) left = window.innerWidth - tooltipWidth - 20;

    setTooltipPos({ top, left });
  }, [currentStep.selector]);

  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(updatePosition, 100);
    return () => clearTimeout(timer);
  }, [active, step, updatePosition]);

  useEffect(() => {
    if (!active) return;
    const handleResize = () => updatePosition();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
    };
  }, [active, updatePosition]);

  const handleNext = () => {
    if (isLast) {
      handleFinish();
      return;
    }
    setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSkip = () => {
    markTourCompleted();
    stop();
    setStep(0);
    toast("Tour skipped — you can restart it anytime from Help Center");
  };

  const handleFinish = () => {
    markTourCompleted();
    stop();
    setStep(0);
    toast.success("Tour complete! Explore PayClarity at your own pace.");
  };

  if (!active) return null;

  const padding = 8;
  const spotlight = targetRect
    ? {
        top: targetRect.top - padding,
        left: targetRect.left - padding,
        width: targetRect.width + padding * 2,
        height: targetRect.height + padding * 2,
      }
    : null;

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      {/* Dark overlay */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={handleSkip}
      />

      {/* Spotlight */}
      {spotlight && (
        <div
          className="absolute rounded-lg bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] ring-2 ring-teal/60 transition-all duration-300"
          style={{
            top: spotlight.top,
            left: spotlight.left,
            width: spotlight.width,
            height: spotlight.height,
          }}
        />
      )}

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          ref={tooltipRef}
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -8 }}
          transition={{ duration: 0.2 }}
          className="fixed z-[101] w-[380px] rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]"
          style={{ top: tooltipPos.top, left: tooltipPos.left }}
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-[image:var(--gradient-teal)] text-teal-foreground">
                <currentStep.icon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-teal">
                  Product tour
                </div>
                <div className="font-display text-base font-semibold">
                  {currentStep.title}
                </div>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Skip tour"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Description */}
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {currentStep.description}
          </p>

          {/* Progress */}
          <div className="mt-4 flex items-center gap-2">
            <div className="flex flex-1 gap-1">
              {TOUR_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors",
                    i <= step ? "bg-teal" : "bg-muted",
                  )}
                />
              ))}
            </div>
            <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
              {step + 1} of {TOUR_STEPS.length}
            </span>
          </div>

          {/* Controls */}
          <div className="mt-4 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              Skip tour
            </Button>
            <div className="flex gap-2">
              {step > 0 && (
                <Button variant="outline" size="sm" onClick={handlePrev}>
                  <ChevronLeft className="mr-0.5 h-3.5 w-3.5" /> Back
                </Button>
              )}
              {isLast ? (
                <Button variant="hero" size="sm" onClick={handleFinish}>
                  <Check className="mr-0.5 h-3.5 w-3.5" /> Finish
                </Button>
              ) : (
                <Button variant="hero" size="sm" onClick={handleNext}>
                  Next <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>,
    document.body,
  );
}
