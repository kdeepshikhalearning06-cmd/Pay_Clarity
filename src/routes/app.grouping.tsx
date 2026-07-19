import { useMemo, useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { Workflow, ArrowRight, ArrowLeft, Check, X, Pencil, Users, Sparkles, CircleAlert as AlertCircle, CircleCheck as CheckCircle2, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { WorkflowStrip } from "@/components/app/WorkflowStrip";
import { useDemoMode, useUploadedFiles } from "@/lib/demo-store";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/app/grouping")({
  head: () => ({
    meta: [
      { title: "AI job grouping — PayClarity" },
      {
        name: "description",
        content:
          "AI-powered job title grouping with human-in-the-loop review.",
      },
    ],
  }),
  component: GroupingPage,
});

type GroupStatus = "pending" | "accepted" | "rejected" | "edited";

type JobGroup = {
  id: string;
  suggestedGrouping: string;
  originalTitles: string[];
  confidence: number;
  employees: number;
  status: GroupStatus;
  needsReview: boolean;
};
const INITIAL_GROUPS: JobGroup[] = [
  {
    id: "grp_1",
    suggestedGrouping: "Engineering IC Level 2",
    originalTitles: [
      "Backend Engineer",
      "Software Engineer II",
      "Platform Developer",
    ],
    confidence: 94,
    employees: 42,
    status: "pending",
    needsReview: false,
  },
  {
    id: "grp_2",
    suggestedGrouping: "Engineering IC Level 3",
    originalTitles: [
      "Senior Backend Engineer",
      "Staff Software Engineer",
      "Principal Developer",
    ],
    confidence: 89,
    employees: 28,
    status: "pending",
    needsReview: false,
  },
  {
    id: "grp_3",
    suggestedGrouping: "Engineering Management",
    originalTitles: [
      "Engineering Manager",
      "Tech Lead",
      "Head of Engineering",
    ],
    confidence: 91,
    employees: 12,
    status: "pending",
    needsReview: false,
  },
  {
    id: "grp_4",
    suggestedGrouping: "Sales IC Level 2",
    originalTitles: [
      "Account Executive",
      "Sales Representative",
      "Business Development Rep",
    ],
    confidence: 87,
    employees: 35,
    status: "pending",
    needsReview: false,
  },
  {
    id: "grp_5",
    suggestedGrouping: "Sales Management",
    originalTitles: [
      "Senior Sales Manager",
      "Sales Director",
      "Regional Sales Lead",
    ],
    confidence: 92,
    employees: 14,
    status: "pending",
    needsReview: false,
  },
  {
    id: "grp_6",
    suggestedGrouping: "Product Management",
    originalTitles: [
      "Product Manager",
      "Senior Product Manager",
      "Product Owner",
    ],
    confidence: 85,
    employees: 19,
    status: "pending",
    needsReview: false,
  },
  {
    id: "grp_7",
    suggestedGrouping: "Data & Analytics",
    originalTitles: ["Data Analyst", "Data Scientist", "Analytics Engineer"],
    confidence: 78,
    employees: 11,
    status: "pending",
    needsReview: true,
  },
  {
    id: "grp_8",
    suggestedGrouping: "People Operations",
    originalTitles: [
      "HR Business Partner",
      "People Operations Specialist",
      "Talent Partner",
    ],
    confidence: 82,
    employees: 8,
    status: "pending",
    needsReview: true,
  },
  {
    id: "grp_9",
    suggestedGrouping: "Marketing IC",
    originalTitles: [
      "Marketing Specialist",
      "Content Marketing Manager",
      "Growth Marketing Lead",
      "Brand Manager",
    ],
    confidence: 71,
    employees: 15,
    status: "pending",
    needsReview: true,
  },
];

const TOTAL_TITLES = 149;

function GroupingPage() {
  const [demo] = useDemoMode();
  const files = useUploadedFiles();
  const hasData = demo || files.length > 0;

  const [groups, setGroups] = useState<JobGroup[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
useEffect(() => {
  if (demo) {
    setGroups(INITIAL_GROUPS);
    return;
  }

  async function loadGroups() {
    const uploadId = localStorage.getItem("currentUploadId");

console.log("Grouping Page Upload ID:", uploadId);
console.log("All localStorage:", { ...localStorage });

    if (!uploadId) {
      console.log("No upload ID found");
      setGroups([]);
      return;
    }

    const { data: employees, error } = await supabase
      .from("employee_records")
      .select("*")
      .eq("upload_id", uploadId);

    if (error) {
      console.error(error);
      toast.error("Failed to load employee data");
      return;
    }

    if (!employees || employees.length === 0) {
      console.log("No employees found");
      setGroups([]);
      return;
    }

    // Group employees by Job Title
    const grouped = employees.reduce(
      (acc: Record<string, any[]>, employee: any) => {
        const title = employee.job_title || "Unknown";

        if (!acc[title]) {
          acc[title] = [];
        }

        acc[title].push(employee);

        return acc;
      },
      {}
    );

    const generatedGroups: JobGroup[] = Object.entries(grouped).map(
      ([title, employeeList], index) => ({
        id: `group-${index}`,
        suggestedGrouping: title,
        originalTitles: [title],
        confidence: 95,
        employees: (employeeList as any[]).length,
        status: "pending",
        needsReview: false,
      })
    );

    console.log("Generated Groups:", generatedGroups);

    setGroups(generatedGroups);
  }

  loadGroups();
}, [demo]);

  const stats = useMemo(() => {
    const accepted = groups.filter((g) => g.status === "accepted").length;
    const rejected = groups.filter((g) => g.status === "rejected").length;
    const edited = groups.filter((g) => g.status === "edited").length;
    const pending = groups.filter(
      (g) => g.status === "pending" || g.status === "edited",
    ).length;
    const needsReview = groups.filter((g) => g.needsReview).length;
    const groupedTitles = groups
      .filter((g) => g.status !== "rejected")
      .reduce((sum, g) => sum + g.originalTitles.length, 0);
    return {
      accepted,
      rejected,
      edited,
      pending,
      needsReview,
      groupedTitles,
    };
  }, [groups]);

  const handleAccept = (id: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, status: "accepted" } : g,
      ),
    );
    toast.success("Grouping accepted");
  };

  const handleReject = (id: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, status: "rejected" } : g,
      ),
    );
    toast("Grouping rejected — titles will remain ungrouped");
  };

  const handleStartEdit = (group: JobGroup) => {
    setEditingId(group.id);
    setEditValue(group.suggestedGrouping);
  };

  const handleSaveEdit = (id: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === id
          ? {
              ...g,
              suggestedGrouping: editValue,
              status: "edited",
            }
          : g,
      ),
    );
    setEditingId(null);
    toast.success("Grouping updated");
  };

  const handleAcceptAll = () => {
    setGroups((prev) =>
      prev.map((g) =>
        g.status === "pending"
          ? { ...g, status: "accepted" }
          : g,
      ),
    );
    toast.success("All pending groupings accepted");
  };

  if (!hasData) {
    return (
      <div className="mx-auto max-w-4xl">
        <PageHeader
          title="AI job grouping"
          description="Automatically group similar job titles into comparable categories"
        />
        <NoDataState />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="AI job grouping"
        description="AI-powered job title clustering with human-in-the-loop review"
        actions={
          <Button variant="outline" asChild>
            <Link to="/app/review">
              <ArrowLeft className="mr-1 h-4 w-4" /> Review data
            </Link>
          </Button>
        }
      />

      <div className="mb-6">
        <WorkflowStrip current="grouping" />
      </div>

      {/* Progress indicators */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-teal/40"
        >
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Titles grouped
            </div>
            <Workflow className="h-4 w-4 text-teal" />
          </div>
          <div className="mt-3 font-display text-3xl font-semibold tabular-nums">
            {stats.groupedTitles}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            of {TOTAL_TITLES} total
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-teal/40"
        >
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Accepted
            </div>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </div>
          <div className="mt-3 font-display text-3xl font-semibold tabular-nums text-success">
            {stats.accepted}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            groups approved
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-teal/40"
        >
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Needs review
            </div>
            <AlertCircle className="h-4 w-4 text-warning" />
          </div>
          <div className="mt-3 font-display text-3xl font-semibold tabular-nums text-warning">
            {stats.needsReview}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            low confidence groupings
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-teal/40"
        >
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Avg confidence
            </div>
            <TrendingUp className="h-4 w-4 text-info" />
          </div>
          <div className="mt-3 font-display text-3xl font-semibold tabular-nums">
            {groups.length
  ? Math.round(
      groups.reduce((s, g) => s + g.confidence, 0) / groups.length
    )
  : 0}
%
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            across all groupings
          </div>
        </motion.div>
      </div>

      {/* AI info banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 flex items-start gap-3 rounded-2xl border border-teal/30 bg-teal/5 p-4"
      >
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[image:var(--gradient-teal)] text-teal-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium">
            AI grouped {stats.groupedTitles} job titles into {groups.length}{" "}
            comparable categories
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            Every grouping is reviewable. Accept, edit, or reject each
            suggestion — nothing is applied without your approval.
          </div>
        </div>
        {stats.pending > 0 && (
          <Button size="sm" variant="teal" onClick={handleAcceptAll}>
            Accept all pending
          </Button>
        )}
      </motion.div>

      {/* Grouping cards */}
      <div className="space-y-3">
        {groups.map((group, i) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={cn(
              "rounded-2xl border bg-card p-5 shadow-[var(--shadow-card)] transition-all",
              group.status === "accepted" &&
                "border-success/30",
              group.status === "rejected" &&
                "border-border/60 opacity-50",
              group.status === "edited" &&
                "border-teal/40",
              group.status === "pending" &&
                group.needsReview &&
                "border-warning/30",
              group.status === "pending" &&
                !group.needsReview &&
                "border-border/60",
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              {/* Left: grouping info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {editingId === group.id ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit(group.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="rounded-md border border-teal bg-background px-2 py-1 font-display text-sm font-semibold outline-none focus:ring-2 focus:ring-teal/30"
                      autoFocus
                    />
                  ) : (
                    <h3 className="font-display text-sm font-semibold">
                      {group.suggestedGrouping}
                    </h3>
                  )}

                  {/* Status badge */}
                  {group.status === "accepted" && (
                    <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                      Accepted
                    </span>
                  )}
                  {group.status === "rejected" && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      Rejected
                    </span>
                  )}
                  {group.status === "edited" && (
                    <span className="rounded-full bg-teal/10 px-2 py-0.5 text-[10px] font-medium text-teal">
                      Edited
                    </span>
                  )}
                  {group.needsReview && group.status === "pending" && (
                    <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-medium text-warning">
                      Needs review
                    </span>
                  )}
                </div>

                {/* Original titles */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {group.originalTitles.map((title) => (
                    <span
                      key={title}
                      className="rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground"
                    >
                      {title}
                    </span>
                  ))}
                </div>

                {/* Meta */}
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {group.employees} employees
                  </span>
                  <span className="flex items-center gap-1">
                    <Workflow className="h-3.5 w-3.5" />
                    {group.originalTitles.length} titles merged
                  </span>
                </div>
              </div>

              {/* Right: confidence + actions */}
              <div className="flex flex-col items-end gap-2">
                <ConfidenceMeter confidence={group.confidence} />
                {editingId === group.id ? (
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSaveEdit(group.id)}
                    >
                      <Check className="h-3.5 w-3.5 text-success" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : group.status === "pending" || group.status === "edited" ? (
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAccept(group.id)}
                    >
                      <Check className="mr-0.5 h-3.5 w-3.5 text-success" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleStartEdit(group)}
                    >
                      <Pencil className="mr-0.5 h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleReject(group.id)}
                    >
                      <X className="mr-0.5 h-3.5 w-3.5 text-destructive" />
                      Reject
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setGroups((prev) =>
                        prev.map((g) =>
                          g.id === group.id
                            ? { ...g, status: "pending" }
                            : g,
                        ),
                      )
                    }
                  >
                    Undo
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom navigation */}
      <div className="mt-6 flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link to="/app/review">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to review
          </Link>
        </Button>
        <Button variant="hero" asChild>
          <Link to="/app/gap-analysis">
            Continue to gap analysis{" "}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function ConfidenceMeter({ confidence }: { confidence: number }) {
  const tone =
    confidence >= 90
      ? "text-success"
      : confidence >= 75
        ? "text-teal"
        : "text-warning";
  const barColor =
    confidence >= 90
      ? "bg-success"
      : confidence >= 75
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
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
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
          <Workflow className="h-6 w-6" />
        </div>
        <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight">
          No data to group
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          Upload a payroll snapshot, validate, and review your data first.
          AI job grouping will then cluster similar titles into comparable
          categories.
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


