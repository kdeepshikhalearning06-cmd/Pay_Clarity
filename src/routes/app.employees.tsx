import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Users, Search, Eye, Pencil, Flag, Sparkles } from "lucide-react";
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
import { useDemoMode, enableDemo } from "@/lib/demo-store";
import { UploadButton } from "@/components/app/UploadButton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/app/employees")({
  head: () => ({
    meta: [
      { title: "Employee library — PayClarity" },
      { name: "description", content: "Manage employee records that feed pay transparency reports." },
    ],
  }),
  component: EmployeesPage,
});

type Employee = {
  id: string;
  country: string;
  countryCode: string;
  department: string;
  role: string;
  gender: "F" | "M" | "X";
  band: string;
  grouping: "Grouped" | "Ungrouped" | "Review";
  validation: "Validated" | "Warning" | "Missing";
};

function seed(i: number) {
  const c = [
    { country: "Germany", countryCode: "DE" },
    { country: "France", countryCode: "FR" },
    { country: "Netherlands", countryCode: "NL" },
    { country: "Italy", countryCode: "IT" },
  ][i % 4];
  const deps = ["Engineering", "Sales", "Product", "Finance", "People", "Marketing"];
  const roles = ["Manager", "Senior Analyst", "Associate", "Director", "Specialist", "Lead"];
  const genders: Employee["gender"][] = ["F", "M", "F", "M", "X"];
  const bands = ["B1", "B2", "B3", "B4", "B5"];
  const groupings: Employee["grouping"][] = ["Grouped", "Grouped", "Grouped", "Ungrouped", "Review"];
  const validations: Employee["validation"][] = ["Validated", "Validated", "Validated", "Warning", "Missing"];
  return {
    id: `${c.countryCode}-${1000 + i}`,
    ...c,
    department: deps[i % deps.length],
    role: roles[(i * 3) % roles.length],
    gender: genders[i % genders.length],
    band: bands[i % bands.length],
    grouping: groupings[i % groupings.length],
    validation: validations[(i * 2) % validations.length],
  } satisfies Employee;
}

const DEMO_EMPLOYEES: Employee[] = Array.from({ length: 32 }, (_, i) => seed(i));

function EmployeesPage() {
  const [demo] = useDemoMode();
  const rows = demo ? DEMO_EMPLOYEES : [];
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("all");
  const [dep, setDep] = useState("all");
  const [val, setVal] = useState("all");
  const [grp, setGrp] = useState("all");

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (country === "all" || r.countryCode === country) &&
          (dep === "all" || r.department === dep) &&
          (val === "all" || r.validation === val) &&
          (grp === "all" || r.grouping === grp) &&
          (q === "" || r.id.toLowerCase().includes(q.toLowerCase()) || r.role.toLowerCase().includes(q.toLowerCase())),
      ),
    [rows, country, dep, val, grp, q],
  );

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Employee library"
        description="Inspect and manage employee records that feed every pay transparency report"
        actions={<UploadButton variant="hero" label="Import employees" />}
      />

      <div className="rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-center gap-2 border-b border-border/60 p-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search employees…" value={q} onChange={(e) => setQ(e.target.value)} className="h-9 pl-8" />
          </div>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Country" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All countries</SelectItem>
              <SelectItem value="DE">🇩🇪 Germany</SelectItem>
              <SelectItem value="FR">🇫🇷 France</SelectItem>
              <SelectItem value="NL">🇳🇱 Netherlands</SelectItem>
              <SelectItem value="IT">🇮🇹 Italy</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dep} onValueChange={setDep}>
            <SelectTrigger className="h-9 w-[150px]"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {["Engineering", "Sales", "Product", "Finance", "People", "Marketing"].map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={val} onValueChange={setVal}>
            <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Validation" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All validation</SelectItem>
              <SelectItem value="Validated">Validated</SelectItem>
              <SelectItem value="Warning">Warning</SelectItem>
              <SelectItem value="Missing">Missing</SelectItem>
            </SelectContent>
          </Select>
          <Select value={grp} onValueChange={setGrp}>
            <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Grouping" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All grouping</SelectItem>
              <SelectItem value="Grouped">Grouped</SelectItem>
              <SelectItem value="Ungrouped">Ungrouped</SelectItem>
              <SelectItem value="Review">Review</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <div className="grid place-items-center px-6 py-16 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-glow)]">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold">No employees yet</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {demo
                ? "No employees match your filters. Adjust the filters or clear them."
                : "Import a payroll snapshot to populate the employee library, or explore with sample data."}
            </p>
            {!demo && (
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <UploadButton variant="hero" label="Import employees" />
                <Button variant="teal" onClick={enableDemo}>
                  <Sparkles className="mr-1 h-4 w-4" /> Try Demo Workspace
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Employee ID</th>
                  <th className="px-3 py-3 font-medium">Country</th>
                  <th className="px-3 py-3 font-medium">Department</th>
                  <th className="px-3 py-3 font-medium">Job title</th>
                  <th className="px-3 py-3 font-medium">Gender</th>
                  <th className="px-3 py-3 font-medium">Salary band</th>
                  <th className="px-3 py-3 font-medium">Grouping</th>
                  <th className="px-3 py-3 font-medium">Validation</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.015, 0.4) }}
                    className="border-t border-border/60 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-5 py-3 font-mono text-[13px]">{r.id}</td>
                    <td className="px-3 py-3">{r.country}</td>
                    <td className="px-3 py-3">{r.department}</td>
                    <td className="px-3 py-3">{r.role}</td>
                    <td className="px-3 py-3">{r.gender}</td>
                    <td className="px-3 py-3 tabular-nums">{r.band}</td>
                    <td className="px-3 py-3">
                      <Badge tone={r.grouping === "Grouped" ? "success" : r.grouping === "Review" ? "warning" : "danger"}>
                        {r.grouping}
                      </Badge>
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone={r.validation === "Validated" ? "success" : r.validation === "Warning" ? "warning" : "danger"}>
                        {r.validation}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => toast(`Viewing ${r.id}`)}><Eye className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => toast(`Edit metadata for ${r.id}`)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => toast.success(`${r.id} flagged for review`)}><Flag className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "success" | "warning" | "danger" }) {
  const map = {
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-destructive/10 text-destructive",
  } as const;
  return <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", map[tone])}>{children}</span>;
}