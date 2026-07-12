import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { ChartLine as LineChart, ArrowLeft, ArrowRight, Users, Building2, TriangleAlert as AlertTriangle, ShieldCheck, Bot, TrendingUp, TrendingDown, Download, Flag, StickyNote, ChevronRight, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, FileSpreadsheet, ClipboardCheck } from "lucide-react";
import { PageHeader } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { WorkflowStrip } from "@/components/app/WorkflowStrip";
import { ComplianceAlert } from "@/components/app/ComplianceAlert";
import { useDemoMode, useUploadedFiles } from "@/lib/demo-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/app/gap-analysis")({
  head: () => ({
    meta: [
      { title: "Gap analysis — PayClarity" },
      {
        name: "description",
        content: "Gender pay gap analysis across grouped job categories.",
      },
    ],
  }),
  component: GapAnalysisPage,
});

type ThresholdStatus = "healthy" | "requires_explanation" | "joint_assessment";
type ExplanationStatus = "none" | "drafted" | "reviewed" | "flagged";

type JobCategory = {
  id: string;
  name: string;
  employees: number;
  femaleMedian: number;
  maleMedian: number;
  femaleMean: number;
  maleMean: number;
  gapPct: number;
  thresholdStatus: ThresholdStatus;
  explanationStatus: ExplanationStatus;
  countries: string[];
  departments: string[];
  aiObservation: string;
};

const CATEGORIES: JobCategory[] = [
  {
    id: "cat_1",
    name: "Engineering IC Level 2",
    employees: 42,
    femaleMedian: 68500,
    maleMedian: 73100,
    femaleMean: 69200,
    maleMean: 73800,
    gapPct: 6.3,
    thresholdStatus: "requires_explanation",
    explanationStatus: "drafted",
    countries: ["DE", "NL"],
    departments: ["Engineering", "Platform"],
    aiObservation:
      "Tenure distribution shows male employees average 2.1 years longer in role. Geographic adjustment for Berlin vs Amsterdam accounts for ~1.2 pts. Remaining 3.9 pts require documented justification.",
  },
  {
    id: "cat_2",
    name: "Engineering IC Level 3",
    employees: 28,
    femaleMedian: 89000,
    maleMedian: 91200,
    femaleMean: 89500,
    maleMean: 92000,
    gapPct: 2.5,
    thresholdStatus: "healthy",
    explanationStatus: "none",
    countries: ["DE", "FR", "NL"],
    departments: ["Engineering"],
    aiObservation:
      "Gap is below the 5% EU threshold. Distribution is balanced across tenure bands.",
  },
  {
    id: "cat_3",
    name: "Engineering Management",
    employees: 12,
    femaleMedian: 105000,
    maleMedian: 112500,
    femaleMean: 106200,
    maleMean: 113800,
    gapPct: 6.7,
    thresholdStatus: "requires_explanation",
    explanationStatus: "flagged",
    countries: ["DE", "IT"],
    departments: ["Engineering"],
    aiObservation:
      "Small sample size (12 employees). Two male managers at Director level with longer tenure skew the median. Recommend human review before drafting explanation.",
  },
  {
    id: "cat_4",
    name: "Sales IC Level 2",
    employees: 35,
    femaleMedian: 62000,
    maleMedian: 64500,
    femaleMean: 62800,
    maleMean: 65200,
    gapPct: 3.9,
    thresholdStatus: "healthy",
    explanationStatus: "none",
    countries: ["DE", "FR", "NL", "IT"],
    departments: ["Sales"],
    aiObservation:
      "Gap is below threshold. Commission structures are consistent across genders.",
  },
  {
    id: "cat_5",
    name: "Sales Management",
    employees: 14,
    femaleMedian: 92000,
    maleMedian: 101500,
    femaleMean: 93500,
    maleMean: 102800,
    gapPct: 9.4,
    thresholdStatus: "joint_assessment",
    explanationStatus: "flagged",
    countries: ["DE", "FR"],
    departments: ["Sales"],
    aiObservation:
      "Gap exceeds 5% with no objective justification identified. Seniority distribution is similar. Recommend joint pay assessment per EU directive Article 10.",
  },
  {
    id: "cat_6",
    name: "Product Management",
    employees: 19,
    femaleMedian: 78500,
    maleMedian: 80200,
    femaleMean: 79000,
    maleMean: 81000,
    gapPct: 2.1,
    thresholdStatus: "healthy",
    explanationStatus: "none",
    countries: ["DE", "NL", "IT"],
    departments: ["Product"],
    aiObservation:
      "Gap is well below threshold. Distribution is balanced across all bands.",
  },
  {
    id: "cat_7",
    name: "Data & Analytics",
    employees: 11,
    femaleMedian: 72000,
    maleMedian: 77800,
    femaleMean: 72500,
    maleMean: 78200,
    gapPct: 7.3,
    thresholdStatus: "requires_explanation",
    explanationStatus: "drafted",
    countries: ["DE", "FR"],
    departments: ["Engineering", "Finance"],
    aiObservation:
      "Market premium for data engineering roles in Germany accounts for ~2.8 pts. Experience level differences account for ~1.5 pts. Remaining 3.0 pts require review.",
  },
  {
    id: "cat_8",
    name: "People Operations",
    employees: 8,
    femaleMedian: 58000,
    maleMedian: 59500,
    femaleMean: 58200,
    maleMean: 59800,
    gapPct: 2.5,
    thresholdStatus: "healthy",
    explanationStatus: "none",
    countries: ["DE", "NL"],
    departments: ["People"],
    aiObservation:
      "Gap is below threshold. Small team with balanced distribution.",
  },
  {
    id: "cat_9",
    name: "Marketing IC",
    employees: 15,
    femaleMedian: 55000,
    maleMedian: 61200,
    femaleMean: 55800,
    maleMean: 61800,
    gapPct: 10.1,
    thresholdStatus: "joint_assessment",
    explanationStatus: "flagged",
    countries: ["DE", "FR", "IT"],
    departments: ["Marketing"],
    aiObservation:
      "Significant gap with no objective factors identified. Role levels appear comparable. Recommend immediate joint pay assessment and human review.",
  },
];

const OBJECTIVE_FACTORS = [
  {
    key: "seniority",
    label: "Seniority differences",
    description: "Variation in career level or grade within the same job category.",
  },
  {
    key: "performance",
    label: "Performance ratings",
    description: "Differences in individual performance evaluation outcomes.",
  },
  {
    key: "geographic",
    label: "Geographic pay adjustments",
    description: "Location-based salary differentials across countries or regions.",
  },
  {
    key: "market_premium",
    label: "Market premium roles",
    description: "Roles with competitive market pressure requiring premium compensation.",
  },
  {
    key: "experience",
    label: "Experience levels",
    description: "Variation in years of relevant professional experience.",
  },
  {
    key: "employment_type",
    label: "Employment type differences",
    description: "Full-time, part-time, or contract arrangements affecting compensation.",
  },
];

function GapAnalysisPage() {
  const [demo] = useDemoMode();
  const files = useUploadedFiles();
  const hasData = demo || files.length > 0;

  const [selectedCategory, setSelectedCategory] =
    useState<JobCategory | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [explanationStatuses, setExplanationStatuses] = useState<
    Record<string, ExplanationStatus>
  >({});

  const stats = useMemo(() => {
    const totalEmployees = CATEGORIES.reduce(
      (s, c) => s + c.employees,
      0,
    );
    const totalCategories = CATEGORIES.length;
    const aboveThreshold = CATEGORIES.filter(
      (c) => c.thresholdStatus !== "healthy",
    ).length;
    const requireExplanations = CATEGORIES.filter(
      (c) => c.thresholdStatus === "requires_explanation",
    ).length;
    const requireHumanReview = CATEGORIES.filter(
      (c) => c.thresholdStatus === "joint_assessment",
    ).length;
    const overallGap = 4.7;
    const medianGap = 3.9;
    const meanGap = 4.2;
    const countries = new Set<string>();
    CATEGORIES.forEach((c) =>
      c.countries.forEach((co) => countries.add(co)),
    );
    const readiness = Math.round(
      ((totalCategories - requireHumanReview) / totalCategories) * 100,
    );
    return {
      totalEmployees,
      totalCategories,
      aboveThreshold,
      requireExplanations,
      requireHumanReview,
      overallGap,
      medianGap,
      meanGap,
      countriesCount: countries.size,
      readiness,
    };
  }, []);

  const filteredCategories = useMemo(
    () =>
      statusFilter === "all"
        ? CATEGORIES
        : CATEGORIES.filter(
            (c) => c.thresholdStatus === statusFilter,
          ),
    [statusFilter],
  );

  const openDrawer = (cat: JobCategory) => {
    setSelectedCategory(cat);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedCategory(null);
    setActiveNoteId(null);
  };

  const updateExplanationStatus = (
    catId: string,
    status: ExplanationStatus,
  ) => {
    setExplanationStatuses((prev) => ({ ...prev, [catId]: status }));
    const labels: Record<ExplanationStatus, string> = {
      none: "reset",
      drafted: "marked as drafted",
      reviewed: "marked as reviewed",
      flagged: "flagged for human review",
    };
    toast.success(`Category ${labels[status]}`);
  };

  const handleAddNote = (catId: string) => {
    const note = notes[catId]?.trim();
    if (!note) {
      toast("Note is empty");
      return;
    }
    toast.success("Note saved to category");
    setActiveNoteId(null);
  };

  const handleExportFindings = () => {
    const rows = [
      [
        "Job Category",
        "Employees",
        "Female Median",
        "Male Median",
        "Gap %",
        "Threshold Status",
        "Explanation Status",
      ],
      ...CATEGORIES.map((c) => [
        c.name,
        String(c.employees),
        String(c.femaleMedian),
        String(c.maleMedian),
        `${c.gapPct}%`,
        thresholdLabel(c.thresholdStatus),
        explanationLabel(
          explanationStatuses[c.id] ?? c.explanationStatus,
        ),
      ]),
    ];
    const csv = rows
      .map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gap-analysis-findings.csv";
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success("Findings exported as CSV");
  };

  if (!hasData) {
    return (
      <div className="mx-auto max-w-4xl">
        <PageHeader
          title="Gap analysis"
          description="Gender pay gap analysis across grouped job categories"
        />
        <NoDataState />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Gap analysis"
        description="Identify which job groups require investigation under EU Pay Transparency requirements"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportFindings}>
              <Download className="mr-1 h-4 w-4" /> Export findings
            </Button>
            <Button variant="outline" asChild>
              <Link to="/app/grouping">
                <ArrowLeft className="mr-1 h-4 w-4" /> AI grouping
              </Link>
            </Button>
          </div>
        }
      />

      <div className="mb-6">
        <WorkflowStrip current="gap" />
      </div>

      {/* Compliance alert */}
      <div className="mb-6">
        <ComplianceAlert
          tone="warning"
          title="5% threshold detection active"
          message="Germany requires additional review when unexplained pay differences exceed 5%. Categories flagged as 'Joint assessment risk' may require a formal joint pay assessment with works councils."
          linkTo="/app/compliance/DE"
          linkLabel="View Germany compliance guide →"
        />
      </div>

      {/* Top KPI cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
            label: "Mean gap",
            value: `${stats.meanGap}%`,
            icon: TrendingDown,
            tone:
              stats.meanGap >= 5
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

      {/* Company summary section */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-6 rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]"
      >
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-teal" /> Company summary
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            {
              label: "Employees analysed",
              value: stats.totalEmployees.toLocaleString(),
              tone: "text-foreground",
            },
            {
              label: "Job categories",
              value: String(stats.totalCategories),
              tone: "text-foreground",
            },
            {
              label: "Above threshold",
              value: String(stats.aboveThreshold),
              tone: "text-warning",
            },
            {
              label: "Need explanations",
              value: String(stats.requireExplanations),
              tone: "text-warning",
            },
            {
              label: "Need human review",
              value: String(stats.requireHumanReview),
              tone: "text-destructive",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border/60 bg-background p-4"
            >
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {s.label}
              </div>
              <div
                className={cn(
                  "mt-1.5 font-display text-xl font-semibold tabular-nums",
                  s.tone,
                )}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Job category analysis table */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-center gap-2 border-b border-border/60 p-4">
          <div className="text-sm font-medium">Job category analysis</div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="healthy">Healthy</SelectItem>
              <SelectItem value="requires_explanation">
                Requires explanation
              </SelectItem>
              <SelectItem value="joint_assessment">
                Joint assessment risk
              </SelectItem>
            </SelectContent>
          </Select>
          <div className="ml-auto text-xs text-muted-foreground tabular-nums">
            {filteredCategories.length} of {CATEGORIES.length} categories
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Job category</th>
                <th className="px-3 py-3 font-medium">Employees</th>
                <th className="px-3 py-3 font-medium">F median</th>
                <th className="px-3 py-3 font-medium">M median</th>
                <th className="px-3 py-3 font-medium">Gap %</th>
                <th className="px-3 py-3 font-medium">Threshold</th>
                <th className="px-3 py-3 font-medium">Explanation</th>
                <th className="px-5 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((c, i) => {
                const expStatus =
                  explanationStatuses[c.id] ?? c.explanationStatus;
                return (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                    className={cn(
                      "cursor-pointer border-t border-border/60 transition-colors hover:bg-muted/30",
                      c.thresholdStatus === "joint_assessment" &&
                        "bg-destructive/[0.03]",
                      c.thresholdStatus === "requires_explanation" &&
                        "bg-warning/[0.03]",
                    )}
                    onClick={() => openDrawer(c)}
                  >
                    <td className="px-5 py-3 font-medium">{c.name}</td>
                    <td className="px-3 py-3 tabular-nums text-muted-foreground">
                      {c.employees}
                    </td>
                    <td className="px-3 py-3 tabular-nums text-muted-foreground">
                      €{c.femaleMedian.toLocaleString()}
                    </td>
                    <td className="px-3 py-3 tabular-nums text-muted-foreground">
                      €{c.maleMedian.toLocaleString()}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          "font-display font-semibold tabular-nums",
                          c.gapPct >= 5
                            ? "text-warning"
                            : "text-success",
                        )}
                      >
                        {c.gapPct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <ThresholdBadge status={c.thresholdStatus} />
                    </td>
                    <td className="px-3 py-3">
                      <ExplanationBadge status={expStatus} />
                    </td>
                    <td
                      className="px-5 py-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openDrawer(c)}
                      >
                        Details{" "}
                        <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="mt-6 flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link to="/app/grouping">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to AI grouping
          </Link>
        </Button>
        <Button variant="hero" asChild>
          <Link to="/app/explanations">
            Continue to AI explanations{" "}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Quick access to Human Review */}
      <div className="mt-4 flex items-center justify-between rounded-xl border border-teal/30 bg-teal/5 p-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ClipboardCheck className="h-4 w-4 text-teal" />
          5 explanations are waiting for human review and approval.
        </div>
        <Button size="sm" variant="ghost" asChild>
          <Link to="/app/human-review">
            Go to Human Review{" "}
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      {/* Drill-down drawer */}
      <Sheet open={drawerOpen} onOpenChange={(v) => !v && closeDrawer()}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto p-0 sm:max-w-2xl"
        >
          {selectedCategory && (
            <DrawerContent
              category={selectedCategory}
              explanationStatus={
                explanationStatuses[selectedCategory.id] ??
                selectedCategory.explanationStatus
              }
              onExplanationStatus={(s) =>
                updateExplanationStatus(selectedCategory.id, s)
              }
              note={notes[selectedCategory.id] ?? ""}
              onNoteChange={(v) =>
                setNotes((prev) => ({
                  ...prev,
                  [selectedCategory.id]: v,
                }))
              }
              activeNoteId={activeNoteId}
              onActiveNoteChange={(v) => setActiveNoteId(v)}
              onSaveNote={() => handleAddNote(selectedCategory.id)}
              onExport={() => handleExportFindings()}
              onClose={closeDrawer}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function DrawerContent({
  category,
  explanationStatus,
  onExplanationStatus,
  note,
  onNoteChange,
  activeNoteId,
  onActiveNoteChange,
  onSaveNote,
  onExport,
  onClose,
}: {
  category: JobCategory;
  explanationStatus: ExplanationStatus;
  onExplanationStatus: (s: ExplanationStatus) => void;
  note: string;
  onNoteChange: (v: string) => void;
  activeNoteId: string | null;
  onActiveNoteChange: (v: string | null) => void;
  onSaveNote: () => void;
  onExport: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="sticky top-0 z-10 border-b border-border/60 bg-card/95 px-6 py-5 backdrop-blur">
        <SheetHeader className="space-y-1 text-left">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
            <LineChart className="h-3.5 w-3.5 text-teal" /> Gap analysis drill-down
          </div>
          <SheetTitle className="font-display text-xl">
            {category.name}
          </SheetTitle>
          <SheetDescription>
            {category.employees} employees ·{" "}
            {category.countries.join(", ")} ·{" "}
            {category.departments.join(", ")}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="hero"
            asChild
          >
            <Link to="/app/explanations">
              <Bot className="mr-1 h-3.5 w-3.5" /> Generate AI explanation
            </Link>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              onExplanationStatus(
                explanationStatus === "flagged" ? "none" : "flagged",
              )
            }
          >
            <Flag className="mr-1 h-3.5 w-3.5" /> Flag for human review
          </Button>
          <Button size="sm" variant="outline" onClick={onExport}>
            <FileSpreadsheet className="mr-1 h-3.5 w-3.5" /> Export findings
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              onActiveNoteChange(activeNoteId ? null : category.id)
            }
          >
            <StickyNote className="mr-1 h-3.5 w-3.5" /> Add note
          </Button>
        </div>
      </div>

      <div className="space-y-6 p-6">
        {/* Salary comparison */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat
            label="F median"
            value={`€${category.femaleMedian.toLocaleString()}`}
          />
          <Stat
            label="M median"
            value={`€${category.maleMedian.toLocaleString()}`}
          />
          <Stat
            label="F mean"
            value={`€${category.femaleMean.toLocaleString()}`}
          />
          <Stat
            label="M mean"
            value={`€${category.maleMean.toLocaleString()}`}
          />
        </section>

        {/* Gap percentage */}
        <section className="rounded-xl border border-border/60 bg-background p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Gender pay gap
              </div>
              <div
                className={cn(
                  "mt-1 font-display text-3xl font-bold tabular-nums",
                  category.gapPct >= 5
                    ? "text-warning"
                    : "text-success",
                )}
              >
                {category.gapPct.toFixed(1)}%
              </div>
            </div>
            <ThresholdBadge
              status={category.thresholdStatus}
              large
            />
          </div>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full",
                category.gapPct >= 5 ? "bg-warning" : "bg-success",
              )}
              style={{ width: `${Math.min(category.gapPct * 10, 100)}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
            <span>0%</span>
            <span className="font-medium text-warning">5% threshold</span>
            <span>10%+</span>
          </div>
        </section>

        {/* Employee distribution */}
        <section>
          <SectionTitle icon={Users}>Employee distribution</SectionTitle>
          <div className="mt-3 space-y-2">
            <DistributionBar
              label="Female"
              value={Math.round(category.employees * 0.42)}
              total={category.employees}
              color="bg-info"
            />
            <DistributionBar
              label="Male"
              value={Math.round(category.employees * 0.5)}
              total={category.employees}
              color="bg-teal"
            />
            <DistributionBar
              label="Other / unspecified"
              value={Math.round(category.employees * 0.08)}
              total={category.employees}
              color="bg-muted-foreground"
            />
          </div>
        </section>

        {/* Countries & departments */}
        <section className="grid gap-4 sm:grid-cols-2">
          <div>
            <SectionTitle icon={Building2}>Countries affected</SectionTitle>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {category.countries.map((c) => (
                <span
                  key={c}
                  className="rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px]"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div>
            <SectionTitle icon={Building2}>Departments affected</SectionTitle>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {category.departments.map((d) => (
                <span
                  key={d}
                  className="rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px]"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* AI observations */}
        <section>
          <SectionTitle icon={Bot}>AI observations</SectionTitle>
          <div className="mt-3 rounded-xl border border-teal/30 bg-teal/5 p-4">
            <div className="flex items-start gap-2">
              <Bot className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
              <p className="text-sm text-muted-foreground">
                {category.aiObservation}
              </p>
            </div>
          </div>
        </section>

        {/* Suggested objective factors */}
        <section>
          <SectionTitle icon={AlertCircle}>
            Suggested objective factors
          </SectionTitle>
          <p className="mt-2 text-xs text-muted-foreground">
            Possible non-discriminatory explanations. These are suggestions
            only and do not automatically justify gaps.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {OBJECTIVE_FACTORS.map((f) => (
              <div
                key={f.key}
                className="rounded-lg border border-border/60 bg-background p-3"
              >
                <div className="text-sm font-medium">{f.label}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {f.description}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Add note */}
        <AnimatePresence>
          {activeNoteId === category.id && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <SectionTitle icon={StickyNote}>Add note</SectionTitle>
              <Textarea
                value={note}
                onChange={(e) => onNoteChange(e.target.value)}
                placeholder="Document your assessment, decisions, or follow-up actions…"
                className="mt-3 min-h-[80px]"
              />
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="hero" onClick={onSaveNote}>
                  Save note
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onActiveNoteChange(null)}
                >
                  Cancel
                </Button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function ThresholdBadge({
  status,
  large,
}: {
  status: ThresholdStatus;
  large?: boolean;
}) {
  const map = {
    healthy: {
      label: "Healthy",
      className: "bg-success/10 text-success",
      icon: CheckCircle2,
    },
    requires_explanation: {
      label: "Requires explanation",
      className: "bg-warning/10 text-warning",
      icon: AlertCircle,
    },
    joint_assessment: {
      label: "Joint assessment risk",
      className: "bg-destructive/10 text-destructive",
      icon: AlertTriangle,
    },
  } as const;
  const m = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        m.className,
        large ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[11px]",
      )}
    >
      <m.icon className={large ? "h-3.5 w-3.5" : "h-3 w-3"} />
      {m.label}
    </span>
  );
}

function ExplanationBadge({ status }: { status: ExplanationStatus }) {
  const map = {
    none: {
      label: "None",
      className: "bg-muted text-muted-foreground",
    },
    drafted: {
      label: "Drafted",
      className: "bg-info/10 text-info",
    },
    reviewed: {
      label: "Reviewed",
      className: "bg-success/10 text-success",
    },
    flagged: {
      label: "Flagged",
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

function DistributionBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-28 text-xs text-muted-foreground">{label}</div>
      <div className="h-6 flex-1 overflow-hidden rounded-md bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
          className={cn("h-full rounded-md", color)}
        />
      </div>
      <div className="w-16 text-right text-xs tabular-nums text-muted-foreground">
        {value} ({pct}%)
      </div>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: typeof FileText;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      <Icon className="h-3.5 w-3.5 text-teal" /> {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium tabular-nums">{value}</div>
    </div>
  );
}

function thresholdLabel(s: ThresholdStatus) {
  return s === "healthy"
    ? "Healthy"
    : s === "requires_explanation"
      ? "Requires explanation"
      : "Joint assessment risk";
}

function explanationLabel(s: ExplanationStatus) {
  return s === "none"
    ? "None"
    : s === "drafted"
      ? "Drafted"
      : s === "reviewed"
        ? "Reviewed"
        : "Flagged";
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
          <LineChart className="h-6 w-6" />
        </div>
        <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight">
          No data to analyse
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          Complete the workflow through upload, validation, review, and AI
          job grouping. Gap analysis will then calculate pay disparities
          across your job categories.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Button variant="hero" asChild>
            <Link to="/app/data-sources">Go to data sources</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/app/grouping">Go to AI grouping</Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
