import { useMemo, useState, useRef, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  ArrowLeft,
  Search,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  Check,
  X,
  Pencil,
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
import { WorkflowStrip } from "@/components/app/WorkflowStrip";
import { useDemoMode, useUploadedFiles } from "@/lib/demo-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/app/review")({
  head: () => ({
    meta: [
      { title: "Review data — PayClarity" },
      {
        name: "description",
        content:
          "Human review checkpoint — verify and correct employee data before AI processing.",
      },
    ],
  }),
  component: ReviewPage,
});

type ReviewRow = {
  id: string;
  employeeId: string;
  country: string;
  countryCode: string;
  department: string;
  jobTitle: string;
  gender: "F" | "M" | "X";
  salary: number;
  currency: string;
  employmentType: "Full-time" | "Part-time" | "Contract";
  validation: "Valid" | "Warning" | "Missing";
};

type SortKey =
  | "employeeId"
  | "country"
  | "department"
  | "jobTitle"
  | "gender"
  | "salary"
  | "currency"
  | "employmentType"
  | "validation";

type SortDir = "asc" | "desc";

const COLUMNS: {
  key: SortKey;
  label: string;
  sortable: boolean;
}[] = [
  { key: "employeeId", label: "Employee ID", sortable: true },
  { key: "country", label: "Country", sortable: true },
  { key: "department", label: "Department", sortable: true },
  { key: "jobTitle", label: "Job Title", sortable: true },
  { key: "gender", label: "Gender", sortable: true },
  { key: "salary", label: "Salary", sortable: true },
  { key: "currency", label: "Currency", sortable: true },
  { key: "employmentType", label: "Employment Type", sortable: true },
  { key: "validation", label: "Validation", sortable: true },
];

function seeded(seed: number) {
  let x = seed;
  return () => {
    x = (x * 1664525 + 1013904223) >>> 0;
    return x / 2 ** 32;
  };
}

function generateRows(): ReviewRow[] {
  const rand = seeded(42);
  const countries = [
    { country: "Germany", countryCode: "DE", currency: "EUR" },
    { country: "France", countryCode: "FR", currency: "EUR" },
    { country: "Netherlands", countryCode: "NL", currency: "EUR" },
    { country: "Italy", countryCode: "IT", currency: "EUR" },
  ];
  const departments = [
    "Engineering",
    "Sales",
    "Product",
    "Finance",
    "People",
    "Marketing",
    "Operations",
  ];
  const jobTitles = [
    "Backend Engineer",
    "Software Engineer II",
    "Platform Developer",
    "Senior Sales Manager",
    "Account Executive",
    "Product Manager",
    "Senior Product Manager",
    "Financial Analyst",
    "HR Business Partner",
    "Marketing Specialist",
    "Operations Lead",
    "Frontend Developer",
    "Data Analyst",
    "Engineering Manager",
    "Sales Director",
  ];
  const genders: ReviewRow["gender"][] = ["F", "M", "F", "M", "X"];
  const types: ReviewRow["employmentType"][] = [
    "Full-time",
    "Full-time",
    "Full-time",
    "Part-time",
    "Contract",
  ];
  const validations: ReviewRow["validation"][] = [
    "Valid",
    "Valid",
    "Valid",
    "Valid",
    "Warning",
    "Missing",
  ];

  return Array.from({ length: 48 }, (_, i) => {
    const c = countries[Math.floor(rand() * countries.length)];
    return {
      id: `row_${i}`,
      employeeId: `${c.countryCode}-${1000 + i + Math.floor(rand() * 900)}`,
      country: c.country,
      countryCode: c.countryCode,
      department: departments[Math.floor(rand() * departments.length)],
      jobTitle: jobTitles[Math.floor(rand() * jobTitles.length)],
      gender: genders[Math.floor(rand() * genders.length)],
      salary: Math.round((38000 + rand() * 90000) / 100) * 100,
      currency: c.currency,
      employmentType: types[Math.floor(rand() * types.length)],
      validation: validations[Math.floor(rand() * validations.length)],
    };
  });
}

function ReviewPage() {
  const [demo] = useDemoMode();
  const files = useUploadedFiles();
  const hasData = demo || files.length > 0;

  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("all");
  const [validation, setValidation] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("employeeId");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
  if (demo) {
    setRows(generateRows());
    return;
  }

  async function loadEmployees() {
    const { data, error } = await supabase
      .from("employee_records")
      .select("*");

    if (error) {
      console.error(error);
      return;
    }

    const mappedRows: ReviewRow[] = (data ?? []).map((employee: any) => ({
  id: employee.id,
  employeeId: employee.employee_code,
  country: employee.country, // We'll make this dynamic later
  countryCode: employee.country_code,
  department: employee.department,
  jobTitle: employee.job_title,
  gender:
    employee.gender === "Female"
      ? "F"
      : employee.gender === "Male"
      ? "M"
      : "X",
  salary: Number(employee.annual_base_salary ?? 0),
  currency: "EUR",
  employmentType: "Full-time",
  validation: "Valid",
}));

setRows(mappedRows);

console.log("Mapped Review Rows:", mappedRows);
  }

  loadEmployees();
}, [demo]);

  const filtered = useMemo(() => {
    let result = rows.filter(
      (r) =>
        (country === "all" || r.countryCode === country) &&
        (validation === "all" || r.validation === validation) &&
        (q === "" ||
          r.employeeId.toLowerCase().includes(q.toLowerCase()) ||
          r.jobTitle.toLowerCase().includes(q.toLowerCase()) ||
          r.department.toLowerCase().includes(q.toLowerCase())),
    );
    result = [...result].sort((a, b) => {
      const av = String(a[sortKey]).toLowerCase();
      const bv = String(b[sortKey]).toLowerCase();
      if (sortKey === "salary") {
        return sortDir === "asc"
          ? a.salary - b.salary
          : b.salary - a.salary;
      }
      return sortDir === "asc"
        ? av.localeCompare(bv)
        : bv.localeCompare(av);
    });
    return result;
  }, [rows, country, validation, q, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handleEdit = (id: string, field: keyof ReviewRow, value: string) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (field === "salary") {
          const num = parseInt(value.replace(/[^0-9]/g, ""), 10);
          return { ...r, salary: isNaN(num) ? r.salary : num };
        }
        return { ...r, [field]: value } as ReviewRow;
      }),
    );
  };
  
  const saveRow = async (row: ReviewRow) => {
  const { error } = await supabase
    .from("employee_records")
    .update({
      employee_code: row.employeeId,
      department: row.department,
      job_title: row.jobTitle,
      gender:
        row.gender === "F"
          ? "Female"
          : row.gender === "M"
          ? "Male"
          : "Other",
      annual_base_salary: row.salary,
    })
    .eq("id", row.id);

  if (error) {
    console.error(error);
    toast.error("Failed to save changes");
    return false;
  }

  toast.success("Changes saved");
  return true;
  };

  if (!hasData) {
    return (
      <div className="mx-auto max-w-4xl">
        <PageHeader
          title="Review data"
          description="Human review checkpoint before AI processing begins"
        />
        <NoDataState />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Review data"
        description="Final human checkpoint — verify and correct employee data before AI processing"
        actions={
          <Button variant="outline" asChild>
            <Link to="/app/validate">
              <ArrowLeft className="mr-1 h-4 w-4" /> Validation
            </Link>
          </Button>
        }
      />

      <div className="mb-6">
        <WorkflowStrip current="review" />
      </div>

      <div className="rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-card)]">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border/60 p-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by ID, title, or department…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-9 pl-8"
            />
          </div>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="h-9 w-[150px]">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All countries</SelectItem>
              <SelectItem value="DE">Germany</SelectItem>
              <SelectItem value="FR">France</SelectItem>
              <SelectItem value="NL">Netherlands</SelectItem>
              <SelectItem value="IT">Italy</SelectItem>
            </SelectContent>
          </Select>
          <Select value={validation} onValueChange={setValidation}>
            <SelectTrigger className="h-9 w-[150px]">
              <SelectValue placeholder="Validation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Valid">Valid</SelectItem>
              <SelectItem value="Warning">Warning</SelectItem>
              <SelectItem value="Missing">Missing</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-xs text-muted-foreground tabular-nums">
            {filtered.length} of {rows.length} rows
          </div>
        </div>

        {/* Spreadsheet */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 font-medium whitespace-nowrap"
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className="flex items-center gap-1 transition-colors hover:text-foreground"
                      >
                        {col.label}
                        {sortKey === col.key ? (
                          sortDir === "asc" ? (
                            <ArrowUp className="h-3 w-3 text-teal" />
                          ) : (
                            <ArrowDown className="h-3 w-3 text-teal" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                ))}
                <th className="px-4 py-3 text-right font-medium">Edit</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.01, 0.3) }}
                  className={cn(
                    "border-t border-border/60 transition-colors hover:bg-muted/30",
                    r.validation === "Missing" &&
                      "bg-destructive/[0.03]",
                    r.validation === "Warning" &&
                      "bg-warning/[0.03]",
                  )}
                >
                  <Cell
                    editing={editingId === r.id}
                    value={r.employeeId}
                    onChange={(v) =>
                      handleEdit(r.id, "employeeId", v)
                    }
                    className="font-mono text-[13px]"
                  />
                  <Cell
                    editing={editingId === r.id}
                    value={r.country}
                    onChange={(v) => handleEdit(r.id, "country", v)}
                  />
                  <Cell
                    editing={editingId === r.id}
                    value={r.department}
                    onChange={(v) => handleEdit(r.id, "department", v)}
                  />
                  <Cell
                    editing={editingId === r.id}
                    value={r.jobTitle}
                    onChange={(v) => handleEdit(r.id, "jobTitle", v)}
                  />
                  <Cell
                    editing={editingId === r.id}
                    value={r.gender}
                    onChange={(v) =>
                      handleEdit(r.id, "gender", v)
                    }
                  />
                  <td className="px-4 py-2.5 tabular-nums">
                    {editingId === r.id ? (
                      <input
                        type="text"
                        defaultValue={r.salary.toLocaleString()}
                        onBlur={(e) =>
                          handleEdit(r.id, "salary", e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            handleEdit(
                              r.id,
                              "salary",
                              (e.target as HTMLInputElement).value,
                            );
                        }}
                        className="w-24 rounded border border-teal bg-background px-1.5 py-0.5 text-sm tabular-nums outline-none focus:ring-2 focus:ring-teal/30"
                        autoFocus
                      />
                    ) : (
                      `€${r.salary.toLocaleString()}`
                    )}
                  </td>
                  <Cell
                    editing={editingId === r.id}
                    value={r.currency}
                    onChange={(v) => handleEdit(r.id, "currency", v)}
                  />
                  <Cell
                    editing={editingId === r.id}
                    value={r.employmentType}
                    onChange={(v) =>
                      handleEdit(r.id, "employmentType", v)
                    }
                  />
                  <td className="px-4 py-2.5">
                    <ValidationBadge status={r.validation} />
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {editingId === r.id ? (
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            const row = rows.find((r) => r.id === editingId);

                            if (!row) return;

                             await saveRow(row);

                            setEditingId(null);
                          }}
                        >
                          <Check className="h-3.5 w-3.5 text-success" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingId(r.id)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            No rows match your filters. Try adjusting your search or filters.
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <div className="mt-6 flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link to="/app/validate">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to validation
          </Link>
        </Button>
        <Button variant="hero" asChild>
          <Link to="/app/grouping">
            Proceed to AI job grouping{" "}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function Cell({
  editing,
  value,
  onChange,
  className,
}: {
  editing: boolean;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);

  if (!editing) {
    return <td className={cn("px-4 py-2.5", className)}>{value}</td>;
  }
  return (
    <td className="px-4 py-2.5">
      <input
        type="text"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => onChange(local)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onChange(local);
        }}
        className={cn(
          "w-full min-w-[80px] rounded border border-teal bg-background px-1.5 py-0.5 text-sm outline-none focus:ring-2 focus:ring-teal/30",
          className,
        )}
      />
    </td>
  );
}

function ValidationBadge({
  status,
}: {
  status: ReviewRow["validation"];
}) {
  const map = {
    Valid: "bg-success/10 text-success",
    Warning: "bg-warning/10 text-warning",
    Missing: "bg-destructive/10 text-destructive",
  } as const;
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[11px] font-medium",
        map[status],
      )}
    >
      {status}
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
          <Search className="h-6 w-6" />
        </div>
        <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight">
          No data to review
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          Upload a payroll snapshot and run validation first, then return
          here to review and correct employee records.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Button variant="hero" asChild>
            <Link to="/app/data-sources">Go to data sources</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/app/validate">Go to validation</Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
