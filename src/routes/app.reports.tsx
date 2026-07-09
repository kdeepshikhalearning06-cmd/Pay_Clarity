import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Plus,
  Search,
  Eye,
  Copy,
  Archive,
  FileText,
  Sparkles,
} from "lucide-react";
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
import { CreateReportModal } from "@/components/app/CreateReportModal";
import { UploadButton } from "@/components/app/UploadButton";
import { useDemoMode, enableDemo } from "@/lib/demo-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/app/reports")({
  head: () => ({
    meta: [
      { title: "Reports — PayClarity" },
      { name: "description", content: "Manage pay transparency reports across countries." },
    ],
  }),
  component: ReportsPage,
});

export type ReportRow = {
  name: string;
  cycle: string;
  countries: string[];
  status: "Draft" | "Data upload" | "In review" | "Submitted";
  employees: number;
  risk: "Low" | "Medium" | "High";
  readiness: number;
  date: string;
};

export const DEMO_REPORTS: ReportRow[] = [
  {
    name: "FY2026 Pay Transparency Assessment",
    cycle: "FY 2026",
    countries: ["🇩🇪 DE", "🇳🇱 NL", "🇮🇹 IT"],
    status: "In review",
    employees: 988,
    risk: "Medium",
    readiness: 92,
    date: "Mar 12, 2026",
  },
  {
    name: "2026 Mid-Year Compensation Review",
    cycle: "H1 2026",
    countries: ["🇩🇪 DE"],
    status: "Draft",
    employees: 612,
    risk: "Low",
    readiness: 58,
    date: "Mar 10, 2026",
  },
  {
    name: "Q1 Compensation Analysis",
    cycle: "Q1 2026",
    countries: ["🇩🇪 DE", "🇫🇷 FR"],
    status: "Data upload",
    employees: 996,
    risk: "High",
    readiness: 34,
    date: "Mar 06, 2026",
  },
  {
    name: "Annual Compliance Submission 2025",
    cycle: "FY 2025",
    countries: ["🇩🇪 DE", "🇳🇱 NL", "🇮🇹 IT", "🇫🇷 FR"],
    status: "Submitted",
    employees: 1372,
    risk: "Low",
    readiness: 100,
    date: "Feb 04, 2026",
  },
  {
    name: "Pre-Regulator Internal Review",
    cycle: "Q4 2025",
    countries: ["🇩🇪 DE", "🇫🇷 FR"],
    status: "Submitted",
    employees: 996,
    risk: "Medium",
    readiness: 100,
    date: "Jan 21, 2026",
  },
];

function ReportsPage() {
  const [demo] = useDemoMode();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [cycle, setCycle] = useState("all");

  const rows: ReportRow[] = demo ? DEMO_REPORTS : [];
  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (status === "all" || r.status === status) &&
          (cycle === "all" || r.cycle === cycle) &&
          (q === "" || r.name.toLowerCase().includes(q.toLowerCase())),
      ),
    [rows, status, cycle, q],
  );

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Reports"
        description="Company-wide pay transparency assessments and reporting cycles"
        actions={
          <Button variant="hero" onClick={() => setOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Create new report
          </Button>
        }
      />

      <div className="rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-card)]">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border/60 p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search reports…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-9 pl-8"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-9 w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Data upload">Data upload</SelectItem>
              <SelectItem value="In review">In review</SelectItem>
              <SelectItem value="Submitted">Submitted</SelectItem>
            </SelectContent>
          </Select>
          <Select value={cycle} onValueChange={setCycle}>
            <SelectTrigger className="h-9 w-[150px]"><SelectValue placeholder="Cycle" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cycles</SelectItem>
              <SelectItem value="Q1 2026">Q1 2026</SelectItem>
              <SelectItem value="H1 2026">H1 2026</SelectItem>
              <SelectItem value="FY 2026">FY 2026</SelectItem>
              <SelectItem value="Q4 2025">Q4 2025</SelectItem>
              <SelectItem value="FY 2025">FY 2025</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <EmptyReports demo={demo} onNewReport={() => setOpen(true)} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Assessment</th>
                  <th className="px-3 py-3 font-medium">Cycle</th>
                  <th className="px-3 py-3 font-medium">Countries</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Employees</th>
                  <th className="px-3 py-3 font-medium">Risk</th>
                  <th className="px-3 py-3 font-medium">Readiness</th>
                  <th className="px-3 py-3 font-medium">Created</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <motion.tr
                    key={r.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-t border-border/60 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-5 py-3 font-medium">{r.name}</td>
                    <td className="px-3 py-3 text-muted-foreground">{r.cycle}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        {r.countries.map((c) => (
                          <span key={c} className="rounded-full border border-border/60 bg-muted/50 px-2 py-0.5 text-[11px]">
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-3 py-3 tabular-nums">{r.employees.toLocaleString()}</td>
                    <td className="px-3 py-3"><RiskBadge risk={r.risk} /></td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 rounded-full bg-muted">
                          <div className={cn("h-1.5 rounded-full", r.readiness >= 90 ? "bg-success" : r.readiness >= 60 ? "bg-warning" : "bg-destructive")} style={{ width: `${r.readiness}%` }} />
                        </div>
                        <span className="text-xs tabular-nums text-muted-foreground">{r.readiness}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{r.date}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => toast.success(`Viewing ${r.name}`)}><Eye className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => toast.success(`Duplicated ${r.name}`)}><Copy className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => toast(`Archived ${r.name}`)}><Archive className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateReportModal open={open} onOpenChange={setOpen} />
    </div>
  );
}

function EmptyReports({ demo, onNewReport }: { demo: boolean; onNewReport: () => void }) {
  return (
    <div className="grid place-items-center px-6 py-16 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-glow)]">
        <FileText className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold">No reports yet</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {demo
          ? "No reports match your filters. Adjust the filters or create a new report."
            : "Upload a payroll snapshot first, then create your first pay transparency assessment. Or explore with sample data."}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <UploadButton variant="hero" />
        {!demo && (
          <Button variant="teal" onClick={enableDemo}><Sparkles className="mr-1 h-4 w-4" /> Try Demo Workspace</Button>
        )}
          <Button variant="outline" onClick={onNewReport}><Plus className="mr-1 h-4 w-4" /> Start New Report</Button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Draft: "bg-muted text-muted-foreground",
    "Data upload": "bg-info/10 text-info",
    "In review": "bg-warning/10 text-warning",
    Submitted: "bg-success/10 text-success",
  };
  return <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", map[status] ?? "bg-muted")}>{status}</span>;
}
function RiskBadge({ risk }: { risk: string }) {
  const map: Record<string, string> = {
    Low: "bg-success/10 text-success",
    Medium: "bg-warning/10 text-warning",
    High: "bg-destructive/10 text-destructive",
  };
  return <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", map[risk] ?? "bg-muted")}>{risk}</span>;
}