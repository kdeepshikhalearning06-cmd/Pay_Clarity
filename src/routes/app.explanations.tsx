import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { Bot, ArrowLeft, ArrowRight, Check, X, Pencil, Flag, Sparkles, CircleAlert as AlertCircle, CircleCheck as CheckCircle2, TrendingUp, FileText, Info, ChevronDown, ChevronUp } from "lucide-react";
import { PageHeader } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { WorkflowStrip } from "@/components/app/WorkflowStrip";
import { ComplianceAlert } from "@/components/app/ComplianceAlert";
import { useDemoMode, useUploadedFiles } from "@/lib/demo-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";


export const Route = createFileRoute("/app/explanations")({
  head: () => ({
    meta: [
      { title: "AI explanations — PayClarity" },
      {
        name: "description",
        content:
          "AI-drafted explanations for pay gaps — transparent, reviewable, and auditable.",
      },
    ],
  }),
  component: ExplanationsPage,
});

type DraftStatus = "pending" | "accepted" | "rejected" | "edited" | "review";

type ExplanationData = {
  id: string;
  category: string;
  gapPct: number;
  factors: { label: string; detail: string; contribution: number }[];
  dataPoints: string[];
  confidence: number;
  limitations: string[];
  draft: string;
};

const EXPLANATIONS: ExplanationData[] = [
  {
    id: "exp_1",
    category: "Engineering IC Level 2",
    gapPct: 6.3,
    factors: [
      {
        label: "Tenure distribution",
        detail:
          "Male employees average 2.1 years longer in role, accounting for ~1.5 pts of the gap.",
        contribution: 1.5,
      },
      {
        label: "Geographic salary adjustments",
        detail:
          "Berlin-based roles command higher market rates than Amsterdam, accounting for ~1.2 pts.",
        contribution: 1.2,
      },
      {
        label: "Experience levels",
        detail:
          "Senior experience band concentration is higher among male employees, accounting for ~0.7 pts.",
        contribution: 0.7,
      },
    ],
    dataPoints: [
      "42 employee records across 2 countries",
      "Tenure data from HR system (joined_date field)",
      "Geographic cost-of-living index (Eurostat 2025)",
      "Performance ratings from 2025 review cycle",
    ],
    confidence: 78,
    limitations: [
      "Tenure data does not capture prior external experience",
      "Performance ratings are self-reported by managers and may contain bias",
      "Sample size of 42 employees limits statistical confidence",
    ],
    draft:
      "Engineering IC Level 2 shows a 6.3% pay gap. Initial analysis suggests the difference may be partially explained by tenure distribution (male employees average 2.1 years longer in role) and geographic salary adjustments (Berlin vs Amsterdam market rates). Objective factors account for approximately 3.4 percentage points. The remaining 2.9 percentage points require human review before this explanation can be used for compliance reporting.",
  },
  {
    id: "exp_2",
    category: "Engineering Management",
    gapPct: 6.7,
    factors: [
      {
        label: "Seniority differences",
        detail:
          "Two male managers at Director level with longer tenure skew the median upward.",
        contribution: 4.1,
      },
      {
        label: "Market premium roles",
        detail:
          "Director-level roles carry a market premium in the German engineering market.",
        contribution: 1.0,
      },
    ],
    dataPoints: [
      "12 employee records across 2 countries",
      "Job grade and level data from HR system",
      "Market salary benchmarking data (Mercer 2025)",
      "Tenure data from HR system",
    ],
    confidence: 65,
    limitations: [
      "Small sample size (12 employees) limits statistical significance",
      "Director-level roles are difficult to benchmark due to unique scope",
      "Market premium assessment is based on external benchmarks and may not reflect internal equity",
    ],
    draft:
      "Engineering Management shows a 6.7% pay gap. The small sample size (12 employees) means the gap is heavily influenced by two male Director-level managers with longer tenure. Seniority differences and market premium for Director roles in Germany account for approximately 5.1 percentage points. The remaining 1.6 percentage points may not be statistically significant given the sample size. Human review is strongly recommended before using this explanation for compliance reporting.",
  },
  {
    id: "exp_3",
    category: "Data & Analytics",
    gapPct: 7.3,
    factors: [
      {
        label: "Market premium roles",
        detail:
          "Data engineering roles command a market premium in Germany, accounting for ~2.8 pts.",
        contribution: 2.8,
      },
      {
        label: "Experience levels",
        detail:
          "Male employees in this category have on average 3.5 more years of relevant experience.",
        contribution: 1.5,
      },
      {
        label: "Geographic salary adjustments",
        detail:
          "Paris-based analytics roles have lower market rates than Frankfurt-based engineering roles.",
        contribution: 1.0,
      },
    ],
    dataPoints: [
      "11 employee records across 2 countries",
      "Market salary benchmarking data (Mercer 2025)",
      "Experience data from CV parsing (AI-extracted)",
      "Geographic cost-of-living index (Eurostat 2025)",
    ],
    confidence: 72,
    limitations: [
      "Experience data is AI-extracted from CVs and may contain errors",
      "Market premium assessment varies by source and methodology",
      "Small sample size (11 employees) limits statistical confidence",
    ],
    draft:
      "Data & Analytics shows a 7.3% pay gap. Analysis suggests the difference may be partially explained by market premium for data engineering roles in Germany (~2.8 pts), experience level differences (~1.5 pts), and geographic adjustments between Paris and Frankfurt (~1.0 pt). Objective factors account for approximately 5.3 percentage points. The remaining 2.0 percentage points require documented justification and human review.",
  },
];

function ExplanationsPage() {
  const [demo] = useDemoMode();
  const files = useUploadedFiles();
  const hasData = demo || files.length > 0;

  const [statuses, setStatuses] = useState<Record<string, DraftStatus>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [realExplanations, setRealExplanations] =
  useState<ExplanationData[]>([]);

  const generateMissingExplanations = async () => {
    console.log("🚀 generateMissingExplanations started");

  const { data: analyses, error } = await supabase
    .from("pay_gap_analyses")
    .select(`
      id,
      pay_gap_percent,
      male_average_salary,
      female_average_salary,
      employee_count,
      analysis_status,
      job_group_id,
      job_groups (
        group_name
      )
    `)
    .eq("exceeds_threshold", true)

    console.log("Analyses needing explanation:", analyses);


  if (error) {
    console.error(
      "Failed fetching analyses:",
      error
    );
    return;
  }


  if (!analyses || analyses.length === 0) {
    return;
  }


  const explanations = analyses.map((analysis: any) => ({
    pay_gap_analysis_id: analysis.id,

    explanation:
      `A pay gap of ${analysis.pay_gap_percent.toFixed(1)}% was identified in ${analysis.job_groups?.group_name || "this job group"}. The difference requires review based on compensation factors, role distribution, experience, and seniority structure.`,

    confidence_tag: "medium",

    objective_factors: {
      male_average_salary:
        analysis.male_average_salary,

      female_average_salary:
        analysis.female_average_salary,

      employee_count:
        analysis.employee_count,

      pay_gap_percent:
        analysis.pay_gap_percent
    },

    requires_human_review: true
  }));


  const { error: insertError } = await supabase
    .from("ai_explanations")
    .insert(explanations);


  if (insertError) {
    console.error(
      "Failed creating explanations:",
      insertError
    );
    return;
  }


  console.log(
    "Generated explanations:",
    explanations
  );
};

  useEffect(() => {
  if (demo) return;


  const loadExplanations = async () => {

    const { data, error } = await supabase
      .from("ai_explanations")
      .select(`
        *,
        pay_gap_analyses (
          id,
          pay_gap_percent,
          job_group_id,
          job_groups (
            group_name
          )
        )
      `);


    if (error) {
      console.error(
        "Failed to load explanations:",
        error
      );
      return;
    }


    console.log(
      "AI explanations:",
      data
    );


    if (!data || data.length === 0) {

      await generateMissingExplanations();

      // reload after generation
      loadExplanations();

      return;
    }


    setRealExplanations(data as any);
  };


  loadExplanations();

}, [demo]);

  const [dbExplanations, setDbExplanations] =
  useState<ExplanationData[]>([]);

  const stats = useMemo(() => {
    const accepted = Object.values(statuses).filter(
      (s) => s === "accepted",
    ).length;
    const rejected = Object.values(statuses).filter(
      (s) => s === "rejected",
    ).length;
    const edited = Object.values(statuses).filter(
      (s) => s === "edited",
    ).length;
    const flagged = Object.values(statuses).filter(
      (s) => s === "review",
    ).length;
    const pending = EXPLANATIONS.filter(
      (e) => !statuses[e.id] || statuses[e.id] === "pending",
    ).length;
    return { accepted, rejected, edited, flagged, pending };
  }, [statuses]);

  const updateStatus = (id: string, status: DraftStatus) => {
    setStatuses((prev) => ({ ...prev, [id]: status }));
    const labels: Record<DraftStatus, string> = {
      pending: "reset to pending",
      accepted: "accepted",
      rejected: "rejected",
      edited: "updated",
      review: "sent for human review",
    };
    toast.success(`Draft ${labels[status]}`);
  };

  const handleStartEdit = (exp: ExplanationData) => {
    setEditingId(exp.id);
    setEditValue(exp.draft);
  };

  const handleSaveEdit = (id: string) => {
    setEditingId(null);
    updateStatus(id, "edited");
  };

  if (!hasData) {
    return (
      <div className="mx-auto max-w-4xl">
        <PageHeader
          title="AI explanations"
          description="AI-drafted explanations for pay gaps with human review"
        />
        <NoDataState />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="AI explanations"
        description="AI-drafted explanations for pay differences — transparent, reviewable, and auditable"
        actions={
          <Button variant="outline" asChild>
            <Link to="/app/gap-analysis">
              <ArrowLeft className="mr-1 h-4 w-4" /> Gap analysis
            </Link>
          </Button>
        }
      />

      <div className="mb-6">
        <WorkflowStrip current="explain" />
      </div>

      {/* Compliance alert */}
      <div className="mb-6">
        <ComplianceAlert
          tone="info"
          title="AI explanations are drafts, not legal advice"
          message="Draft explanations should not be treated as legal advice. They are AI-generated documentation for human review. Final responsibility for compliance reporting remains with the employer and qualified legal counsel."
          linkTo="/app/compliance"
          linkLabel="View compliance library →"
        />
      </div>

      {/* AI info banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-start gap-3 rounded-2xl border border-teal/30 bg-teal/5 p-4"
      >
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[image:var(--gradient-teal)] text-teal-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium">
            AI has drafted {EXPLANATIONS.length} explanations for categories
            above the 5% threshold
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            The AI only drafts documentation for human review. It never makes
            final decisions. Accept, edit, or reject each draft before it can
            be used in compliance reporting.
          </div>
        </div>
      </motion.div>

      {/* Progress stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Accepted",
            value: stats.accepted,
            icon: CheckCircle2,
            tone: "text-success",
          },
          {
            label: "Edited",
            value: stats.edited,
            icon: Pencil,
            tone: "text-teal",
          },
          {
            label: "Sent to review",
            value: stats.flagged,
            icon: Flag,
            tone: "text-warning",
          },
          {
            label: "Pending",
            value: stats.pending,
            icon: AlertCircle,
            tone: "text-muted-foreground",
          },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-2xl border border-border/60 bg-card p-4 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-teal/40"
          >
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {m.label}
              </div>
              <m.icon className={cn("h-4 w-4", m.tone)} />
            </div>
            <div className="mt-2 font-display text-2xl font-semibold tabular-nums">
              {m.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Explanation cards */}
      <div className="space-y-4">
        {EXPLANATIONS.map((exp, i) => {
          const status = statuses[exp.id] ?? "pending";
          return (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "rounded-2xl border bg-card p-5 shadow-[var(--shadow-card)] transition-all",
                status === "accepted" && "border-success/30",
                status === "rejected" && "border-border/60 opacity-50",
                status === "edited" && "border-teal/40",
                status === "review" && "border-warning/30",
                status === "pending" && "border-border/60",
              )}
            >
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-sm font-semibold">
                      {exp.category}
                    </h3>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium",
                        exp.gapPct >= 5
                          ? "bg-warning/10 text-warning"
                          : "bg-success/10 text-success",
                      )}
                    >
                      {exp.gapPct.toFixed(1)}% gap
                    </span>
                    <StatusBadge status={status} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ConfidenceMeter confidence={exp.confidence} />
                </div>
              </div>

              {/* Draft explanation */}
              <div className="mt-4 rounded-xl border border-teal/30 bg-teal/5 p-4">
                <div className="flex items-start gap-2">
                  <Bot className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
                  {editingId === exp.id ? (
                    <div className="min-w-0 flex-1">
                      <Textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="min-h-[120px] bg-background text-sm leading-relaxed"
                        autoFocus
                      />
                      <div className="mt-2 flex gap-2">
                        <Button
                          size="sm"
                          variant="hero"
                          onClick={() => handleSaveEdit(exp.id)}
                        >
                          <Check className="mr-1 h-3.5 w-3.5" /> Save edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="mr-1 h-3.5 w-3.5" /> Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {exp.draft}
                    </p>
                  )}
                </div>
              </div>

              {/* Explainability section */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(
                      expandedId === exp.id ? null : exp.id,
                    )
                  }
                  className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Info className="h-3.5 w-3.5 text-teal" />
                  Explainability
                  {expandedId === exp.id ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedId === exp.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 space-y-4">
                        {/* Factors considered */}
                        <div>
                          <div className="text-xs font-medium text-foreground">
                            Factors considered
                          </div>
                          <div className="mt-2 space-y-2">
                            {exp.factors.map((f) => (
                              <div
                                key={f.label}
                                className="rounded-lg border border-border/60 bg-background p-3"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="text-sm font-medium">
                                    {f.label}
                                  </div>
                                  <span className="rounded-full bg-teal/10 px-2 py-0.5 text-[10px] font-medium text-teal">
                                    +{f.contribution} pts
                                  </span>
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                  {f.detail}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Data points used */}
                        <div>
                          <div className="text-xs font-medium text-foreground">
                            Data points used
                          </div>
                          <ul className="mt-2 space-y-1">
                            {exp.dataPoints.map((d) => (
                              <li
                                key={d}
                                className="flex items-start gap-2 text-xs text-muted-foreground"
                              >
                                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-teal" />
                                {d}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Limitations */}
                        <div>
                          <div className="text-xs font-medium text-foreground">
                            Limitations of analysis
                          </div>
                          <ul className="mt-2 space-y-1">
                            {exp.limitations.map((l) => (
                              <li
                                key={l}
                                className="flex items-start gap-2 text-xs text-muted-foreground"
                              >
                                <AlertCircle className="mt-0.5 h-3 w-3 shrink-0 text-warning" />
                                {l}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Actions */}
              {editingId !== exp.id && (
                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  {status === "pending" || status === "edited" ? (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateStatus(exp.id, "accepted")}
                      >
                        <Check className="mr-1 h-3.5 w-3.5 text-success" />
                        Accept draft
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStartEdit(exp)}
                      >
                        <Pencil className="mr-1 h-3.5 w-3.5" />
                        Edit draft
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateStatus(exp.id, "rejected")}
                      >
                        <X className="mr-1 h-3.5 w-3.5 text-destructive" />
                        Reject draft
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateStatus(exp.id, "review")}
                      >
                        <Flag className="mr-1 h-3.5 w-3.5 text-warning" />
                        Send for human review
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        updateStatus(exp.id, "pending")
                      }
                    >
                      Reset to pending
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Bottom navigation */}
      <div className="mt-6 flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link to="/app/gap-analysis">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to gap analysis
          </Link>
        </Button>
        <Button variant="hero" asChild>
          <Link to="/app/human-review">
            Continue to human review{" "}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: DraftStatus }) {
  const map = {
    pending: { label: "Pending", className: "bg-muted text-muted-foreground" },
    accepted: { label: "Accepted", className: "bg-success/10 text-success" },
    rejected: { label: "Rejected", className: "bg-muted text-muted-foreground" },
    edited: { label: "Edited", className: "bg-teal/10 text-teal" },
    review: { label: "In review", className: "bg-warning/10 text-warning" },
  } as const;
  const m = map[status];
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-medium",
        m.className,
      )}
    >
      {m.label}
    </span>
  );
}

function ConfidenceMeter({ confidence }: { confidence: number }) {
  const tone =
    confidence >= 80
      ? "text-success"
      : confidence >= 65
        ? "text-teal"
        : "text-warning";
  const barColor =
    confidence >= 80
      ? "bg-success"
      : confidence >= 65
        ? "bg-teal"
        : "bg-warning";
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1.5">
        <span className={cn("text-sm font-semibold tabular-nums", tone)}>
          {confidence}%
        </span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          confidence
        </span>
      </div>
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", barColor)}
          style={{ width: `${confidence}%` }}
        />
      </div>
    </div>
  );
}

function NoDataState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-10 text-center shadow-[var(--shadow-card)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-24 h-56 opacity-60"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div className="relative">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-glow)]">
          <Bot className="h-6 w-6" />
        </div>
        <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight">
          No explanations to draft
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          Complete gap analysis first. AI will then draft explanations for
          job categories above the 5% threshold, ready for your review.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Button variant="hero" asChild>
            <Link to="/app/gap-analysis">Go to gap analysis</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/app">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
