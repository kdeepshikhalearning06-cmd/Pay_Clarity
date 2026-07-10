import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Database,
  Eye,
  Download,
  Replace,
  Archive,
  Search,
  Sparkles,
  FileText,
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
import { UploadButton } from "@/components/app/UploadButton";
import { CsvPreviewDialog } from "@/components/app/CsvPreviewDialog";
import {
  useUploadedFiles,
  archiveUploadedFile,
  enableDemo,
  useDemoMode,
  type UploadedFile,
} from "@/lib/demo-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/app/data-sources")({
  head: () => ({
    meta: [
      { title: "Data sources — PayClarity" },
      { name: "description", content: "Manage uploaded payroll snapshots and raw employee data files." },
    ],
  }),
  component: DataSourcesPage,
});

function DataSourcesPage() {
  const files = useUploadedFiles();
  const [demo] = useDemoMode();
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("all");
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);

  const filtered = useMemo(
    () =>
      files.filter(
        (f) =>
          (country === "all" || f.countryCode === country) &&
          (q === "" || f.name.toLowerCase().includes(q.toLowerCase())),
      ),
    [files, country, q],
  );

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Data sources"
        description="Manage uploaded payroll snapshots and raw employee data files"
        actions={<UploadButton variant="hero" />}
      />

      <div className="rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-center gap-2 border-b border-border/60 p-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search payroll snapshots…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-9 pl-8"
            />
          </div>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All countries</SelectItem>
              <SelectItem value="DE">🇩🇪 Germany</SelectItem>
              <SelectItem value="FR">🇫🇷 France</SelectItem>
              <SelectItem value="NL">🇳🇱 Netherlands</SelectItem>
              <SelectItem value="ES">🇪🇸 Spain</SelectItem>
              <SelectItem value="IT">🇮🇹 Italy</SelectItem>
              <SelectItem value="PL">🇵🇱 Poland</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <div className="grid place-items-center px-6 py-16 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-glow)]">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold">No data sources yet</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Upload a payroll snapshot to start the compliance workflow, or explore with sample data.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <UploadButton variant="hero" />
              {!demo && (
                <Button variant="teal" onClick={enableDemo}>
                  <Sparkles className="mr-1 h-4 w-4" /> Try Demo Workspace
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">File</th>
                  <th className="px-3 py-3 font-medium">Country</th>
                  <th className="px-3 py-3 font-medium">Uploaded</th>
                  <th className="px-3 py-3 font-medium">Employees</th>
                  <th className="px-3 py-3 font-medium">Validation</th>
                  <th className="px-3 py-3 font-medium">Processing</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((f, i) => (
                  <motion.tr
                    key={f.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-t border-border/60 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 font-medium">
                        <FileText className="h-4 w-4 text-teal" />
                        <span className="font-mono text-[13px]">{f.name}</span>
                        {f.source === "demo" && (
                          <span className="rounded-full bg-teal/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-teal">
                            Demo
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground">{f.sizeKB} KB</div>
                    </td>
                    <td className="px-3 py-3">{f.country}</td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {new Date(f.uploadedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-3 py-3 tabular-nums">{f.employees.toLocaleString()}</td>
                    <td className="px-3 py-3">
                      <Badge tone={f.validation === "Validated" ? "success" : f.validation === "Processing" ? "warning" : "danger"}>
                        {f.validation}
                      </Badge>
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone={f.processing === "Ready" ? "success" : "info"}>
                        {f.processing}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setPreviewFile(f)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toast.success(`${f.name} download queued`)}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toast(`Replace flow for ${f.name} coming soon`)}
                        >
                          <Replace className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={f.source === "demo"}
                          onClick={() => {
                            archiveUploadedFile(f.id);
                            toast(`Archived ${f.name}`);
                          }}
                        >
                          <Archive className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CsvPreviewDialog
        file={previewFile}
        open={previewFile !== null}
        onOpenChange={(v) => !v && setPreviewFile(null)}
      />
    </div>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "success" | "warning" | "info" | "danger" }) {
  const map = {
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    info: "bg-info/10 text-info",
    danger: "bg-destructive/10 text-destructive",
  } as const;
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", map[tone])}>
      {children}
    </span>
  );
}