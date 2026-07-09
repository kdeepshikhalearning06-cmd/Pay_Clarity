import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Sparkles, FileText, ArrowRight, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { enableDemo } from "@/lib/demo-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Source = "existing" | "demo" | null;

const COUNTRIES = [
  { code: "DE", label: "🇩🇪 Germany" },
  { code: "FR", label: "🇫🇷 France" },
  { code: "NL", label: "🇳🇱 Netherlands" },
  { code: "ES", label: "🇪🇸 Spain" },
  { code: "IT", label: "🇮🇹 Italy" },
  { code: "PL", label: "🇵🇱 Poland" },
];

export function CreateReportModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const [name, setName] = useState("FY2026 Pay Transparency Assessment");
  const [cycle, setCycle] = useState("FY 2026");
  const [snapshot, setSnapshot] = useState("2026-03-31");
  const [countries, setCountries] = useState<string[]>(["DE"]);
  const [source, setSource] = useState<Source>(null);

  const canContinue = name.trim() && cycle && snapshot && countries.length > 0 && source;

  const toggleCountry = (code: string) =>
    setCountries((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));

  const handleContinue = () => {
    if (!canContinue) return;
    if (source === "demo") {
      enableDemo();
      toast.success("Sample data loaded into your workspace");
    } else {
      toast.success("Assessment draft created");
    }
    onOpenChange(false);
    navigate({
      to: "/app/reports/setup",
      search: { name, cycle, countries: countries.join(",") },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">New pay transparency assessment</DialogTitle>
          <DialogDescription>
            Name your assessment, pick the cycle, and choose which countries are included.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Assessment name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="FY2026 Pay Transparency Assessment" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="cycle">Reporting cycle</Label>
              <Select value={cycle} onValueChange={setCycle}>
                <SelectTrigger id="cycle"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Q1 2026">Q1 2026</SelectItem>
                  <SelectItem value="Q2 2026">Q2 2026</SelectItem>
                  <SelectItem value="H1 2026">H1 2026</SelectItem>
                  <SelectItem value="FY 2026">FY 2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="snapshot">Snapshot date</Label>
              <Input id="snapshot" type="date" value={snapshot} onChange={(e) => setSnapshot(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Countries included</Label>
            <div className="flex flex-wrap gap-2">
              {COUNTRIES.map((c) => {
                const active = countries.includes(c.code);
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => toggleCountry(c.code)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-all",
                      active
                        ? "border-teal bg-teal/10 text-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-teal/40",
                    )}
                  >
                    {active && <Check className="h-3 w-3 text-teal" />}
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Data source</Label>
            <div className="grid grid-cols-2 gap-3">
              <SourceOption
                icon={FileText}
                title="Use uploaded data"
                subtitle="Reuse files from Data Sources"
                active={source === "existing"}
                onClick={() => setSource("existing")}
              />
              <SourceOption
                icon={Sparkles}
                title="Try Sample Data"
                subtitle="Explore with demo dataset"
                active={source === "demo"}
                onClick={() => setSource("demo")}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="hero" disabled={!canContinue} onClick={handleContinue}>
            Continue <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SourceOption({
  icon: Icon,
  title,
  subtitle,
  active,
  onClick,
}: {
  icon: typeof FileText;
  title: string;
  subtitle: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={
        "group flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all " +
        (active
          ? "border-teal bg-teal/5 shadow-[var(--shadow-glow)]"
          : "border-border bg-background hover:border-teal/50 hover:bg-muted/40")
      }
    >
      <Icon className={"h-4 w-4 " + (active ? "text-teal" : "text-muted-foreground")} />
      <div className="text-sm font-medium">{title}</div>
      <div className="text-[11px] text-muted-foreground">{subtitle}</div>
    </motion.button>
  );
}