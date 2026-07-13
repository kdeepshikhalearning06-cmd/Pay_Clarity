import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ClipboardCheck,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Pencil,
  Gavel,
  Clock,
  User,
  Bot,
  CircleCheck as CheckCircle2,
  TriangleAlert as AlertTriangle,
  Save,
  CircleDot,
  ShieldCheck,
  Scale,
  FolderCheck,
  Percent,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
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
import { COMPANY } from "@/lib/company-context";
import { getCountryProfile } from "@/lib/country-profiles";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/app/human-review")({
  head: () => ({
    meta: [
      { title: "Human review — PayClarity" },
      {
        name: "description",
        content:
          "Final human decision checkpoint for AI-generated compliance explanations.",
      },
    ],
  }),
  component: HumanReviewPage,
});

type ReviewStatus =
  | "pending"
  | "in_progress"
  | "draft_saved"
  | "approved"
  | "escalated"
  | "completed";

type RiskLevel = "high" | "medium" | "low";

type ReviewItem = {
  id: string;
  category: string;
  gapPct: number;
  confidence: number;
  riskLevel: RiskLevel;
  draft: string;
  factors: string[];
  reviewer: string;
  lastUpdated: string;
};

const REVIEW_ITEMS: ReviewItem[] = [
  {
    id: "rev_1",
    category: "Engineering IC Level 2",
    gapPct: 6.3,
    confidence: 78,
    riskLevel: "medium",
    draft:
      "Engineering IC Level 2 shows a 6.3% pay gap. Initial analysis suggests the difference may be partially explained by tenure distribution and geographic salary adjustments. Human review is required before this explanation can be used for compliance reporting.",
    factors: ["Tenure distribution", "Geographic adjustments", "Experience levels"],
    reviewer: "Anna Novak",
    lastUpdated: "2026-03-12T14:22:00Z",
  },
  {
    id: "rev_2",
    category: "Engineering Management",
    gapPct: 6.7,
    confidence: 65,
    riskLevel: "medium",
    draft:
      "Engineering Management shows a 6.7% pay gap. The small sample size (12 employees) means the gap is heavily influenced by two male Director-level managers with longer tenure. Human review is strongly recommended before using this explanation for compliance reporting.",
    factors: ["Seniority differences", "Market premium roles"],
    reviewer: "Unassigned",
    lastUpdated: "2026-03-12T10:15:00Z",
  },
  {
    id: "rev_3",
    category: "Data & Analytics",
    gapPct: 7.3,
    confidence: 72,
    riskLevel: "medium",
    draft:
      "Data & Analytics shows a 7.3% pay gap. Analysis suggests the difference may be partially explained by market premium for data engineering roles, experience level differences, and geographic adjustments. The remaining 2.0 percentage points require documented justification and human review.",
    factors: ["Market premium roles", "Experience levels", "Geographic adjustments"],
    reviewer: "Marco Bianchi",
    lastUpdated: "2026-03-11T16:40:00Z",
  },
  {
    id: "rev_4",
    category: "Sales Management",
    gapPct: 9.4,
    confidence: 55,
    riskLevel: "high",
    draft:
      "Sales Management shows a 9.4% pay gap. Gap exceeds 5% with no objective justification identified. Seniority distribution is similar. Recommend joint pay assessment per EU directive Article 10.",
    factors: ["No objective factors identified"],
    reviewer: "Unassigned",
    lastUpdated: "2026-03-11T11:08:00Z",
  },
  {
    id: "rev_5",
    category: "Marketing IC",
    gapPct: 10.1,
    confidence: 48,
    riskLevel: "high",
    draft:
      "Marketing IC shows a 10.1% pay gap. Significant gap with no objective factors identified. Role levels appear comparable. Recommend immediate joint pay assessment and human review.",
    factors: ["No objective factors identified"],
    reviewer: "Anna Novak",
    lastUpdated: "2026-03-10T09:30:00Z",
  },
];

const REVIEWERS = [
  "Anna Novak",
  "Marco Bianchi",
  "Sophie Laurent",
  "Unassigned",
];

const STATUS_FLOW: { label: string; icon: typeof Bot; description: string }[] = [
  { label: "AI Analysis Generated", icon: Bot, description: "AI draft explanation created from gap analysis" },
  { label: "Human Review Started", icon: ClipboardCheck, description: "Reviewer opens the item and begins assessment" },
  { label: "Human Decision Submitted", icon: Check, description: "Reviewer submits final justification" },
  { label: "Review Completed", icon: CheckCircle2, description: "Decision recorded in audit trail" },
];

function HumanReviewPage() {
  const [demo] = useDemoMode();
  const files = useUploadedFiles();
  const hasData = demo || files.length > 0;

  const [statuses, setStatuses] = useState<Record<string, ReviewStatus>>({});
  const [justifications, setJustifications] = useState<Record<string, string>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reviewers, setReviewers] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState("all");
  const [reviewerFilter, setReviewerFilter] = useState("all");

  const profile = getCountryProfile(COMPANY.country);

  const stats = useMemo(() => {
    const items = REVIEW_ITEMS.map((r) => ({
      ...r,
      status: statuses[r.id] ?? "pending",
    }));
    const pending = items.filter((i) => i.status === "pending").length;
    const inProgress = items.filter(
      (i) => i.status === "in_progress" || i.status === "draft_saved",
    ).length;
    const approved = items.filter((i) => i.status === "approved" || i.status === "completed").length;
    const escalated = items.filter((i) => i.status === "escalated").length;
    const completionPct = Math.round((approved / items.length) * 100);
    return { pending, inProgress, approved, escalated, completionPct };
  }, [statuses]);

  const filteredItems = useMemo(
    () =>
      REVIEW_ITEMS.filter((r) => {
        const status = statuses[r.id] ?? "pending";
        const reviewer = reviewers[r.id] ?? r.reviewer;
        return (
          (statusFilter === "all" || status === statusFilter) &&
          (reviewerFilter === "all" || reviewer === reviewerFilter)
        );
      }),
    [statuses, reviewers, statusFilter, reviewerFilter],
  );

  const activeItem = REVIEW_ITEMS.find((r) => r.id === activeId) ?? null;

  const updateStatus = (id: string, status: ReviewStatus) => {
    setStatuses((prev) => ({ ...prev, [id]: status }));
    const labels: Record<ReviewStatus, string> = {
      pending: "returned to pending",
      in_progress: "marked as in progress",
      draft_saved: "draft saved",
      approved: "approved",
      escalated: "escalated for legal review",
      completed: "completed",
    };
    toast.success(`Explanation ${labels[status]}`);
  };

  const handleSaveDraft = (id: string) => {
    updateStatus(id, "draft_saved");
  };

  const handleFinalise = (id: string) => {
    if (!justifications[id]?.trim()) {
      toast("Add a final justification before finalising");
      return;
    }
    updateStatus(id, "completed");
    setActiveId(null);
  };

  const handleApproveContinue = (id: string) => {
    updateStatus(id, "approved");
    setActiveId(null);
  };

  const handleEscalate = (id: string) => {
    updateStatus(id, "escalated");
    setActiveId(null);
  };

  const handleReject = (id: string) => {
    updateStatus(id, "pending");
    setActiveId(null);
  };

  const openDrawer = (id: string) => {
    setActiveId(id);
    if (statuses[id] === "pending" || !statuses[id]) {
      updateStatus(id, "in_progress");
    }
  };

  if (!hasData) {
    return (
      <div className="mx-auto max-w-4xl">
        <PageHeader
          title="Human review"
          description="Final human checkpoint before compliance report generation"
        />
        <NoDataState />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Human review"
        description="Final human decision checkpoint — review, approve, or escalate AI-generated explanations"
        actions={
          <Button variant="outline" asChild>
            <Link to="/app/explanations">
              <ArrowLeft className="mr-1 h-4 w-4" /> AI explanations
            </Link>
          </Button>
        }
      />

      <div className="mb-6">
        <WorkflowStrip current="human" />
      </div>

      {/* Compliance alert */}
      <div className="mb-6">
        <ComplianceAlert
          tone="warning"
          title="Employer accountability"
          message="Final responsibility for compliance decisions remains with the employer. AI-generated explanations and recommendations do not transfer legal liability. All approvals, rejections, and escalations are recorded in the audit trail."
          linkTo="/app/compliance"
          linkLabel="View compliance library →"
        />
      </div>

      {/* Country-specific guidance */}
      {profile && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl border border-info/30 bg-info/5 p-4"
        >
          <div className="flex items-start gap-3">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-info/10 text-info">
              <Scale className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">
                {profile.country} recommends maintaining evidence supporting:
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {profile.acceptedJustifications.map((j) => (
                  <span
                    key={j}
                    className="rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success"
                  >
                    {j}
                  </span>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <FolderCheck className="h-3.5 w-3.5 text-teal" />
                Keep evidence: {profile.evidenceToKeep.slice(0, 3).join(", ")}, and more.
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* KPI cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          {
            label: "Pending",
            value: stats.pending,
            icon: Clock,
            tone: "text-muted-foreground",
          },
          {
            label: "In progress",
            value: stats.inProgress,
            icon: CircleDot,
            tone: "text-teal",
          },
          {
            label: "Approved",
            value: stats.approved,
            icon: CheckCircle2,
            tone: "text-success",
          },
          {
            label: "Escalated",
            value: stats.escalated,
            icon: Gavel,
            tone: "text-warning",
          },
          {
            label: "Completion",
            value: `${stats.completionPct}%`,
            icon: ClipboardCheck,
            tone:
              stats.completionPct >= 80
                ? "text-success"
                : stats.completionPct >= 50
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

      {/* Completion progress bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-6 rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display text-sm font-semibold">
              Review completion progress
            </div>
            <div className="text-xs text-muted-foreground">
              {stats.approved} of {REVIEW_ITEMS.length} explanations approved
            </div>
          </div>
          <div
            className={cn(
              "font-display text-2xl font-bold tabular-nums",
              stats.completionPct >= 80
                ? "text-success"
                : stats.completionPct >= 50
                  ? "text-warning"
                  : "text-destructive",
            )}
          >
            {stats.completionPct}%
          </div>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stats.completionPct}%` }}
            transition={{ duration: 0.6 }}
            className={cn(
              "h-full rounded-full",
              stats.completionPct >= 80
                ? "bg-success"
                : stats.completionPct >= 50
                  ? "bg-warning"
                  : "bg-destructive",
            )}
          />
        </div>
      </motion.div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In progress</SelectItem>
            <SelectItem value="draft_saved">Draft saved</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="escalated">Escalated</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={reviewerFilter} onValueChange={setReviewerFilter}>
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue placeholder="Filter by reviewer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All reviewers</SelectItem>
            {REVIEWERS.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto text-xs text-muted-foreground tabular-nums">
          {filteredItems.length} of {REVIEW_ITEMS.length} items
        </div>
      </div>

      {/* Review queue table */}
      <div className="mb-6 rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-card)]">
        <div className="border-b border-border/60 p-4">
          <div className="text-sm font-medium">Review queue</div>
          <div className="text-xs text-muted-foreground">
            Click any row to open the review drawer
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Employee group</th>
                <th className="px-3 py-3 font-medium">Pay gap</th>
                <th className="px-3 py-3 font-medium">Confidence</th>
                <th className="px-3 py-3 font-medium">Reviewer</th>
                <th className="px-3 py-3 font-medium">Risk</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, i) => {
                const status = statuses[item.id] ?? "pending";
                const reviewer = reviewers[item.id] ?? item.reviewer;
                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                    onClick={() => openDrawer(item.id)}
                    className="cursor-pointer border-t border-border/60 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 font-medium">{item.category}</td>
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          "font-display font-semibold tabular-nums",
                          item.gapPct >= 5 ? "text-warning" : "text-success",
                        )}
                      >
                        {item.gapPct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-3 py-3 tabular-nums text-muted-foreground">
                      {item.confidence}%
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{reviewer}</td>
                    <td className="px-3 py-3">
                      <RiskBadge level={item.riskLevel} />
                    </td>
                    <td className="px-3 py-3">
                      <ReviewStatusBadge status={status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDrawer(item.id);
                        }}
                      >
                        Review
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
          <Link to="/app/explanations">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to AI explanations
          </Link>
        </Button>
        <Button variant="hero" asChild>
          <Link to="/app/generate-report">
            Continue to report generation{" "}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Review Drawer */}
      <ReviewDrawer
        item={activeItem}
        open={!!activeItem}
        onOpenChange={(open) => {
          if (!open) setActiveId(null);
        }}
        status={activeItem ? statuses[activeItem.id] ?? "pending" : "pending"}
        justification={activeItem ? justifications[activeItem.id] ?? "" : ""}
        onJustificationChange={(val) =>
          activeItem && setJustifications((prev) => ({ ...prev, [activeItem.id]: val }))
        }
        reviewer={activeItem ? reviewers[activeItem.id] ?? activeItem.reviewer : "Unassigned"}
        onReviewerChange={(val) =>
          activeItem && setReviewers((prev) => ({ ...prev, [activeItem.id]: val }))
        }
        countryProfile={profile}
        onSaveDraft={() => activeItem && handleSaveDraft(activeItem.id)}
        onApprove={() => activeItem && handleApproveContinue(activeItem.id)}
        onFinalise={() => activeItem && handleFinalise(activeItem.id)}
        onEscalate={() => activeItem && handleEscalate(activeItem.id)}
        onReject={() => activeItem && handleReject(activeItem.id)}
      />
    </div>
  );
}

function ReviewDrawer({
  item,
  open,
  onOpenChange,
  status,
  justification,
  onJustificationChange,
  reviewer,
  onReviewerChange,
  countryProfile,
  onSaveDraft,
  onApprove,
  onFinalise,
  onEscalate,
  onReject,
}: {
  item: ReviewItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: ReviewStatus;
  justification: string;
  onJustificationChange: (val: string) => void;
  reviewer: string;
  onReviewerChange: (val: string) => void;
  countryProfile: ReturnType<typeof getCountryProfile>;
  onSaveDraft: () => void;
  onApprove: () => void;
  onFinalise: () => void;
  onEscalate: () => void;
  onReject: () => void;
}) {
  if (!item) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-[560px]">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <SheetTitle className="text-lg">{item.category}</SheetTitle>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-medium",
                item.gapPct >= 5
                  ? "bg-warning/10 text-warning"
                  : "bg-success/10 text-success",
              )}
            >
              {item.gapPct.toFixed(1)}% gap
            </span>
            <RiskBadge level={item.riskLevel} />
            <ReviewStatusBadge status={status} />
          </div>
          <SheetDescription>
            Review and approve, reject, or escalate this AI-generated explanation
          </SheetDescription>
        </SheetHeader>

        <div className="mt-5 space-y-4">
          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border/60 bg-background p-3">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                <Percent className="h-3 w-3 text-warning" /> Pay gap
              </div>
              <div className="mt-1 font-display text-xl font-bold tabular-nums text-warning">
                {item.gapPct.toFixed(1)}%
              </div>
            </div>
            <div className="rounded-lg border border-border/60 bg-background p-3">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                <Bot className="h-3 w-3 text-teal" /> Confidence
              </div>
              <div
                className={cn(
                  "mt-1 font-display text-xl font-bold tabular-nums",
                  item.confidence >= 75
                    ? "text-success"
                    : item.confidence >= 60
                      ? "text-teal"
                      : "text-warning",
                )}
              >
                {item.confidence}%
              </div>
            </div>
          </div>

          {/* Reviewer assignment */}
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              <User className="h-3.5 w-3.5 text-teal" /> Reviewer
            </div>
            <Select value={reviewer} onValueChange={onReviewerChange}>
              <SelectTrigger className="mt-1.5 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REVIEWERS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* AI Explanation */}
          <div className="rounded-xl border border-teal/30 bg-teal/5 p-4">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              <Bot className="h-3.5 w-3.5 text-teal" /> AI explanation
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {item.draft}
            </p>
          </div>

          {/* Objective Factors */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Objective factors
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {item.factors.map((f) => {
                const isAccepted = countryProfile?.acceptedJustifications.some((j) =>
                  f.toLowerCase().includes(j.toLowerCase().split(" ")[0]),
                );
                return (
                  <span
                    key={f}
                    className={cn(
                      "rounded-md border px-2 py-0.5 text-[11px]",
                      isAccepted
                        ? "border-success/30 bg-success/10 text-success"
                        : "border-border/60 bg-muted/40 text-muted-foreground",
                    )}
                  >
                    {isAccepted && (
                      <CheckCircle2 className="mr-0.5 inline h-2.5 w-2.5" />
                    )}
                    {f}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Reviewer Notes */}
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              <Pencil className="h-3.5 w-3.5 text-teal" /> Reviewer notes — final human justification
            </div>
            <Textarea
              value={justification}
              onChange={(e) => onJustificationChange(e.target.value)}
              placeholder="Enter your final justification. Example: The pay difference is justified by two additional years of experience and team leadership responsibilities."
              className="mt-1.5 min-h-[100px]"
            />
          </div>

          {/* Decision Controls */}
          <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
            <Button size="sm" variant="ghost" onClick={onSaveDraft}>
              <Save className="mr-1 h-3.5 w-3.5" />
              Save draft
            </Button>
            <Button size="sm" variant="hero" onClick={onApprove}>
              <Check className="mr-1 h-3.5 w-3.5" />
              Approve
            </Button>
            <Button size="sm" variant="ghost" onClick={onFinalise}>
              <ShieldCheck className="mr-1 h-3.5 w-3.5" />
              Finalise
            </Button>
            <Button size="sm" variant="ghost" onClick={onEscalate}>
              <Gavel className="mr-1 h-3.5 w-3.5 text-warning" />
              Escalate
            </Button>
            <Button size="sm" variant="ghost" onClick={onReject}>
              <X className="mr-1 h-3.5 w-3.5 text-destructive" />
              Reject
            </Button>
          </div>

          {/* Timeline */}
          <div className="rounded-xl border border-border/60 bg-background p-4">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-teal" /> Review timeline
            </div>
            <ol className="mt-3 space-y-2">
              {STATUS_FLOW.map((s, idx) => {
                const reached =
                  idx === 0 ||
                  (idx === 1 && status !== "pending") ||
                  (idx === 2 &&
                    (status === "approved" ||
                      status === "completed" ||
                      status === "draft_saved")) ||
                  (idx === 3 && (status === "approved" || status === "completed"));
                return (
                  <li key={s.label} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "grid h-6 w-6 place-items-center rounded-full text-[10px]",
                          reached
                            ? "bg-teal/10 text-teal"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        <s.icon className="h-3 w-3" />
                      </div>
                      {idx < STATUS_FLOW.length - 1 && (
                        <div className="my-0.5 h-4 w-px bg-border/60" />
                      )}
                    </div>
                    <div>
                      <div
                        className={cn(
                          "text-xs font-medium",
                          reached ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {s.label}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {s.description}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Country-specific guidance */}
          {countryProfile && (
            <div className="rounded-xl border border-info/30 bg-info/5 p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                <Scale className="h-3.5 w-3.5 text-info" /> {countryProfile.country} guidance
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {countryProfile.acceptedJustifications.map((j) => (
                  <span
                    key={j}
                    className="rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success"
                  >
                    {j}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  const map = {
    pending: { label: "Pending", className: "bg-muted text-muted-foreground" },
    in_progress: { label: "In progress", className: "bg-teal/10 text-teal" },
    draft_saved: { label: "Draft saved", className: "bg-info/10 text-info" },
    approved: { label: "Approved", className: "bg-success/10 text-success" },
    escalated: { label: "Escalated", className: "bg-warning/10 text-warning" },
    completed: { label: "Completed", className: "bg-success/10 text-success" },
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

function RiskBadge({ level }: { level: RiskLevel }) {
  const map = {
    high: { label: "High", className: "bg-destructive/10 text-destructive" },
    medium: { label: "Medium", className: "bg-warning/10 text-warning" },
    low: { label: "Low", className: "bg-success/10 text-success" },
  } as const;
  const m = map[level];
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

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
          <ClipboardCheck className="h-6 w-6" />
        </div>
        <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight">
          No items to review
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          Complete the workflow through gap analysis and AI explanations
          first. Flagged categories will then appear here for human review
          and approval.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Button variant="hero" asChild>
            <Link to="/app/explanations">Go to AI explanations</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/app">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
