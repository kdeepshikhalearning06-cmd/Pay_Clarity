import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { History, Search, Download, Upload, ShieldCheck, Pencil, Workflow, Bot, ClipboardCheck, FileCheck as FileCheck2, Eye, Flag, Gavel, ArrowRightLeft } from "lucide-react";
import { PageHeader } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { EmptyState } from "@/components/app/EmptyState";

export const Route = createFileRoute("/app/audit")({
  head: () => ({
    meta: [
      { title: "Audit trail — PayClarity" },
      {
        name: "description",
        content:
          "Immutable timeline of every AI decision, human override, and approval for regulators.",
      },
    ],
  }),
  component: AuditPage,
});

type WorkflowStage =
  | "upload"
  | "validate"
  | "review"
  | "grouping"
  | "gap"
  | "explain"
  | "human"
  | "report";

type AuditEvent = {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  stage: WorkflowStage;
  previousValue: string;
  updatedValue: string;
  icon: typeof Upload;
};

const AUDIT_EVENTS: AuditEvent[] = [
  {
    id: "evt_1",
    timestamp: "2026-03-12T16:42:00Z",
    user: "Anna Novak",
    action: "Report generated",
    stage: "report",
    previousValue: "Not generated",
    updatedValue: "FY2026 Pay Transparency Assessment",
    icon: FileCheck2,
  },
  {
    id: "evt_2",
    timestamp: "2026-03-12T15:30:00Z",
    user: "Anna Novak",
    action: "Explanation approved",
    stage: "human",
    previousValue: "Pending review",
    updatedValue: "Approved",
    icon: ClipboardCheck,
  },
  {
    id: "evt_3",
    timestamp: "2026-03-12T15:18:00Z",
    user: "Marco Bianchi",
    action: "Explanation escalated for legal review",
    stage: "human",
    previousValue: "Pending review",
    updatedValue: "Escalated",
    icon: Gavel,
  },
  {
    id: "evt_4",
    timestamp: "2026-03-12T14:22:00Z",
    user: "Anna Novak",
    action: "Reviewer note added",
    stage: "human",
    previousValue: "No notes",
    updatedValue: "Tenure data requires validation against HR system",
    icon: Pencil,
  },
  {
    id: "evt_5",
    timestamp: "2026-03-12T12:05:00Z",
    user: "AI System",
    action: "AI explanation drafted",
    stage: "explain",
    previousValue: "No draft",
    updatedValue: "Engineering IC Level 2 — 6.3% gap explanation",
    icon: Bot,
  },
  {
    id: "evt_6",
    timestamp: "2026-03-12T11:48:00Z",
    user: "AI System",
    action: "Gap analysis completed",
    stage: "gap",
    previousValue: "Not analysed",
    updatedValue: "9 categories analysed, 5 above threshold",
    icon: History,
  },
  {
    id: "evt_7",
    timestamp: "2026-03-12T10:30:00Z",
    user: "Anna Novak",
    action: "Job grouping modified",
    stage: "grouping",
    previousValue: "Data & Analytics",
    updatedValue: "Data & Analytics IC Level 2",
    icon: Workflow,
  },
  {
    id: "evt_8",
    timestamp: "2026-03-12T10:15:00Z",
    user: "Anna Novak",
    action: "Job grouping accepted",
    stage: "grouping",
    previousValue: "Pending",
    updatedValue: "Accepted — Engineering IC Level 2",
    icon: ClipboardCheck,
  },
  {
    id: "evt_9",
    timestamp: "2026-03-12T09:50:00Z",
    user: "Anna Novak",
    action: "Salary edited",
    stage: "review",
    previousValue: "€68,500",
    updatedValue: "€69,200",
    icon: Pencil,
  },
  {
    id: "evt_10",
    timestamp: "2026-03-12T09:42:00Z",
    user: "Anna Novak",
    action: "Validation warning ignored",
    stage: "validate",
    previousValue: "Open",
    updatedValue: "Ignored — Invalid currency (DE-1067)",
    icon: Eye,
  },
  {
    id: "evt_11",
    timestamp: "2026-03-12T09:35:00Z",
    user: "Anna Novak",
    action: "Issue flagged for review",
    stage: "validate",
    previousValue: "Open",
    updatedValue: "Flagged — Missing department (NL-2031)",
    icon: Flag,
  },
  {
    id: "evt_12",
    timestamp: "2026-03-12T09:20:00Z",
    user: "AI System",
    action: "Validation completed",
    stage: "validate",
    previousValue: "Processing",
    updatedValue: "Validated — 78% score, 78 issues found",
    icon: ShieldCheck,
  },
  {
    id: "evt_13",
    timestamp: "2026-03-12T09:12:00Z",
    user: "Anna Novak",
    action: "Payroll snapshot uploaded",
    stage: "upload",
    previousValue: "No file",
    updatedValue: "payroll_germany_q1.csv — 612 employees",
    icon: Upload,
  },
  {
    id: "evt_14",
    timestamp: "2026-03-11T16:40:00Z",
    user: "Marco Bianchi",
    action: "Explanation rejected",
    stage: "human",
    previousValue: "Pending review",
    updatedValue: "Rejected — Data & Analytics",
    icon: ArrowRightLeft,
  },
  {
    id: "evt_15",
    timestamp: "2026-03-11T14:10:00Z",
    user: "AI System",
    action: "Job grouping generated",
    stage: "grouping",
    previousValue: "149 ungrouped titles",
    updatedValue: "9 categories, 142 titles grouped",
    icon: Workflow,
  },
];

const STAGE_LABELS: Record<WorkflowStage, string> = {
  upload: "Upload data",
  validate: "Validate data",
  review: "Review data",
  grouping: "AI grouping",
  gap: "Gap analysis",
  explain: "AI explanations",
  human: "Human review",
  report: "Generate report",
};

function AuditPage() {
  const [q, setQ] = useState("");
  const [stage, setStage] = useState("all");
  const [user, setUser] = useState("all");

  const users = useMemo(
    () => [...new Set(AUDIT_EVENTS.map((e) => e.user))],
    [],
  );

  const filtered = useMemo(
    () =>
      AUDIT_EVENTS.filter((e) => {
        return (
          (stage === "all" || e.stage === stage) &&
          (user === "all" || e.user === user) &&
          (q === "" ||
            e.action.toLowerCase().includes(q.toLowerCase()) ||
            e.previousValue.toLowerCase().includes(q.toLowerCase()) ||
            e.updatedValue.toLowerCase().includes(q.toLowerCase()) ||
            e.user.toLowerCase().includes(q.toLowerCase()))
        );
      }),
    [q, stage, user],
  );

  const handleExport = () => {
    const rows = [
      ["Timestamp", "User", "Action", "Workflow Stage", "Previous Value", "Updated Value"],
      ...AUDIT_EVENTS.map((e) => [
        e.timestamp,
        e.user,
        e.action,
        STAGE_LABELS[e.stage],
        e.previousValue,
        e.updatedValue,
      ]),
    ];
    const csv = rows
      .map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit-trail-export.csv";
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success("Audit trail exported as CSV");
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Audit trail"
        description="Immutable timeline of every AI decision, human override, and approval for regulators"
        actions={
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-1 h-4 w-4" /> Export audit logs
          </Button>
        }
      />

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total events",
            value: AUDIT_EVENTS.length,
            icon: History,
            tone: "text-info",
          },
          {
            label: "AI actions",
            value: AUDIT_EVENTS.filter((e) => e.user === "AI System").length,
            icon: Bot,
            tone: "text-teal",
          },
          {
            label: "Human actions",
            value: AUDIT_EVENTS.filter((e) => e.user !== "AI System").length,
            icon: ClipboardCheck,
            tone: "text-info",
          },
          {
            label: "Workflow stages",
            value: new Set(AUDIT_EVENTS.map((e) => e.stage)).size,
            icon: Workflow,
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

      <div className="rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-card)]">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border/60 p-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search events, actions, values…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-9 pl-8"
            />
          </div>
          <Select value={stage} onValueChange={setStage}>
            <SelectTrigger className="h-9 w-[180px]">
              <SelectValue placeholder="Workflow stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stages</SelectItem>
              <SelectItem value="upload">Upload data</SelectItem>
              <SelectItem value="validate">Validate data</SelectItem>
              <SelectItem value="review">Review data</SelectItem>
              <SelectItem value="grouping">AI grouping</SelectItem>
              <SelectItem value="gap">Gap analysis</SelectItem>
              <SelectItem value="explain">AI explanations</SelectItem>
              <SelectItem value="human">Human review</SelectItem>
              <SelectItem value="report">Generate report</SelectItem>
            </SelectContent>
          </Select>
          <Select value={user} onValueChange={setUser}>
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="User" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All users</SelectItem>
              {users.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-xs text-muted-foreground tabular-nums">
            {filtered.length} of {AUDIT_EVENTS.length} events
          </div>
        </div>

        {/* Event table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Timestamp</th>
                <th className="px-3 py-3 font-medium">User</th>
                <th className="px-3 py-3 font-medium">Action</th>
                <th className="px-3 py-3 font-medium">Stage</th>
                <th className="px-3 py-3 font-medium">Previous value</th>
                <th className="px-3 py-3 font-medium">Updated value</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, i) => (
                <motion.tr
                  key={e.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  className="border-t border-border/60 transition-colors hover:bg-muted/30"
                >
                  <td className="px-5 py-3 font-mono text-[12px] text-muted-foreground whitespace-nowrap">
                    {formatTimestamp(e.timestamp)}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      {e.user === "AI System" ? (
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-teal/10">
                          <Bot className="h-3 w-3 text-teal" />
                        </span>
                      ) : (
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                          {e.user
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      )}
                      <span
                        className={cn(
                          "text-[13px]",
                          e.user === "AI System" && "text-teal",
                        )}
                      >
                        {e.user}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <e.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium">{e.action}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium",
                        e.user === "AI System"
                          ? "bg-teal/10 text-teal"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {STAGE_LABELS[e.stage]}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground text-[13px]">
                    {e.previousValue}
                  </td>
                  <td className="px-3 py-3 text-[13px]">
                    {e.updatedValue}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <EmptyState
            icon={History}
            title="No audit events"
            description="Activity will appear here once assessments begin. All uploads, validations, reviews, approvals, and report generations are recorded for compliance."
            ctaLabel="View dashboard"
            ctaTo="/app"
          />
        )}
      </div>
    </div>
  );
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
