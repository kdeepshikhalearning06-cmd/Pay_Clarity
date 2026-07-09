import { useMemo } from "react";
import { Download, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UploadedFile } from "@/lib/demo-store";
import { toast } from "sonner";

type Row = {
  employeeId: string;
  country: string;
  department: string;
  role: string;
  gender: string;
  salary: number;
  employmentType: string;
  validation: "OK" | "Warn" | "Missing";
};

function seeded(seed: number) {
  let x = seed;
  return () => {
    x = (x * 1664525 + 1013904223) >>> 0;
    return x / 2 ** 32;
  };
}

function generateRows(file: UploadedFile, count = 24): Row[] {
  const rand = seeded(
    Array.from(file.id).reduce((a, c) => a + c.charCodeAt(0), 0),
  );
  const departments = ["Engineering", "Sales", "Product", "Finance", "People", "Marketing", "Operations"];
  const roles = ["Manager", "Senior Analyst", "Associate", "Director", "Specialist", "Lead", "Coordinator"];
  const genders = ["F", "M", "F", "M", "X"];
  const types = ["Full-time", "Full-time", "Full-time", "Part-time", "Contract"];
  const validations: Row["validation"][] = ["OK", "OK", "OK", "OK", "Warn", "Missing"];
  return Array.from({ length: count }, (_, i) => ({
    employeeId: `${file.countryCode}-${(1000 + i + Math.floor(rand() * 900)).toString()}`,
    country: file.country,
    department: departments[Math.floor(rand() * departments.length)],
    role: roles[Math.floor(rand() * roles.length)],
    gender: genders[Math.floor(rand() * genders.length)],
    salary: Math.round((38000 + rand() * 90000) / 100) * 100,
    employmentType: types[Math.floor(rand() * types.length)],
    validation: validations[Math.floor(rand() * validations.length)],
  }));
}

export function CsvPreviewDialog({
  file,
  open,
  onOpenChange,
}: {
  file: UploadedFile | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const rows = useMemo(() => (file ? generateRows(file) : []), [file]);
  if (!file) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <FileText className="h-4 w-4 text-teal" /> {file.name}
          </DialogTitle>
          <DialogDescription>
            Read-only preview · {file.country} · {file.employees.toLocaleString()} employees ·{" "}
            {file.sizeKB} KB
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-hidden rounded-lg border border-border/60">
          <div className="max-h-[420px] overflow-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-muted/60 text-left uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Employee ID</th>
                  <th className="px-3 py-2 font-medium">Country</th>
                  <th className="px-3 py-2 font-medium">Department</th>
                  <th className="px-3 py-2 font-medium">Role</th>
                  <th className="px-3 py-2 font-medium">Gender</th>
                  <th className="px-3 py-2 font-medium">Salary</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Validation</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.employeeId} className="border-t border-border/60 hover:bg-muted/30">
                    <td className="px-3 py-1.5 font-mono">{r.employeeId}</td>
                    <td className="px-3 py-1.5">{r.country}</td>
                    <td className="px-3 py-1.5">{r.department}</td>
                    <td className="px-3 py-1.5">{r.role}</td>
                    <td className="px-3 py-1.5">{r.gender}</td>
                    <td className="px-3 py-1.5 tabular-nums">€{r.salary.toLocaleString()}</td>
                    <td className="px-3 py-1.5">{r.employmentType}</td>
                    <td className="px-3 py-1.5">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium",
                          r.validation === "OK" && "bg-success/10 text-success",
                          r.validation === "Warn" && "bg-warning/10 text-warning",
                          r.validation === "Missing" && "bg-destructive/10 text-destructive",
                        )}
                      >
                        {r.validation}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Showing first {rows.length} of {file.employees.toLocaleString()} rows · source traceable in Audit trail
        </p>

        <DialogFooter>
          <Button variant="outline" onClick={() => toast.success(`${file.name} download queued`)}>
            <Download className="mr-1 h-4 w-4" /> Download original
          </Button>
          <Button variant="hero" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}