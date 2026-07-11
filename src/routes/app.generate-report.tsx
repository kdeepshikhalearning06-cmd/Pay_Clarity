import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { FileCheck as FileCheck2, ArrowLeft, ArrowRight, Download, Copy, FileSpreadsheet, Package, ShieldCheck, TriangleAlert as AlertTriangle, CircleAlert as AlertCircle, CircleCheck as CheckCircle2, TrendingDown, Users, Building2, Lightbulb, CalendarClock, CircleCheck as CheckCircle } from "lucide-react";
import { PageHeader } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { WorkflowStrip } from "@/components/app/WorkflowStrip";
import { useDemoMode, useUploadedFiles } from "@/lib/demo-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/app/generate-report")({
  head: () => ({
    meta: [
      { title: "Generate report — PayClarity" },
      {
        name: "description",
        content:
          "Executive-ready pay transparency compliance report with audit trail.",
      },
    ],
  }),
  component: GenerateReportPage,
});

type CategoryFinding = {
  id: string;
  name: string;
  gapPct: number;
  explanationStatus: "approved" | "drafted" | "none" | "flagged";
  humanApproval: "approved" | "pending" | "rejected" | "escalated";
  riskLevel: "low" | "medium" | "high";
  threshold: "healthy" | "requires_explanation" | "joint_assessment";
};

const CATEGORY_FINDINGS: CategoryFinding[] = [
  {
    id: "cf_1",
    name: "Engineering IC Level 2",
    gapPct: 6.3,
    explanationStatus: "drafted",
    humanApproval: "pending",
    riskLevel: "medium",
    threshold: "requires_explanation",
  },
  {
    id: "cf_2",
    name: "Engineering IC Level 3",
    gapPct: 2.5,
    explanationStatus: "none",
    humanApproval: "approved",
    riskLevel: "low",
    threshold: "healthy",
  },
  {
    id: "cf_3",
    name: "Engineering Management",
    gapPct: 6.7,
    explanationStatus: "flagged",
    humanApproval: "escalated",
    riskLevel: "high",
    threshold: "requires_explanation",
  },
  {
    id: "cf_4",
    name: "Sales IC Level 2",
    gapPct: 3.9,
    explanationStatus: "none",
    humanApproval: "approved",
    riskLevel: "low",
    threshold: "healthy",
  },
  {
    id: "cf_5",
    name: "Sales Management",
    gapPct: 9.4,
    explanationStatus: "flagged",
    humanApproval: "escalated",
    riskLevel: "high",
    threshold: "joint_assessment",
  },
  {
    id: "cf_6",
    name: "Product Management",
    gapPct: 2.1,
    explanationStatus: "none",
    humanApproval: "approved",
    riskLevel: "low",
    threshold: "healthy",
  },
  {
    id: "cf_7",
    name: "Data & Analytics",
    gapPct: 7.3,
    explanationStatus: "drafted",
    humanApproval: "pending",
    riskLevel: "medium",
    threshold: "requires_explanation",
  },
  {
    id: "cf_8",
    name: "People Operations",
    gapPct: 2.5,
    explanationStatus: "none",
    humanApproval: "approved",
    riskLevel: "low",
    threshold: "healthy",
  },
  {
    id: "cf_9",
    name: "Marketing IC",
    gapPct: 10.1,
    explanationStatus: "flagged",
    humanApproval: "escalated",
    riskLevel: "high",
    threshold: "joint_assessment",
  },
];

const RECOMMENDED_ACTIONS = [
  {
    id: "act_1",
    label: "Initiate joint pay assessment",
    detail:
      "Sales Management and Marketing IC exceed the 5% threshold with no objective justification. Initiate joint pay assessment per EU directive Article 10.",
    severity: "high" as const,
    categories: ["Sales Management", "Marketing IC"],
  },
  {
    id: "act_2",
    label: "Document objective justification",
    detail:
      "Engineering IC Level 2 and Data & Analytics have partial objective factors. Complete documentation before submission.",
    severity: "medium" as const,
    categories: ["Engineering IC Level 2", "Data & Analytics"],
  },
  {
    id: "act_3",
    label: "Review compensation policies",
    detail:
      "Engineering Management gap is influenced by seniority concentration. Review promotion and compensation policies for systemic bias.",
    severity: "medium" as const,
    categories: ["Engineering Management"],
  },
  {
    id: "act_4",
    label: "Monitor next reporting cycle",
    detail:
      "Healthy categories should be monitored in the next reporting cycle to ensure gaps remain below threshold.",
    severity: "low" as const,
    categories: [
      "Engineering IC Level 3",
      "Sales IC Level 2",
      "Product Management",
      "People Operations",
    ],
  },
];

function GenerateReportPage() {
  const [demo] = useDemoMode();
  const files = useUploadedFiles();
  const hasData = demo || files.length > 0;

  const stats = useMemo(() => {
    const totalEmployees = 184;
    const overallGap = 4.7;
    const medianGap = 3.9;
    const countriesCount = 4;
    const readiness = 78;
    const aboveThreshold = CATEGORY_FINDINGS.filter(
      (c) => c.threshold !== "healthy",
    ).length;
    const missingExplanations = CATEGORY_FINDINGS.filter(
      (c) => c.threshold !== "healthy" && c.explanationStatus !== "approved",
    ).length;
    const requireRemediation = CATEGORY_FINDINGS.filter(
      (c) => c.threshold === "joint_assessment",
    ).length;
    const requireJointAssessment = CATEGORY_FINDINGS.filter(
      (c) => c.threshold === "joint_assessment",
    ).length;
    const approved = CATEGORY_FINDINGS.filter(
      (c) => c.humanApproval === "approved",
    ).length;
    const completionPct = Math.round((approved / CATEGORY_FINDINGS.length) * 100);
    const remainingBlockers = CATEGORY_FINDINGS.filter(
      (c) => c.humanApproval !== "approved",
    ).length;
    return {
      totalEmployees,
      overallGap,
      medianGap,
      countriesCount,
      readiness,
      aboveThreshold,
      missingExplanations,
      requireRemediation,
      requireJointAssessment,
      completionPct,
      remainingBlockers,
    };
  }, []);

  const assessmentName = "FY2026 Pay Transparency Assessment";
  const assessmentDate = "March 12, 2026";

  const handleCopySummary = async () => {
    const text = [
      `PayClarity — ${assessmentName}`,
      `Assessment date: ${assessmentDate}`,
      `Employees analysed: ${stats.totalEmployees.toLocaleString()}`,
      `Countries included: ${stats.countriesCount}`,
      `Overall gender pay gap: ${stats.overallGap}%`,
      `Median gender pay gap: ${stats.medianGap}%`,
      `Compliance readiness: ${stats.readiness}%`,
      "",
      `${stats.aboveThreshold} categories above the 5% threshold`,
      `${stats.missingExplanations} categories missing approved explanations`,
      `${stats.requireJointAssessment} categories requiring joint pay assessment`,
      "",
      "Generated by PayClarity  ·  payclarity.app",
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Executive summary copied to clipboard");
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  const handleExportPdf = () => {
    const blob = new Blob(
      [`PayClarity Compliance Report — ${assessmentName} — ${assessmentDate}`],
      { type: "application/pdf" },
    );
    triggerDownload(blob, "payclarity-compliance-report.pdf");
    toast.success("PDF export ready");
  };

  const handleExportCsv = () => {
    const rows = [
      [
        "Job Category",
        "Gap %",
        "Explanation Status",
        "Human Approval",
        "Risk Level",
        "Threshold",
      ],
      ...CATEGORY_FINDINGS.map((c) => [
        c.name,
        `${c.gapPct.toFixed(1)}%`,
        c.explanationStatus,
        c.humanApproval,
        c.riskLevel,
        c.threshold,
      ]),
    ];
    const csv = rows
      .map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    triggerDownload(new Blob([csv], { type: "text/csv" }), "category-findings.csv");
    toast.success("CSV export ready");
  };

  const handleDownloadPackage = () => {
    toast.success("Full assessment package download started");
  };

  if (!hasData) {
    return (
      <div className="mx-auto max-w-4xl">
        <PageHeader
          title="Generate report"
          description="Executive-ready compliance report with audit trail"
        />
        <NoDataState />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Generate report"
        description="Executive-ready pay transparency compliance report — audit-ready and exportable"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/app/human-review">
                <ArrowLeft className="mr-1 h-4 w-4" /> Human review
              </Link>
            </Button>
          </div>
        }
      />

      <div className="mb-6">
        <WorkflowStrip current="report" />
      </div>

      {/* Compliance completion state */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "mb-6 relative overflow-hidden rounded-3xl border p-6 shadow-[var(--shadow-card)]",
          stats.completionPct >= 80
            ? "border-success/30 bg-card"
            : "border-warning/30 bg-card",
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-24 h-56 opacity-50"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "grid h-14 w-14 place-items-center rounded-2xl text-primary-foreground shadow-[var(--shadow-glow)]",
                stats.completionPct >= 80
                  ? "bg-[image:var(--gradient-teal)]"
                  : "bg-[image:var(--gradient-primary)]",
              )}
            >
              {stats.completionPct >= 80 ? (
                <CheckCircle className="h-7 w-7" />
              ) : (
                <ShieldCheck className="h-7 w-7" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-semibold tracking-tight">
                  {assessmentName}
                </h2>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest",
                    stats.completionPct >= 80
                      ? "bg-success/10 text-success"
                      : "bg-warning/10 text-warning",
                  )}
                >
                  {stats.completionPct >= 80
                    ? "Ready for submission"
                    : "In progress"}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {stats.completionPct >= 80
                  ? "All workflow stages complete. Report is ready for internal review and submission."
                  : `${stats.remainingBlockers} category${stats.remainingBlockers === 1 ? "" : "ies"} still require human approval before submission.`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div
              className={cn(
                "font-display text-4xl font-bold tabular-nums",
                stats.completionPct >= 80
                  ? "text-success"
                  : "text-warning",
              )}
            >
              {stats.completionPct}%
            </div>
            <div className="text-xs text-muted-foreground">
              Compliance readiness
            </div>
          </div>
        </div>
        <div className="relative mt-4 h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stats.completionPct}%` }}
            transition={{ duration: 0.8 }}
            className={cn(
              "h-full rounded-full",
              stats.completionPct >= 80 ? "bg-success" : "bg-warning",
            )}
          />
        </div>
        <div className="relative mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarClock className="h-3.5 w-3.5" />
            Assessment date: {assessmentDate}
          </span>
          <span className="flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            {stats.remainingBlockers} remaining blocker{stats.remainingBlockers === 1 ? "" : "s"}
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            Readiness score: {stats.readiness}%
          </span>
        </div>
      </motion.div>

      {/* Executive Summary */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]"
      >
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <FileCheck2 className="h-3.5 w-3.5 text-teal" /> Executive summary
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[
            {
              label: "Overall gap",
              value: `${stats.overallGap}%`,
              icon: TrendingDown,
              tone:
                stats.overallGap >= 5
                  ? "text-warning"
                  : "text-success",
            },
            {
              label: "Median gap",
              value: `${stats.medianGap}%`,
              icon: TrendingDown,
              tone:
                stats.medianGap >= 5
                  ? "text-warning"
                  : "text-success",
            },
            {
              label: "Employees",
              value: stats.totalEmployees.toLocaleString(),
              icon: Users,
              tone: "text-info",
            },
            {
              label: "Countries",
              value: String(stats.countriesCount),
              icon: Building2,
              tone: "text-info",
            },
            {
              label: "Readiness",
              value: `${stats.readiness}%`,
              icon: ShieldCheck,
              tone:
                stats.readiness >= 90
                  ? "text-success"
                  : stats.readiness >= 70
                    ? "text-warning"
                    : "text-destructive",
            },
            {
              label: "Assessment date",
              value: assessmentDate,
              icon: CalendarClock,
              tone: "text-muted-foreground",
            },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-border/60 bg-background p-4"
            >
              <div className="flex items-center justify-between">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {m.label}
                </div>
                <m.icon className={cn("h-4 w-4", m.tone)} />
              </div>
              <div className="mt-1.5 font-display text-lg font-semibold tabular-nums">
                {m.value}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Compliance Flags */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-6 rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]"
      >
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <AlertTriangle className="h-3.5 w-3.5 text-warning" /> Compliance flags
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Above 5% threshold",
              value: stats.aboveThreshold,
              icon: AlertCircle,
              tone: "text-warning",
              bg: "bg-warning/5 border-warning/30",
            },
            {
              label: "Missing approved explanations",
              value: stats.missingExplanations,
              icon: AlertCircle,
              tone: "text-warning",
              bg: "bg-warning/5 border-warning/30",
            },
            {
              label: "Require remediation",
              value: stats.requireRemediation,
              icon: AlertTriangle,
              tone: "text-destructive",
              bg: "bg-destructive/5 border-destructive/30",
            },
            {
              label: "Require joint assessment",
              value: stats.requireJointAssessment,
              icon: AlertTriangle,
              tone: "text-destructive",
              bg: "bg-destructive/5 border-destructive/30",
            },
          ].map((f) => (
            <div
              key={f.label}
              className={cn(
                "rounded-xl border p-4",
                f.bg,
              )}
            >
              <div className="flex items-center justify-between">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {f.label}
                </div>
                <f.icon className={cn("h-4 w-4", f.tone)} />
              </div>
              <div
                className={cn(
                  "mt-1.5 font-display text-2xl font-bold tabular-nums",
                  f.tone,
                )}
              >
                {f.value}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Category Findings Table */}
      <div className="mb-6 rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-card)]">
        <div className="border-b border-border/60 p-4">
          <div className="text-sm font-medium">Category findings</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Job category</th>
                <th className="px-3 py-3 font-medium">Gap %</th>
                <th className="px-3 py-3 font-medium">Explanation</th>
                <th className="px-3 py-3 font-medium">Human approval</th>
                <th className="px-3 py-3 font-medium">Risk</th>
                <th className="px-3 py-3 font-medium">Threshold</th>
              </tr>
            </thead>
            <tbody>
              {CATEGORY_FINDINGS.map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  className={cn(
                    "border-t border-border/60 transition-colors hover:bg-muted/30",
                    c.threshold === "joint_assessment" &&
                      "bg-destructive/[0.03]",
                    c.threshold === "requires_explanation" &&
                      "bg-warning/[0.03]",
                  )}
                >
                  <td className="px-5 py-3 font-medium">{c.name}</td>
                  <td className="px-3 py-3">
                    <span
                      className={cn(
                        "font-display font-semibold tabular-nums",
                        c.gapPct >= 5 ? "text-warning" : "text-success",
                      )}
                    >
                      {c.gapPct.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <ExplanationStatusBadge status={c.explanationStatus} />
                  </td>
                  <td className="px-3 py-3">
                    <ApprovalBadge status={c.humanApproval} />
                  </td>
                  <td className="px-3 py-3">
                    <RiskBadge level={c.riskLevel} />
                  </td>
                  <td className="px-3 py-3">
                    <ThresholdBadge status={c.threshold} />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommended Actions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]"
      >
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <Lightbulb className="h-3.5 w-3.5 text-teal" /> Recommended actions
        </div>
        <div className="mt-4 space-y-3">
          {RECOMMENDED_ACTIONS.map((a) => (
            <div
              key={a.id}
              className={cn(
                "rounded-xl border p-4",
                a.severity === "high"
                  ? "border-destructive/30 bg-destructive/5"
                  : a.severity === "medium"
                    ? "border-warning/30 bg-warning/5"
                    : "border-border/60 bg-background",
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                    a.severity === "high"
                      ? "bg-destructive/10 text-destructive"
                      : a.severity === "medium"
                        ? "bg-warning/10 text-warning"
                        : "bg-info/10 text-info",
                  )}
                >
                  {a.severity}
                </span>
                <div className="text-sm font-medium">{a.label}</div>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {a.detail}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {a.categories.map((c) => (
                  <span
                    key={c}
                    className="rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Export Actions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mb-6 rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]"
      >
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <Download className="h-3.5 w-3.5 text-teal" /> Export
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="hero" onClick={handleExportPdf}>
            <Download className="mr-1 h-4 w-4" /> Export PDF
          </Button>
          <Button variant="outline" onClick={handleExportCsv}>
            <FileSpreadsheet className="mr-1 h-4 w-4" /> Export CSV
          </Button>
          <Button variant="outline" onClick={handleDownloadPackage}>
            <Package className="mr-1 h-4 w-4" /> Full assessment package
          </Button>
          <Button variant="outline" onClick={handleCopySummary}>
            <Copy className="mr-1 h-4 w-4" /> Copy executive summary
          </Button>
        </div>
      </motion.div>

      {/* Bottom navigation */}
      <div className="mt-6 flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link to="/app/human-review">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to human review
          </Link>
        </Button>
        <Button variant="hero" asChild>
          <Link to="/app/audit">
            View audit trail <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function ExplanationStatusBadge({
  status,
}: {
  status: CategoryFinding["explanationStatus"];
}) {
  const map = {
    approved: { label: "Approved", className: "bg-success/10 text-success" },
    drafted: { label: "Drafted", className: "bg-info/10 text-info" },
    flagged: { label: "Flagged", className: "bg-destructive/10 text-destructive" },
    none: { label: "None", className: "bg-muted text-muted-foreground" },
  } as const;
  const m = map[status];
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[11px] font-medium",
        m.className,
      )}
    >
      {m.label}
    </span>
  );
}

function ApprovalBadge({
  status,
}: {
  status: CategoryFinding["humanApproval"];
}) {
  const map = {
    approved: { label: "Approved", className: "bg-success/10 text-success" },
    pending: { label: "Pending", className: "bg-muted text-muted-foreground" },
    rejected: { label: "Rejected", className: "bg-destructive/10 text-destructive" },
    escalated: { label: "Escalated", className: "bg-warning/10 text-warning" },
  } as const;
  const m = map[status];
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[11px] font-medium",
        m.className,
      )}
    >
      {m.label}
    </span>
  );
}

function RiskBadge({ level }: { level: CategoryFinding["riskLevel"] }) {
  const map = {
    low: { label: "Low", className: "bg-success/10 text-success" },
    medium: { label: "Medium", className: "bg-warning/10 text-warning" },
    high: { label: "High", className: "bg-destructive/10 text-destructive" },
  } as const;
  const m = map[level];
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[11px] font-medium",
        m.className,
      )}
    >
      {m.label}
    </span>
  );
}

function ThresholdBadge({
  status,
}: {
  status: CategoryFinding["threshold"];
}) {
  const map = {
    healthy: { label: "Healthy", className: "bg-success/10 text-success" },
    requires_explanation: {
      label: "Requires explanation",
      className: "bg-warning/10 text-warning",
    },
    joint_assessment: {
      label: "Joint assessment",
      className: "bg-destructive/10 text-destructive",
    },
  } as const;
  const m = map[status];
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[11px] font-medium",
        m.className,
      )}
    >
      {m.label}
    </span>
  );
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
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
          <FileCheck2 className="h-6 w-6" />
        </div>
        <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight">
          No report to generate
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          Complete the full compliance workflow from upload through human
          review. The generated report will include executive summaries,
          category findings, compliance flags, and recommended actions.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Button variant="hero" asChild>
            <Link to="/app/data-sources">Go to data sources</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/app">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
