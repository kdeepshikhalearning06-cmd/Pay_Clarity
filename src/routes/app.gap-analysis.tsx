import {
  normalizeSalary,
  getMean,
  getMedian,
  calculateGap,
} from "@/lib/payGap";
import { useMemo, useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ChartLine as LineChart,
  ArrowLeft,
  ArrowRight,
  Users,
  Building2,
  TriangleAlert as AlertTriangle,
  ShieldCheck,
  Bot,
  TrendingUp,
  TrendingDown,
  Download,
  Flag,
  StickyNote,
  ChevronRight,
  CircleCheck as CheckCircle2,
  CircleAlert as AlertCircle,
  FileSpreadsheet,
  ClipboardCheck,
  FileText,
} from "lucide-react";
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
import { supabase } from "@/lib/supabase";

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

type ThresholdStatus =
  | "healthy"
  | "requires_explanation"
  | "joint_assessment"
  | "cannot_calculate";
type ExplanationStatus = "none" | "drafted" | "reviewed" | "flagged";

type JobCategory = {
  id: string;
  name: string;
  employees: number;
  femaleMedian: number;
  maleMedian: number;
  femaleMean: number;
  maleMean: number;
  gapPct: number | null;
  thresholdStatus: ThresholdStatus;
  explanationStatus: ExplanationStatus;
  countries: string[];
  departments: string[];
  aiObservation: string;
};

type AnalysisRow = {
  upload_id: string;
  job_group_id: string;
  male_average_salary: number;
  female_average_salary: number;
  pay_gap_percent: number;
  employee_count: number;
  exceeds_threshold: boolean;
  threshold_percent: number;
  analysis_status: string;
};

type GapStats = {
  totalEmployees: number;
  totalCategories: number;
  aboveThreshold: number;
  requireExplanations: number;
  requireHumanReview: number;
  overallGap: number;
  medianGap: number;
  meanGap: number;
  countriesCount: number;
  readiness: number;
  bonusGap: number;
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

  // Demo mode → hardcoded CATEGORIES
  // Real mode → later connected with Supabase grouping output
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    const loadGroups = async () => {
      const savedGroups = localStorage.getItem("payclarity_groups");

      if (!savedGroups) return;

      const uploadId = localStorage.getItem("currentUploadId");
      if (!uploadId) return;

      const { data: employeeData, error } = await supabase
        .from("employee_records")
        .select("*")
        .eq("upload_id", uploadId);

      if (error) {
        console.error(error);
        return;
      }

      setEmployees(employeeData || []);

      const groups = JSON.parse(savedGroups);

      console.log("Gap Analysis Groups:", groups);

      const { data: dbGroups, error: groupsError } = await supabase
        .from("job_groups")
        .select("*")
        .eq("upload_id", uploadId);

      if (groupsError) {
        console.error(groupsError);
        return;
      }

      console.table(
        dbGroups?.map((g: any) => ({
          id: g.id,
          group_name: g.group_name,
        })),
      );

      const mappedCategories: JobCategory[] = groups.map(
        (g: any, index: number): JobCategory => {
          const groupEmployees = (employeeData || []).filter(
            (emp: any) => g.originalTitles?.includes(emp.job_title),
          );

          const femaleEmployees = groupEmployees.filter(
            (emp: any) => emp.gender === "Female",
          );

          const maleEmployees = groupEmployees.filter(
            (emp: any) => emp.gender === "Male",
          );

          const femaleMedian = getMedian(femaleEmployees);
          const maleMedian = getMedian(maleEmployees);

          const medianGap = calculateGap(maleMedian, femaleMedian);

          const meanGap = calculateGap(
            getMean(maleEmployees),
            getMean(femaleEmployees),
          );

          const salaryValues = groupEmployees.map(normalizeSalary);

          const averageSalary = salaryValues.length
            ? salaryValues.reduce((a: number, b: number) => a + b, 0) /
              salaryValues.length
            : 0;

          const outliers = groupEmployees.filter((emp: any) => {
            const salary = normalizeSalary(emp);

            return salary > averageSalary * 2 || salary < averageSalary * 0.5;
          }).length;

          return {
            id: String(index),

            name: g.suggestedGrouping || "Unknown",

            employees: groupEmployees.length,

            femaleMedian,

            maleMedian,

            femaleMean: getMean(femaleEmployees),

            maleMean: getMean(maleEmployees),

            gapPct: medianGap === null ? 0 : Number(medianGap.toFixed(2)),

            thresholdStatus:
              maleEmployees.length === 0 || femaleEmployees.length === 0
                ? "cannot_calculate"
                : medianGap !== null && medianGap > 5
                  ? "requires_explanation"
                  : "healthy",

            explanationStatus: "none",

            countries: [],

            departments: [],

            aiObservation:
              maleEmployees.length === 0 || femaleEmployees.length === 0
                ? `Insufficient gender data is available to calculate a reliable pay gap for this comparable work category.`
                : `A total of ${groupEmployees.length} employees were analysed in the "${g.suggestedGrouping}" comparable work category.

Female median salary: €${femaleMedian.toLocaleString()}
Male median salary: €${maleMedian.toLocaleString()}

The calculated median gender pay gap is ${
                    medianGap === null ? "Not available" : medianGap.toFixed(1)
                  }%.

${
  medianGap !== null && medianGap > 5
    ? "This exceeds the EU Pay Transparency Directive threshold of 5%. HR should review objective factors such as seniority, experience, performance ratings, job level, or market-based pay before publishing the report."
    : "This is below the EU Pay Transparency Directive threshold of 5%. No immediate compliance concerns were identified for this group."
}`,
          };
        },
      );

      const analysisRows: AnalysisRow[] = mappedCategories
        .map((category: JobCategory): AnalysisRow | null => {
          const dbGroup = dbGroups?.find(
            (g: any) => g.group_name === category.name,
          );

          if (!dbGroup) {
            console.warn("No matching job group found:", category.name);
            return null;
          }

          return {
            upload_id: uploadId,
            job_group_id: dbGroup.id,
            male_average_salary: category.maleMean,
            female_average_salary: category.femaleMean,
            pay_gap_percent: category.gapPct ?? 0,
            employee_count: category.employees,
            exceeds_threshold: category.thresholdStatus !== "healthy",
            threshold_percent: 5,
            analysis_status: "completed",
          };
        })
        .filter((row): row is AnalysisRow => row !== null);

      console.table(analysisRows);

      const { data, error: analysisError } = await supabase
        .from("pay_gap_analyses")
        .upsert(analysisRows, {
          onConflict: "upload_id,job_group_id",
        })
        .select();

      if (analysisError) {
        console.error("Failed to save gap analysis:", analysisError);
      } else {
        console.log("Gap analysis saved:", data);
      }

      setCategories(mappedCategories);
    };

    loadGroups();
  }, []);

  const displayedCategories = demo ? CATEGORIES : categories;

  const [selectedCategory, setSelectedCategory] = useState<JobCategory | null>(
    null,
  );

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [statusFilter, setStatusFilter] = useState("all");

  const [search, setSearch] = useState("");

  const [notes, setNotes] = useState<Record<string, string>>({});

  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  const [explanationStatuses, setExplanationStatuses] =
  useState<Record<string, ExplanationStatus>>({});

  const stats = useMemo<GapStats>(() => {
    const totalEmployees = displayedCategories.reduce(
      (s, c) => s + c.employees,
      0,
    );
    const totalCategories = displayedCategories.length;
    const aboveThreshold = displayedCategories.filter(
      (c) => c.thresholdStatus !== "healthy",
    ).length;
    const requireExplanations = displayedCategories.filter(
      (c) => c.thresholdStatus === "requires_explanation",
    ).length;
    const requireHumanReview = displayedCategories.filter(
      (c) => c.thresholdStatus === "joint_assessment",
    ).length;

    const allEmployees = employees;

    const femaleEmployees = allEmployees.filter((e) => e.gender === "Female");

    const maleEmployees = allEmployees.filter((e) => e.gender === "Male");

    const getSalary = (employee: any) => {
      const salary = Number(employee.annual_base_salary || 0);

      const fte = Number(employee.fte_percent || 100);

      if (!fte) return 0;

      return salary / (fte / 100);
    };

    const companyMean = (list: any[]) => {
      if (!list.length) return 0;

      return list.reduce((sum, e) => sum + getSalary(e), 0) / list.length;
    };

    const companyMedian = (list: any[]) => {
      if (!list.length) return 0;

      const salaries = list.map(getSalary).sort((a, b) => a - b);

      const middle = Math.floor(salaries.length / 2);

      if (salaries.length % 2) {
        return salaries[middle];
      }

      return (salaries[middle - 1] + salaries[middle]) / 2;
    };

    const companyMaleMean = companyMean(maleEmployees);

    const companyFemaleMean = companyMean(femaleEmployees);

    const companyMaleMedian = companyMedian(maleEmployees);

    const companyFemaleMedian = companyMedian(femaleEmployees);

    const getBonus = (employee: any) => {
      return Number(employee.bonus || 0);
    };

    const companyBonusMean = (list: any[]) => {
      if (!list.length) return 0;

      return list.reduce((sum, e) => sum + getBonus(e), 0) / list.length;
    };

    const maleBonus = companyBonusMean(maleEmployees);

    const femaleBonus = companyBonusMean(femaleEmployees);

    const bonusGap = maleBonus
      ? ((maleBonus - femaleBonus) / maleBonus) * 100
      : 0;

    const companyMeanGap = companyMaleMean
      ? ((companyMaleMean - companyFemaleMean) / companyMaleMean) * 100
      : 0;

    const companyMedianGap = companyMaleMedian
      ? ((companyMaleMedian - companyFemaleMedian) / companyMaleMedian) * 100
      : 0;

    const overallGap =
      displayedCategories.length > 0
        ? displayedCategories.reduce(
            (sum, c) => sum + (c.gapPct !== null ? c.gapPct : 0),
            0,
          ) / displayedCategories.length
        : 0;

    const medianGap = overallGap;

    const meanGap = overallGap;

    const countries = new Set<string>();
    displayedCategories.forEach((c) =>
      c.countries.forEach((co) => countries.add(co)),
    );
    const readiness = totalCategories
      ? Math.round(
          ((totalCategories - requireHumanReview) / totalCategories) * 100,
        )
      : 0;

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
      bonusGap: Number(bonusGap.toFixed(2)),
    };
  }, [displayedCategories, employees]);

  useEffect(() => {
    if (demo) return;

    const uploadId = localStorage.getItem("currentUploadId");
    if (!uploadId) return;

    const updateAssessment = async () => {
      const { error } = await supabase
        .from("assessments")
        .update({
          readiness_score: stats.readiness,
          overall_gap: Number(stats.overallGap.toFixed(2)),
          median_gap: Number(stats.medianGap.toFixed(2)),
          total_employees: stats.totalEmployees,
          above_threshold: stats.aboveThreshold,
          missing_explanations: stats.requireExplanations,
          joint_assessments: stats.requireHumanReview,
        })
        .eq("upload_id", uploadId);

      if (error) {
        console.error("Assessment update failed:", error);
      } else {
        console.log("Assessment updated");
      }
    };

    updateAssessment();
  }, [stats, demo]);

  const filteredCategories = useMemo(
    () =>
      displayedCategories
        .filter((c) =>
          statusFilter === "all" ? true : c.thresholdStatus === statusFilter,
        )
        .filter((c) =>
          search === ""
            ? true
            : c.name.toLowerCase().includes(search.toLowerCase()),
        ),
    [statusFilter, search, displayedCategories],
  );

  const openDrawer = (category: JobCategory) => {
    setSelectedCategory(category);
    setDrawerOpen(true);
    setActiveNoteId(category.id);
  };

  const handleSaveNote = (id: string, value: string) => {
    setNotes((prev) => ({ ...prev, [id]: value }));
    toast.success("Note saved");
  };

  const handleFlagForReview = (id: string) => {
    setExplanationStatuses((prev) => ({ ...prev, [id]: "flagged" }));
    toast.success("Category flagged for review");
  };

  const handleExportCsv = () => {
    const rows = [
      [
        "Job category",
        "Employees",
        "Female median",
        "Male median",
        "Gap %",
        "Threshold",
        "Explanation status",
      ],
      ...displayedCategories.map((c) => [
        c.name,
        String(c.employees),
        String(c.femaleMedian),
        String(c.maleMedian),
        c.gapPct === null ? "" : `${c.gapPct.toFixed(1)}%`,
        c.thresholdStatus,
        explanationStatuses[c.id] ?? c.explanationStatus,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((v) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v))
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gap-analysis.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    toast.success("CSV export ready");
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
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Gap analysis"
        description="Gender pay gap analysis across grouped job categories"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/app/grouping">
                <ArrowLeft className="mr-1 h-4 w-4" /> Job grouping
              </Link>
            </Button>
          </div>
        }
      />

      <div className="mb-6">
        <WorkflowStrip current="gap" />
      </div>

      <div className="mb-6">
        <ComplianceAlert
          tone="info"
          title="Pay gap analysis is a starting point, not a final judgment"
          message="Categories above the 5% threshold require documented objective justification before they can be included in compliance reporting."
          linkTo="/app/compliance"
          linkLabel="View compliance library →"
        />
      </div>

      {/* KPI cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Employees analysed", value: stats.totalEmployees, icon: Users, tone: "text-info" },
          { label: "Categories", value: stats.totalCategories, icon: Building2, tone: "text-info" },
          { label: "Above threshold", value: stats.aboveThreshold, icon: AlertTriangle, tone: "text-warning" },
          { label: "Require explanation", value: stats.requireExplanations, icon: AlertCircle, tone: "text-warning" },
          { label: "Joint assessment", value: stats.requireHumanReview, icon: Flag, tone: "text-destructive" },
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

      {/* Overall gap summary */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 grid gap-4 sm:grid-cols-3 rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]"
      >
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            <TrendingDown className="h-3.5 w-3.5 text-teal" /> Overall gap
          </div>
          <div className="mt-1 font-display text-2xl font-semibold tabular-nums">
            {stats.overallGap.toFixed(1)}%
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-teal" /> Readiness
          </div>
          <div className="mt-1 font-display text-2xl font-semibold tabular-nums">
            {stats.readiness}%
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-teal" /> Bonus gap
          </div>
          <div className="mt-1 font-display text-2xl font-semibold tabular-nums">
            {stats.bonusGap}%
          </div>
        </div>
      </motion.div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search categories…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-[220px]"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-[200px]">
            <SelectValue placeholder="Filter by threshold" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All thresholds</SelectItem>
            <SelectItem value="healthy">Healthy</SelectItem>
            <SelectItem value="requires_explanation">Requires explanation</SelectItem>
            <SelectItem value="joint_assessment">Joint assessment</SelectItem>
            <SelectItem value="cannot_calculate">Cannot calculate</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="ml-auto" onClick={handleExportCsv}>
          <FileSpreadsheet className="mr-1 h-3.5 w-3.5" /> Export CSV
        </Button>
      </div>

      {/* Category table */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Job category</th>
                <th className="px-3 py-3 font-medium">Employees</th>
                <th className="px-3 py-3 font-medium">Gap %</th>
                <th className="px-3 py-3 font-medium">Threshold</th>
                <th className="px-3 py-3 font-medium">Explanation</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((c, i) => {
                const explanationStatus = explanationStatuses[c.id] ?? c.explanationStatus;
                return (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                    className="cursor-pointer border-t border-border/60 transition-colors hover:bg-muted/30"
                    onClick={() => openDrawer(c)}
                  >
                    <td className="px-5 py-3 font-medium">{c.name}</td>
                    <td className="px-3 py-3 tabular-nums">{c.employees}</td>
                    <td className="px-3 py-3">
                      {c.gapPct === null ? "—" : `${c.gapPct.toFixed(1)}%`}
                    </td>
                    <td className="px-3 py-3">
                      <ThresholdBadge status={c.thresholdStatus} />
                    </td>
                    <td className="px-3 py-3">
                      <ExplanationBadge status={explanationStatus} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFlagForReview(c.id);
                          }}
                        >
                          <Flag className="h-3.5 w-3.5 text-warning" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDrawer(c);
                          }}
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category details drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader className="text-left">
            <SheetTitle className="font-display text-xl">
              {selectedCategory?.name}
            </SheetTitle>
            <SheetDescription>
              {selectedCategory?.employees.toLocaleString()} employees analysed
            </SheetDescription>
          </SheetHeader>

          {selectedCategory && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border/60 bg-background p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Female median
                  </div>
                  <div className="mt-1 text-sm font-medium">
                    €{selectedCategory.femaleMedian.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-xl border border-border/60 bg-background p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Male median
                  </div>
                  <div className="mt-1 text-sm font-medium">
                    €{selectedCategory.maleMedian.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-teal/30 bg-teal/5 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  <Bot className="h-3.5 w-3.5 text-teal" /> AI observation
                </div>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {selectedCategory.aiObservation}
                </p>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Objective factors to consider
                </div>
                <div className="mt-2 space-y-2">
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
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  <StickyNote className="h-3.5 w-3.5 text-teal" /> Notes
                </div>
                <Textarea
                  className="mt-2 min-h-[100px]"
                  value={notes[selectedCategory.id] ?? ""}
                  onChange={(e) =>
                    setNotes((prev) => ({
                      ...prev,
                      [selectedCategory.id]: e.target.value,
                    }))
                  }
                  placeholder="Add internal notes about this category…"
                />
                <div className="mt-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="hero"
                    onClick={() =>
                      handleSaveNote(
                        selectedCategory.id,
                        notes[selectedCategory.id] ?? "",
                      )
                    }
                  >
                    Save note
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleFlagForReview(selectedCategory.id)}
                  >
                    <Flag className="mr-1 h-3.5 w-3.5" /> Flag for review
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Bottom navigation */}
      <div className="mt-6 flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link to="/app/grouping">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to job grouping
          </Link>
        </Button>
        <Button variant="hero" asChild>
          <Link to="/app/explanations">
            Continue to AI explanations <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function ThresholdBadge({ status }: { status: ThresholdStatus }) {
  const map: Record<ThresholdStatus, { label: string; className: string }> = {
    healthy: { label: "Healthy", className: "bg-success/10 text-success" },
    requires_explanation: {
      label: "Requires explanation",
      className: "bg-warning/10 text-warning",
    },
    joint_assessment: {
      label: "Joint assessment",
      className: "bg-destructive/10 text-destructive",
    },
    cannot_calculate: {
      label: "Cannot calculate",
      className: "bg-muted text-muted-foreground",
    },
  };
  const m = map[status];
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", m.className)}>
      {m.label}
    </span>
  );
}

function ExplanationBadge({ status }: { status: ExplanationStatus }) {
  const map: Record<ExplanationStatus, { label: string; className: string }> = {
    none: { label: "None", className: "bg-muted text-muted-foreground" },
    drafted: { label: "Drafted", className: "bg-info/10 text-info" },
    reviewed: { label: "Reviewed", className: "bg-success/10 text-success" },
    flagged: { label: "Flagged", className: "bg-warning/10 text-warning" },
  };
  const m = map[status];
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", m.className)}>
      {m.label}
    </span>
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
          <LineChart className="h-6 w-6" />
        </div>
        <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight">
          No gap analysis available
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          Upload payroll data and complete AI job grouping first. Pay gap
          analysis will then be calculated for each comparable work category.
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