import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ShieldCheck,
  Users,
  ClipboardCheck,
  AlertTriangle,
  Plus,
  Upload,
  Sparkles,
  FileText,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Eye,
  Bot,
  FileCheck2,
  History,
  Workflow,
} from "lucide-react";
import { PageHeader } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { CreateReportModal } from "@/components/app/CreateReportModal";
import { useDemoMode, enableDemo } from "@/lib/demo-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

function Dashboard() {
  const [demo] = useDemoMode();
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={demo ? "Welcome back, Anna" : "Welcome to PayClarity"}
        description={
          demo
            ? "Germany 2026 Q1 · Sample workspace loaded"
            : "Your compliance workspace is ready. Start your first pay transparency report."
        }
        actions={
          <div className="flex gap-2">
            {demo && (
              <Button variant="outline" size="sm" asChild>
                <Link to="/app/reports">
                  View reports <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
            <Button variant="hero" onClick={() => setOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> New report
            </Button>
          </div>
        }
      />

      {demo ? (
        <ActiveWorkspace onNewReport={() => setOpen(true)} />
      ) : (
        <EmptyWorkspace onNewReport={() => setOpen(true)} />
      )}
      <CreateReportModal open={open} onOpenChange={setOpen} />
    </div>
  );
}

/* ---------------- Empty state ---------------- */
function EmptyWorkspace({ onNewReport }: { onNewReport: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-10 shadow-[var(--shadow-card)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-24 h-64 opacity-70"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div className="relative mx-auto max-w-lg text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-glow)]">
          <FileText className="h-6 w-6" />
        </div>
        <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight">No reports yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Create your first pay transparency assessment or explore the platform using sample data.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Button variant="hero" onClick={onNewReport}>
            <Plus className="mr-1 h-4 w-4" /> Start New Report
          </Button>
          <Button variant="outline" onClick={onNewReport}>
            <Upload className="mr-1 h-4 w-4" /> Upload CSV
          </Button>
          <Button variant="teal" onClick={enableDemo}>
            <Sparkles className="mr-1 h-4 w-4" /> Try Demo Workspace
          </Button>
        </div>
      </div>

      <div className="relative mt-10 grid gap-3 md:grid-cols-3">
        {[
          { icon: Workflow, title: "AI job grouping", body: "Cluster hundreds of role titles into audit-ready comparators." },
          { icon: ShieldCheck, title: "Compliance readiness", body: "Track exactly what's left before your report is defensible." },
          { icon: FileCheck2, title: "Country-specific reports", body: "Generate PDF reports tuned to each country's regulator." },
        ].map((c) => (
          <div key={c.title} className="rounded-xl border border-border/60 bg-background p-4">
            <c.icon className="h-4 w-4 text-teal" />
            <div className="mt-2 text-sm font-medium">{c.title}</div>
            <p className="mt-1 text-xs text-muted-foreground">{c.body}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ---------------- Active state ---------------- */
function ActiveWorkspace({ onNewReport }: { onNewReport: () => void }) {
  const kpis = [
    { label: "Compliance readiness", value: "96%", delta: "+12 pts this month", icon: ShieldCheck, tone: "text-success" },
    { label: "Employees analysed", value: "1,428", delta: "5 countries · 6 depts", icon: Users, tone: "text-info" },
    { label: "Pending reviews", value: "7", delta: "3 legal · 4 HR", icon: ClipboardCheck, tone: "text-warning" },
    { label: "Pay gaps requiring action", value: "2", delta: "Above 5% threshold", icon: AlertTriangle, tone: "text-destructive" },
  ];

  const tasks: { text: string; tone: "danger" | "warning" | "info"; to: "/app/reports" | "/app/employees" | "/app/copilot" }[] = [
    { text: "2 explanations require legal review", tone: "warning", to: "/app/copilot" },
    { text: "4 employees remain ungrouped", tone: "warning", to: "/app/employees" },
    { text: "Germany report contains an unexplained pay gap above threshold", tone: "danger", to: "/app/reports" },
    { text: "Joint pay assessment may be required for Sales cluster", tone: "danger", to: "/app/reports" },
    { text: "Report submission deadline in 18 days", tone: "info", to: "/app/reports" },
  ];

  const reports = [
    { name: "Germany 2026 Q1", country: "🇩🇪 DE", status: "In review", employees: 612, risk: "Medium", readiness: 96, date: "Mar 12, 2026" },
    { name: "France 2026 Q1", country: "🇫🇷 FR", status: "Draft", employees: 384, risk: "Low", readiness: 72, date: "Mar 10, 2026" },
    { name: "Netherlands 2025 FY", country: "🇳🇱 NL", status: "Submitted", employees: 218, risk: "Low", readiness: 100, date: "Feb 04, 2026" },
    { name: "Spain 2026 Q1", country: "🇪🇸 ES", status: "Data upload", employees: 214, risk: "High", readiness: 34, date: "Mar 06, 2026" },
  ];

  const activity = [
    { icon: FileCheck2, text: "Germany 2026 Q1 report generated", time: "12 min ago" },
    { icon: CheckCircle2, text: "Explanation approved for Sales Managers cluster", time: "1 h ago" },
    { icon: Bot, text: "AI regrouped 24 engineers into 3 clusters", time: "3 h ago" },
    { icon: Users, text: "Ana Ribeiro completed human review for Product cluster", time: "Yesterday" },
    { icon: History, text: "Audit trail exported for 2025 FY submission", time: "2 days ago" },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        {kpis.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-teal/40"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
              <s.icon className={"h-4 w-4 " + s.tone} />
            </div>
            <div className="mt-3 font-display text-3xl font-semibold tabular-nums">{s.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{s.delta}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display text-sm font-semibold">Quick actions</div>
            <div className="text-xs text-muted-foreground">Common next steps for your workspace</div>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction icon={Plus} title="Start new report" subtitle="Create a country assessment" onClick={onNewReport} />
          <QuickAction icon={Upload} title="Upload CSV" subtitle="Bring payroll data in" onClick={onNewReport} />
          <QuickAction icon={Sparkles} title="Try demo workspace" subtitle="Explore with sample data" onClick={enableDemo} />
          <QuickAction icon={FileText} title="View reports" subtitle="Manage all assessments" to="/app/reports" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Compliance tasks */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)] lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display text-sm font-semibold">Compliance tasks</div>
              <div className="text-xs text-muted-foreground">Items requiring your team's attention</div>
            </div>
            <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[11px] font-medium text-warning">{tasks.length} open</span>
          </div>
          <ul className="mt-4 space-y-2">
            {tasks.map((t, i) => (
              <motion.li
                key={t.text}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  to={t.to}
                  className="group flex items-start gap-3 rounded-lg border border-border/60 bg-background p-3 transition-all hover:-translate-y-0.5 hover:border-teal/40 hover:shadow-[var(--shadow-card)]"
                >
                  <span
                    className={cn(
                      "mt-1 h-2 w-2 shrink-0 rounded-full",
                      t.tone === "danger" && "bg-destructive",
                      t.tone === "warning" && "bg-warning",
                      t.tone === "info" && "bg-info",
                    )}
                  />
                  <div className="flex-1 text-sm">{t.text}</div>
                  <ArrowRight className="mt-0.5 h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-teal" />
                </Link>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Recent activity */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display text-sm font-semibold">Recent activity</div>
              <div className="text-xs text-muted-foreground">Audit-logged events</div>
            </div>
            <Button size="sm" variant="ghost" asChild>
              <Link to="/app/audit">All <ArrowUpRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </div>
          <ol className="mt-4 space-y-3">
            {activity.map((a, i) => (
              <motion.li
                key={a.text}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3"
              >
                <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border/60 bg-muted/50">
                  <a.icon className="h-3.5 w-3.5 text-teal" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">{a.text}</div>
                  <div className="text-[11px] text-muted-foreground">
                    <Clock className="mr-1 inline h-3 w-3" /> {a.time}
                  </div>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>

      {/* Recent reports */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between border-b border-border/60 p-5">
          <div>
            <div className="font-display text-sm font-semibold">Recent reports</div>
            <div className="text-xs text-muted-foreground">Assessments across countries and periods</div>
          </div>
          <Button size="sm" variant="ghost" asChild>
            <Link to="/app/reports">Open Reports <ArrowUpRight className="ml-1 h-3 w-3" /></Link>
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Report</th>
                <th className="px-3 py-3 font-medium">Country</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Employees</th>
                <th className="px-3 py-3 font-medium">Risk</th>
                <th className="px-3 py-3 font-medium">Readiness</th>
                <th className="px-3 py-3 font-medium">Created</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.name} className="border-t border-border/60 transition-colors hover:bg-muted/30">
                  <td className="px-5 py-3 font-medium">{r.name}</td>
                  <td className="px-3 py-3">{r.country}</td>
                  <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-3 py-3 tabular-nums">{r.employees.toLocaleString()}</td>
                  <td className="px-3 py-3"><RiskBadge risk={r.risk} /></td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-1.5 rounded-full",
                            r.readiness >= 90 ? "bg-success" : r.readiness >= 60 ? "bg-warning" : "bg-destructive",
                          )}
                          style={{ width: `${r.readiness}%` }}
                        />
                      </div>
                      <span className="text-xs tabular-nums text-muted-foreground">{r.readiness}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{r.date}</td>
                  <td className="px-5 py-3 text-right">
                    <Button size="sm" variant="ghost" asChild>
                      <Link to="/app/reports"><Eye className="mr-1 h-3.5 w-3.5" /> View</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  title,
  subtitle,
  to,
  onClick,
}: {
  icon: typeof Plus;
  title: string;
  subtitle: string;
  to?: "/app/reports";
  onClick?: () => void;
}) {
  const inner = (
    <div className="group flex items-start gap-3 rounded-xl border border-border/60 bg-background p-3 text-left transition-all hover:-translate-y-0.5 hover:border-teal/40 hover:shadow-[var(--shadow-card)]">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[image:var(--gradient-teal)] text-teal-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-[11px] text-muted-foreground">{subtitle}</div>
      </div>
    </div>
  );
  if (to) return <Link to={to}>{inner}</Link>;
  return (
    <button type="button" onClick={onClick} className="text-left">
      {inner}
    </button>
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