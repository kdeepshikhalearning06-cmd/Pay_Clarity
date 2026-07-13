import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Check,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  User,
  Building2,
  Globe,
  Coins,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ALL_ROLES, type UserRole } from "@/lib/user-context";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome — PayClarity" },
      { name: "description", content: "Set up your pay transparency workspace." },
    ],
  }),
  component: OnboardingPage,
});

const STEPS = [
  { id: 0, label: "Your details", icon: User },
  { id: 1, label: "Company setup", icon: Building2 },
  { id: 2, label: "Compliance context", icon: Globe },
  { id: 3, label: "Review & start", icon: Check },
];

const COUNTRIES = ["Germany", "Netherlands", "Denmark", "Sweden", "Finland", "France", "Spain"];
const INDUSTRIES = ["Technology", "Finance", "Healthcare", "Manufacturing", "Retail", "Consulting", "Education", "Other"];
const COMPANY_SIZES = ["1-50", "50-100", "100-250", "250-500", "500-1000", "1000+"];
const CURRENCIES = ["EUR", "USD", "GBP", "SEK", "DKK"];
const FISCAL_YEARS = ["FY2024", "FY2025", "FY2026", "FY2027"];
const LANGUAGES = ["English (UK)", "English (US)", "Deutsch", "Nederlands", "Dansk", "Svenska", "Suomi", "Francais", "Espanol"];

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Step 0: Personal details
  const [fullName, setFullName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState<UserRole>("HR Analyst");

  // Step 1: Company setup
  const [companyName, setCompanyName] = useState("");
  const [companySize, setCompanySize] = useState("100-250");
  const [industry, setIndustry] = useState("Technology");

  // Step 2: Compliance context
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [currency, setCurrency] = useState("EUR");
  const [fiscalYear, setFiscalYear] = useState("FY2026");
  const [language, setLanguage] = useState("English (UK)");

  const canProceed = () => {
    switch (step) {
      case 0:
        return fullName.trim().length >= 2 && jobTitle.trim().length >= 2 && department.trim().length >= 2;
      case 1:
        return companyName.trim().length >= 2;
      case 2:
        return selectedCountries.length >= 1;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      navigate({ to: "/app" });
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const toggleCountry = (country: string) => {
    setSelectedCountries((prev) =>
      prev.includes(country)
        ? prev.filter((c) => c !== country)
        : [...prev, country],
    );
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
      <header className="border-b border-border/60 bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 font-display font-semibold">
            <span className="grid h-7 w-7 place-items-center rounded bg-[image:var(--gradient-primary)] text-primary-foreground">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            PayClarity
          </Link>
          <span className="text-xs text-muted-foreground">
            Step {step + 1} of {STEPS.length}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10">
        {/* Progress steps */}
        <div className="mb-8 flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex flex-1 items-center">
              <div
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold transition-all",
                  i < step
                    ? "bg-teal text-teal-foreground"
                    : i === step
                      ? "bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-glow)]"
                      : "border border-border bg-background text-muted-foreground",
                )}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-0.5 flex-1 rounded-full transition-colors",
                    i < step ? "bg-teal" : "bg-border",
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]"
          >
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <h1 className="font-display text-2xl font-semibold">Tell us about yourself</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This helps us personalize your compliance workspace.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="full-name">Full name</Label>
                    <Input
                      id="full-name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="job-title">Job title</Label>
                    <Input
                      id="job-title"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Head of People Operations"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Human Resources"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Role in Pay Transparency Process</Label>
                    <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ALL_ROLES.map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h1 className="font-display text-2xl font-semibold">Set up your company</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This information appears on compliance reports and dashboards.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="company-name">Company name</Label>
                  <Input
                    id="company-name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Technologies GmbH"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Company size</Label>
                    <Select value={companySize} onValueChange={setCompanySize}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPANY_SIZES.map((s) => (
                          <SelectItem key={s} value={s}>{s} employees</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Industry</Label>
                    <Select value={industry} onValueChange={setIndustry}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map((i) => (
                          <SelectItem key={i} value={i}>{i}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h1 className="font-display text-2xl font-semibold">Compliance context</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Select the countries your company operates in. This determines which pay transparency rules apply.
                  </p>
                </div>
                <div>
                  <Label>Countries included</Label>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {COUNTRIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleCountry(c)}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-all",
                          selectedCountries.includes(c)
                            ? "border-teal bg-teal/10 text-foreground"
                            : "border-border/60 bg-background text-muted-foreground hover:border-teal/40",
                        )}
                      >
                        <div
                          className={cn(
                            "grid h-5 w-5 place-items-center rounded-full border",
                            selectedCountries.includes(c)
                              ? "border-teal bg-teal text-teal-foreground"
                              : "border-border",
                          )}
                        >
                          {selectedCountries.includes(c) && <Check className="h-3 w-3" />}
                        </div>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label>
                      <Coins className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />
                      Currency
                    </Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>
                      <Calendar className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />
                      Fiscal year
                    </Label>
                    <Select value={fiscalYear} onValueChange={setFiscalYear}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FISCAL_YEARS.map((f) => (
                          <SelectItem key={f} value={f}>{f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>
                      <Globe className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />
                      Language
                    </Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((l) => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <h1 className="font-display text-2xl font-semibold">Review and start</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Confirm your workspace configuration before getting started.
                  </p>
                </div>
                <div className="space-y-3">
                  <ReviewSection title="Your details">
                    <ReviewItem label="Name" value={fullName || "—"} />
                    <ReviewItem label="Job title" value={jobTitle || "—"} />
                    <ReviewItem label="Department" value={department || "—"} />
                    <ReviewItem label="Role" value={role} />
                  </ReviewSection>
                  <ReviewSection title="Company">
                    <ReviewItem label="Company name" value={companyName || "—"} />
                    <ReviewItem label="Company size" value={`${companySize} employees`} />
                    <ReviewItem label="Industry" value={industry} />
                  </ReviewSection>
                  <ReviewSection title="Compliance context">
                    <ReviewItem label="Countries" value={selectedCountries.join(", ") || "—"} />
                    <ReviewItem label="Currency" value={currency} />
                    <ReviewItem label="Fiscal year" value={fiscalYear} />
                    <ReviewItem label="Language" value={language} />
                  </ReviewSection>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 0}
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button
            variant="hero"
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {step === 3 ? "Start using PayClarity" : "Continue"}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background p-4">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </div>
      <div className="mt-2 space-y-1">{children}</div>
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
