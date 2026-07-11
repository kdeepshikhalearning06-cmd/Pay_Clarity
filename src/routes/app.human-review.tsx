import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { ClipboardCheck, ArrowLeft, ArrowRight, Check, X, Pencil, Flag, Gavel, FileSearch, ArrowLeftRight, Clock, User, Bot, CircleAlert as AlertCircle, CircleCheck as CheckCircle2, TriangleAlert as AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
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
import { WorkflowStrip } from "@/components/app/WorkflowStrip";
import { useDemoMode, useUploadedFiles } from "@/lib/demo-store";
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
  | "approved"
  | "needs_revision"
  | "escalated"
  | "rejected";

type ReviewItem = {
  id: string;
  category: string;
  gapPct: number;
  confidence: number;
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

function HumanReviewPage() {
  const [demo] = useDemoMode();
  const files = useUploadedFiles();
  const hasData = demo || files.length > 0;

  const [statuses, setStatuses] = useState<Record<string, ReviewStatus>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [reviewerFilter, setReviewerFilter] = useState("all");
  const [reviewers, setReviewers] = useState<Record<string, string>>({});

  const stats = useMemo(() => {
    const items = REVIEW_ITEMS.map((r) => ({
      ...r,
      status: statuses[r.id] ?? "pending",
    }));
    const pending = items.filter((i) => i.status === "pending").length;
    const approved = items.filter((i) => i.status === "approved").length;
    const escalated = items.filter((i) => i.status === "escalated").length;
    const rejected = items.filter((i) => i.status === "rejected").length;
    const completed = items.filter(
      (i) => i.status !== "pending" && i.status !== "needs_revision",
    ).length;
    const completionPct = Math.round(
      (completed / items.length) * 100,
    );
    return { pending, approved, escalated, rejected, completionPct };
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

  const updateStatus = (id: string, status: ReviewStatus) => {
    setStatuses((prev) => ({ ...prev, [id]: status }));
    const labels: Record<ReviewStatus, string> = {
      pending: "returned to pending",
      approved: "approved",
      needs_revision: "marked as needing revision",
      escalated: "escalated for legal review",
      rejected: "rejected",
    };
    toast.success(`Explanation ${labels[status]}`);
  };

  const handleStartEdit = (item: ReviewItem) => {
    setEditingId(item.id);
    setEditValue(item.draft);
  };

  const handleSaveEdit = (id: string) => {
    setEditingId(null);
    setStatuses((prev) => ({ ...prev, [id]: "needs_revision" }));
    toast.success("Explanation updated and marked for revision");
  };

  const handleSaveNote = (id: string) => {
    const note = notes[id]?.trim();
    if (!note) {
      toast("Note is empty");
      return;
    }
    setActiveNoteId(null);
    toast.success("Reviewer note saved");
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

      {/* KPI cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          {
            label: "Pending reviews",
            value: stats.pending,
            icon: Clock,
            tone: "text-muted-foreground",
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
            label: "Rejected",
            value: stats.rejected,
            icon: X,
            tone: "text-destructive",
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
            <SelectItem value="pending">Pending review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="needs_revision">Needs revision</SelectItem>
            <SelectItem value="escalated">Escalated</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
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

      {/* Review cards */}
      <div className="space-y-4">
        {filteredItems.map((item, i) => {
          const status = statuses[item.id] ?? "pending";
          const reviewer = reviewers[item.id] ?? item.reviewer;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cn(
                "rounded-2xl border bg-card p-5 shadow-[var(--shadow-card)] transition-all",
                status === "approved" && "border-success/30",
                status === "rejected" && "border-border/60 opacity-50",
                status === "escalated" && "border-warning/30",
                status === "needs_revision" && "border-teal/40",
                status === "pending" && "border-border/60",
              )}
            >
              {/* Header row */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-sm font-semibold">
                      {item.category}
                    </h3>
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
                    <ReviewStatusBadge status={status} />
                  </div>
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {reviewer}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(item.lastUpdated)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bot className="h-3 w-3" />
                      {item.confidence}% confidence
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Draft */}
              <div className="mt-4 rounded-xl border border-teal/30 bg-teal/5 p-4">
                <div className="flex items-start gap-2">
                  <Bot className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
                  {editingId === item.id ? (
                    <div className="min-w-0 flex-1">
                      <Textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="min-h-[100px] bg-background text-sm leading-relaxed"
                        autoFocus
                      />
                      <div className="mt-2 flex gap-2">
                        <Button
                          size="sm"
                          variant="hero"
                          onClick={() => handleSaveEdit(item.id)}
                        >
                          <Check className="mr-1 h-3.5 w-3.5" /> Save changes
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.draft}
                    </p>
                  )}
                </div>
              </div>

              {/* Objective factors */}
              <div className="mt-3">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Objective factors
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {item.factors.map((f) => (
                    <span
                      key={f}
                      className="rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Expandable reviewer notes */}
              <AnimatePresence>
                {expandedId === item.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 rounded-lg border border-border/60 bg-background p-3">
                      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Reviewer notes
                      </div>
                      {notes[item.id] ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {notes[item.id]}
                        </p>
                      ) : (
                        <p className="mt-2 text-xs text-muted-foreground italic">
                          No notes recorded yet.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              {editingId !== item.id && (
                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  {status === "pending" || status === "needs_revision" ? (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateStatus(item.id, "approved")}
                      >
                        <Check className="mr-1 h-3.5 w-3.5 text-success" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStartEdit(item)}
                      >
                        <Pencil className="mr-1 h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateStatus(item.id, "rejected")}
                      >
                        <X className="mr-1 h-3.5 w-3.5 text-destructive" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateStatus(item.id, "escalated")}
                      >
                        <Gavel className="mr-1 h-3.5 w-3.5 text-warning" />
                        Escalate
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toast("Additional evidence requested")}
                      >
                        <FileSearch className="mr-1 h-3.5 w-3.5" />
                        Request evidence
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setActiveNoteId(
                            activeNoteId === item.id ? null : item.id,
                          )
                        }
                      >
                        <Pencil className="mr-1 h-3.5 w-3.5" />
                        Add note
                      </Button>
                      <Button size="sm" variant="ghost" asChild>
                        <Link to="/app/explanations">
                          <ArrowLeftRight className="mr-1 h-3.5 w-3.5" />
                          Return to AI
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateStatus(item.id, "pending")}
                    >
                      Reset to pending
                    </Button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId(expandedId === item.id ? null : item.id)
                    }
                    className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {expandedId === item.id ? (
                      <>
                        Hide notes <ChevronUp className="h-3.5 w-3.5" />
                      </>
                    ) : (
                      <>
                        Show notes <ChevronDown className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Add note form */}
              <AnimatePresence>
                {activeNoteId === item.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <Textarea
                      value={notes[item.id] ?? ""}
                      onChange={(e) =>
                        setNotes((prev) => ({
                          ...prev,
                          [item.id]: e.target.value,
                        }))
                      }
                      placeholder="Add your reviewer notes, decisions, or follow-up actions…"
                      className="mt-3 min-h-[80px]"
                    />
                    <div className="mt-2 flex gap-2">
                      <Button
                        size="sm"
                        variant="hero"
                        onClick={() => handleSaveNote(item.id)}
                      >
                        Save note
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setActiveNoteId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
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
    </div>
  );
}

function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  const map = {
    pending: { label: "Pending review", className: "bg-muted text-muted-foreground" },
    approved: { label: "Approved", className: "bg-success/10 text-success" },
    needs_revision: { label: "Needs revision", className: "bg-teal/10 text-teal" },
    escalated: { label: "Escalated", className: "bg-warning/10 text-warning" },
    rejected: { label: "Rejected", className: "bg-destructive/10 text-destructive" },
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
