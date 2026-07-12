import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Building2, ShieldCheck, TriangleAlert as AlertTriangle, CalendarClock, Users, FileText, Scale, TrendingUp, ArrowRight, Globe, Percent, Clock } from "lucide-react";
import { PageHeader } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { AssessmentContextBanner } from "@/components/app/AssessmentContextBanner";
import { COMPANY } from "@/lib/company-context";
import { getCountryProfile } from "@/lib/country-profiles";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/company-profile")({
  head: () => ({
    meta: [
      { title: "Company profile — PayClarity" },
      {
        name: "description",
        content: "Company information, compliance snapshot, and regulatory context.",
      },
    ],
  }),
  component: CompanyProfilePage,
});

const ACTIVE_RISKS = [
  { label: "Marketing IC — 10.1% gap", severity: "high" },
  { label: "Sales Management — 9.4% gap", severity: "high" },
  { label: "Data & Analytics — 7.3% gap", severity: "medium" },
  { label: "Engineering Management — 6.7% gap", severity: "medium" },
  { label: "Engineering IC Level 2 — 6.3% gap", severity: "medium" },
];

const UPCOMING_DEADLINES = [
  { title: "Annual report submission", deadline: "June 2026", daysLeft: 84 },
  { title: "Joint pay assessment — Sales Management", deadline: "Within 6 months", daysLeft: 180 },
  { title: "Joint pay assessment — Marketing IC", deadline: "Within 6 months", daysLeft: 180 },
];

function CompanyProfilePage() {
  const profile = getCountryProfile(COMPANY.country);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Company profile"
        description="Company information, compliance snapshot, and regulatory context"
        actions={
          <Button variant="outline" asChild>
            <Link to="/app/settings">
              Edit settings <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        }
      />

      <AssessmentContextBanner />

      {/* Company information */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]"
      >
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <Building2 className="h-3.5 w-3.5 text-teal" /> Company information
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoField label="Company name" value={COMPANY.name} />
          <InfoField label="Industry" value={COMPANY.industry} />
          <InfoField label="Country" value={COMPANY.country} />
          <InfoField label="Company size" value={`${COMPANY.companySize} employees`} />
          <InfoField label="Employees analysed" value={String(COMPANY.employees)} />
          <InfoField label="Reports generated" value={String(COMPANY.reportsGenerated)} />
          <InfoField label="Currency" value={COMPANY.currency} />
          <InfoField label="Fiscal year" value={COMPANY.fiscalYear} />
          <InfoField label="Assessment date" value={COMPANY.assessmentDate} />
        </div>
      </motion.section>

      {/* Compliance snapshot */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-6 rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]"
      >
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-teal" /> Compliance snapshot
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border/60 bg-background p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-teal" />
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Readiness score
              </div>
            </div>
            <div
              className={cn(
                "mt-1.5 font-display text-3xl font-bold tabular-nums",
                COMPANY.readiness >= 90
                  ? "text-success"
                  : COMPANY.readiness >= 70
                    ? "text-warning"
                    : "text-destructive",
              )}
            >
              {COMPANY.readiness}%
            </div>
          </div>
          <div className="rounded-xl border border-border/60 bg-background p-4">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-warning" />
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Overall pay gap
              </div>
            </div>
            <div className="mt-1.5 font-display text-3xl font-bold tabular-nums text-warning">
              {COMPANY.overallGap}%
            </div>
          </div>
          <div className="rounded-xl border border-border/60 bg-background p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Active risks
              </div>
            </div>
            <div className="mt-1.5 font-display text-3xl font-bold tabular-nums text-destructive">
              {ACTIVE_RISKS.length}
            </div>
          </div>
        </div>

        {/* Active risks */}
        <div className="mt-4">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Active risks
          </div>
          <div className="mt-2 space-y-1.5">
            {ACTIVE_RISKS.map((r) => (
              <div
                key={r.label}
                className="flex items-center justify-between rounded-lg border border-border/60 bg-background p-2.5 text-sm"
              >
                <span className="text-muted-foreground">{r.label}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-medium",
                    r.severity === "high"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-warning/10 text-warning",
                  )}
                >
                  {r.severity === "high" ? "High" : "Medium"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming deadlines */}
        <div className="mt-4">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Upcoming deadlines
          </div>
          <div className="mt-2 space-y-1.5">
            {UPCOMING_DEADLINES.map((d) => (
              <div
                key={d.title}
                className="flex items-center justify-between rounded-lg border border-border/60 bg-background p-2.5 text-sm"
              >
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">{d.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{d.deadline}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-medium",
                      d.daysLeft <= 90
                        ? "bg-warning/10 text-warning"
                        : "bg-info/10 text-info",
                    )}
                  >
                    {d.daysLeft} days
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Regulatory context */}
      {profile && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 rounded-2xl border border-teal/30 bg-teal/5 p-5 shadow-[var(--shadow-card)]"
        >
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <Scale className="h-3.5 w-3.5 text-teal" /> Regulatory context
          </div>
          <p className="mt-3 text-sm font-medium">
            This organisation follows {profile.country} pay transparency requirements.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <RegField
              icon={Users}
              label="Reporting threshold"
              value={`${profile.reportingThreshold}+ employees`}
            />
            <RegField
              icon={CalendarClock}
              label="Reporting frequency"
              value={profile.reportingFrequency}
            />
            <RegField
              icon={AlertTriangle}
              label="Joint assessment trigger"
              value={
                profile.jointAssessmentThreshold > 0
                  ? `${profile.jointAssessmentThreshold}% unexplained gap`
                  : "All gaps investigated"
              }
            />
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-border/60 bg-background p-3">
            <Globe className="h-3.5 w-3.5 text-teal" />
            <span className="text-xs text-muted-foreground">
              Filing authority: <span className="font-medium text-foreground">{profile.filingAuthority}</span>
            </span>
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link to="/app/compliance">
                View compliance library <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button size="sm" variant="ghost" asChild>
              <Link to="/app/executive">
                Executive dashboard <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </motion.section>
      )}
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

function RegField({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-background p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3 text-teal" /> {label}
      </div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}
