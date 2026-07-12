import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Scale, Search, ChevronRight, CalendarClock, Users, Percent, Gavel, FileText, ShieldCheck, TriangleAlert as AlertTriangle, Clock, CircleCheck as CheckCircle2, Building2, CircleAlert, Landmark, FolderCheck } from "lucide-react";
import { PageHeader } from "@/components/app/AppShell";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { COMPANY } from "@/lib/company-context";
import { getCountryProfile, type CountryComplianceProfile } from "@/lib/country-profiles";

export const Route = createFileRoute("/app/compliance")({
  head: () => ({
    meta: [
      { title: "Compliance library — PayClarity" },
      {
        name: "description",
        content:
          "Country-specific EU Pay Transparency requirements, thresholds, and obligations.",
      },
    ],
  }),
  component: ComplianceLibraryPage,
});

type ComplianceTag =
  | "reporting_required"
  | "annual_reporting"
  | "joint_assessment_risk"
  | "employee_disclosure_rights"
  | "pending_implementation";

type CountryInfo = {
  code: string;
  name: string;
  flag: string;
  reportingRequirements: string;
  reportingFrequency: string;
  companySizeThreshold: string;
  payGapThreshold: string;
  employeeRights: string;
  employerObligations: string;
  implementationTimeline: string;
  penalties: string;
  tags: ComplianceTag[];
  overview: string;
  triggerConditions: string[];
  requiredDocumentation: string[];
  workflowMapping: { step: string; legalBasis: string }[];
};

const COUNTRIES: CountryInfo[] = [
  {
    code: "DE",
    name: "Germany",
    flag: "DE",
    reportingRequirements:
      "Annual pay transparency report covering all employees. Must include gender pay gap metrics by job category, median and mean gaps, and explanations for gaps above 5%.",
    reportingFrequency: "Annual",
    companySizeThreshold: "250+ employees",
    payGapThreshold: "5% unexplained gap triggers joint pay assessment",
    employeeRights:
      "Employees have the right to request information about individual pay levels and the pay of comparable colleagues. Pay secrecy clauses are void.",
    employerObligations:
      "Publish annual pay gap report. Conduct joint pay assessment when triggered. Document objective justifications. Provide pay transparency information to employees.",
    implementationTimeline:
      "EU directive transposition in progress. National legislation expected by June 2026. Reporting obligations begin for FY2026 cycle.",
    penalties:
      "Fines up to €500,000 for non-compliance. Potential civil liability claims from affected employees. Regulatory enforcement by Federal Anti-Discrimination Agency.",
    tags: ["reporting_required", "annual_reporting", "joint_assessment_risk", "employee_disclosure_rights"],
    overview:
      "Germany is transposing the EU Pay Transparency Directive into national law. Employers with 250+ employees must report annually on gender pay gaps. The 5% threshold triggers a joint pay assessment with works councils. Pay secrecy clauses are void under German law.",
    triggerConditions: [
      "Unexplained pay gap of 5% or more in any job category",
      "Company size of 250+ employees",
      "Joint pay assessment must be completed within 6 months of identification",
      "Works council co-determination rights apply during assessment",
      "Remediation plan required within 12 months if gaps persist",
    ],
    requiredDocumentation: [
      "Annual salary analysis by gender and job category",
      "Objective justification documentation for gaps above 5%",
      "Joint pay assessment report (if triggered)",
      "Remediation plan with timeline and measurable targets",
      "Employee pay transparency information records",
    ],
    workflowMapping: [
      { step: "Upload Data", legalBasis: "Salary data collection obligation" },
      { step: "Validate", legalBasis: "Data quality and completeness requirements" },
      { step: "Review", legalBasis: "Employer responsibility for data accuracy" },
      { step: "AI Grouping", legalBasis: "Job category classification per §3" },
      { step: "Gap Analysis", legalBasis: "5% threshold detection per §11" },
      { step: "AI Explanations", legalBasis: "Objective justification documentation" },
      { step: "Human Review", legalBasis: "Employer accountability and sign-off" },
      { step: "Generate Report", legalBasis: "Annual reporting obligation" },
    ],
  },
  {
    code: "NL",
    name: "Netherlands",
    flag: "NL",
    reportingRequirements:
      "Annual gender pay gap report. Employers must publish pay gap metrics on company website and submit to the Dutch Chamber of Commerce (KvK).",
    reportingFrequency: "Annual",
    companySizeThreshold: "100+ employees",
    payGapThreshold: "5% unexplained gap requires documented justification",
    employeeRights:
      "Employees have the right to request pay information. Pay secrecy clauses are prohibited. Works council consultation rights apply.",
    employerObligations:
      "Publish annual pay gap report on website. Submit to KvK. Document objective justifications. Conduct remediation when required.",
    implementationTimeline:
      "Dutch implementation of EU directive expected by June 2026. Existing pay gap reporting obligations already apply under Wlb (Work and Security Act).",
    penalties:
      "Administrative fines up to €87,000. Repeated non-compliance can lead to higher penalties. Public naming and shaming by Inspectorate SZW.",
    tags: ["reporting_required", "annual_reporting", "employee_disclosure_rights"],
    overview:
      "The Netherlands has existing pay gap reporting requirements and is enhancing them under the EU Pay Transparency Directive. Employers with 100+ employees must publish annual pay gap reports. The Dutch Labour Authority (IW) oversees enforcement.",
    triggerConditions: [
      "Unexplained pay gap of 5% or more in any job category",
      "Company size of 100+ employees",
      "Annual reporting deadline: June 30th following reporting year",
      "Works council consultation required for remediation measures",
    ],
    requiredDocumentation: [
      "Annual gender pay gap report",
      "Pay structure documentation by job category",
      "Objective justification records for gaps above 5%",
      "Remediation action plan (if required)",
      "Website publication confirmation",
    ],
    workflowMapping: [
      { step: "Upload Data", legalBasis: "Salary data collection under Wlb" },
      { step: "Validate", legalBasis: "Data quality requirements" },
      { step: "Review", legalBasis: "Employer data accuracy responsibility" },
      { step: "AI Grouping", legalBasis: "Job category classification" },
      { step: "Gap Analysis", legalBasis: "5% threshold detection" },
      { step: "AI Explanations", legalBasis: "Objective justification documentation" },
      { step: "Human Review", legalBasis: "Employer accountability" },
      { step: "Generate Report", legalBasis: "Annual KvK submission obligation" },
    ],
  },
  {
    code: "SE",
    name: "Sweden",
    flag: "SE",
    reportingRequirements:
      "Annual pay gap survey and action plan. Employers must conduct a gender pay gap survey every three years and develop an action plan for equal pay.",
    reportingFrequency: "Annual survey, triennial action plan",
    companySizeThreshold: "25+ employees for survey, 50+ for action plan",
    payGapThreshold: "Differences must be investigated and justified",
    employeeRights:
      "Employees have extensive pay transparency rights under Swedish Discrimination Act. Trade union access to pay information is mandated.",
    employerObligations:
      "Conduct annual pay survey. Create action plan for equal pay (50+ employees). Document and justify pay differences. Report to Swedish Discrimination Ombudsman (DO).",
    implementationTimeline:
      "Sweden has well-established pay audit requirements since 2017. EU directive enhancements being integrated into existing Discrimination Act framework.",
    penalties:
      "Discrimination damages awarded by Swedish Discrimination Ombudsman. Court-ordered compliance. Potential civil liability claims.",
    tags: ["reporting_required", "annual_reporting", "employee_disclosure_rights"],
    overview:
      "Sweden has one of the most mature pay transparency frameworks in the EU. The Swedish Discrimination Act requires annual pay surveys and action plans for equal pay. The EU directive supplements existing requirements with enhanced reporting standards.",
    triggerConditions: [
      "Any unexplained pay difference between men and women in comparable work",
      "Company size of 25+ employees for annual survey",
      "Company size of 50+ employees for action plan requirement",
      "Triennial action plan review and update",
    ],
    requiredDocumentation: [
      "Annual gender pay gap survey",
      "Equal pay action plan (50+ employees)",
      "Job classification and comparison documentation",
      "Objective justification for all pay differences",
      "Remediation progress reports",
    ],
    workflowMapping: [
      { step: "Upload Data", legalBasis: "Pay survey data collection obligation" },
      { step: "Validate", legalBasis: "Data quality and completeness" },
      { step: "Review", legalBasis: "Employer responsibility for accuracy" },
      { step: "AI Grouping", legalBasis: "Job category classification per Discrimination Act" },
      { step: "Gap Analysis", legalBasis: "Pay difference detection" },
      { step: "AI Explanations", legalBasis: "Objective justification documentation" },
      { step: "Human Review", legalBasis: "Employer accountability under DO oversight" },
      { step: "Generate Report", legalBasis: "Annual pay survey and action plan" },
    ],
  },
  {
    code: "DK",
    name: "Denmark",
    flag: "DK",
    reportingRequirements:
      "Annual gender pay gap report. Employers must publish pay gap data on a designated government portal. Data is publicly accessible.",
    reportingFrequency: "Annual",
    companySizeThreshold: "250+ employees (50+ for public sector)",
    payGapThreshold: "5% unexplained gap requires documentation",
    employeeRights:
      "Employees have access to published pay gap data. Pay transparency is mandated by Danish Equal Pay Act. No pay secrecy permitted.",
    employerObligations:
      "Publish annual pay gap report on government portal. Submit pay data by gender. Document objective justifications for gaps above 5%.",
    implementationTimeline:
      "Denmark implemented pay gap reporting in 2022. EU directive enhancements being integrated. Reporting deadline: June 1st annually.",
    penalties:
      "Fines imposed by Danish Working Environment Authority. Public disclosure of non-compliant companies. Potential civil liability.",
    tags: ["reporting_required", "annual_reporting", "employee_disclosure_rights"],
    overview:
      "Denmark has mandatory pay gap reporting since 2022. Employers publish pay gap data on a government portal. The EU Pay Transparency Directive extends requirements with enhanced documentation and joint assessment obligations.",
    triggerConditions: [
      "Unexplained pay gap of 5% or more in any job category",
      "Company size of 250+ employees (private sector)",
      "Company size of 50+ employees (public sector)",
      "Annual reporting deadline: June 1st",
    ],
    requiredDocumentation: [
      "Annual gender pay gap report",
      "Pay data by gender and job category",
      "Objective justification documentation for gaps above 5%",
      "Government portal submission confirmation",
      "Remediation plan (if required)",
    ],
    workflowMapping: [
      { step: "Upload Data", legalBasis: "Pay data collection obligation" },
      { step: "Validate", legalBasis: "Data quality requirements" },
      { step: "Review", legalBasis: "Employer data accuracy responsibility" },
      { step: "AI Grouping", legalBasis: "Job category classification" },
      { step: "Gap Analysis", legalBasis: "5% threshold detection" },
      { step: "AI Explanations", legalBasis: "Objective justification documentation" },
      { step: "Human Review", legalBasis: "Employer accountability" },
      { step: "Generate Report", legalBasis: "Government portal submission" },
    ],
  },
  {
    code: "FI",
    name: "Finland",
    flag: "FI",
    reportingRequirements:
      "Annual pay gap report as part of equality plan. Employers must conduct pay surveys and include results in their equality plan.",
    reportingFrequency: "Annual pay survey, equality plan every 2 years",
    companySizeThreshold: "30+ employees for equality plan",
    payGapThreshold: "Pay differences must be investigated and justified",
    employeeRights:
      "Employees have access to pay survey results. Pay transparency mandated by Finnish Equality Act. Employee representatives participate in pay surveys.",
    employerObligations:
      "Conduct annual pay survey. Include results in equality plan. Document and justify pay differences. Report to Occupational Safety and Health Administration.",
    implementationTimeline:
      "Finland has existing equality planning requirements. EU directive being integrated into Finnish Equality Act. Full implementation expected by 2026.",
    penalties:
      "Fines imposed by Occupational Safety and Health Administration. Court-ordered compliance. Potential discrimination damages.",
    tags: ["reporting_required", "annual_reporting", "employee_disclosure_rights", "pending_implementation"],
    overview:
      "Finland has a long-standing equality planning framework under the Finnish Equality Act. Employers with 30+ employees must maintain equality plans including pay survey results. The EU directive enhances these with stricter reporting and documentation requirements.",
    triggerConditions: [
      "Any unjustified pay difference between genders in comparable work",
      "Company size of 30+ employees for equality plan",
      "Annual pay survey requirement",
      "Equality plan update every 2 years",
    ],
    requiredDocumentation: [
      "Annual pay survey results",
      "Equality plan with pay gap analysis",
      "Objective justification documentation",
      "Employee representative consultation records",
      "Remediation measures and progress tracking",
    ],
    workflowMapping: [
      { step: "Upload Data", legalBasis: "Pay survey data collection obligation" },
      { step: "Validate", legalBasis: "Data quality requirements" },
      { step: "Review", legalBasis: "Employer responsibility for accuracy" },
      { step: "AI Grouping", legalBasis: "Job category classification per Equality Act" },
      { step: "Gap Analysis", legalBasis: "Pay difference detection" },
      { step: "AI Explanations", legalBasis: "Objective justification documentation" },
      { step: "Human Review", legalBasis: "Employer accountability under OSHA oversight" },
      { step: "Generate Report", legalBasis: "Equality plan and pay survey obligation" },
    ],
  },
];

const TAG_CONFIG: Record<
  ComplianceTag,
  { label: string; className: string }
> = {
  reporting_required: {
    label: "Reporting required",
    className: "bg-info/10 text-info",
  },
  annual_reporting: {
    label: "Annual reporting",
    className: "bg-teal/10 text-teal",
  },
  joint_assessment_risk: {
    label: "Joint assessment risk",
    className: "bg-warning/10 text-warning",
  },
  employee_disclosure_rights: {
    label: "Employee disclosure rights",
    className: "bg-success/10 text-success",
  },
  pending_implementation: {
    label: "Pending national implementation",
    className: "bg-muted text-muted-foreground",
  },
};

function ComplianceLibraryPage() {
  const [q, setQ] = useState("");
  const [tagFilter, setTagFilter] = useState("all");

  const profile = getCountryProfile(COMPANY.country);

  const filtered = useMemo(
    () =>
      COUNTRIES.filter(
        (c) =>
          (tagFilter === "all" || c.tags.includes(tagFilter as ComplianceTag)) &&
          (q === "" ||
            c.name.toLowerCase().includes(q.toLowerCase()) ||
            c.reportingRequirements.toLowerCase().includes(q.toLowerCase())),
      ),
    [q, tagFilter],
  );

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Compliance library"
        description="Country-specific EU Pay Transparency requirements, thresholds, and obligations"
      />

      {/* Workspace country profile */}
      {profile && <WorkspaceCountryProfile profile={profile} />}

      {/* Intro banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-start gap-3 rounded-2xl border border-teal/30 bg-teal/5 p-4"
      >
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[image:var(--gradient-teal)] text-teal-foreground">
          <Scale className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium">
            EU Pay Transparency Directive reference centre
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            Country-specific guidance for HR and compliance teams. This
            library is updated as national implementation progresses and
            should not replace formal legal advice.
          </div>
        </div>
      </motion.div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search countries or requirements…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-9 pl-8"
          />
        </div>
        <Select value={tagFilter} onValueChange={setTagFilter}>
          <SelectTrigger className="h-9 w-[220px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All compliance statuses</SelectItem>
            <SelectItem value="reporting_required">Reporting required</SelectItem>
            <SelectItem value="annual_reporting">Annual reporting</SelectItem>
            <SelectItem value="joint_assessment_risk">
              Joint assessment risk
            </SelectItem>
            <SelectItem value="employee_disclosure_rights">
              Employee disclosure rights
            </SelectItem>
            <SelectItem value="pending_implementation">
              Pending implementation
            </SelectItem>
          </SelectContent>
        </Select>
        <div className="text-xs text-muted-foreground tabular-nums">
          {filtered.length} of {COUNTRIES.length} countries
        </div>
      </div>

      {/* Country cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((country, i) => (
          <motion.div
            key={country.code}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to="/app/compliance/$countryCode"
              params={{ countryCode: country.code }}
              className="group block h-full rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-teal/40"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg border border-border/60 bg-muted/40 font-display text-sm font-bold">
                    {country.flag}
                  </span>
                  <div>
                    <h3 className="font-display text-base font-semibold">
                      {country.name}
                    </h3>
                    <div className="text-xs text-muted-foreground">
                      {country.companySizeThreshold}
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-teal" />
              </div>

              {/* Tags */}
              <div className="mt-3 flex flex-wrap gap-1">
                {country.tags.map((tag) => {
                  const config = TAG_CONFIG[tag];
                  return (
                    <span
                      key={tag}
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium",
                        config.className,
                      )}
                    >
                      {config.label}
                    </span>
                  );
                })}
              </div>

              {/* Key facts */}
              <div className="mt-4 space-y-2.5">
                <KeyFact
                  icon={CalendarClock}
                  label="Frequency"
                  value={country.reportingFrequency}
                />
                <KeyFact
                  icon={Users}
                  label="Threshold"
                  value={country.companySizeThreshold}
                />
                <KeyFact
                  icon={Percent}
                  label="Pay gap"
                  value={country.payGapThreshold}
                />
              </div>

              {/* Summary */}
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                {country.overview}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function KeyFact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarClock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="w-16 shrink-0 text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function WorkspaceCountryProfile({ profile }: { profile: CountryComplianceProfile }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 rounded-2xl border border-teal/40 bg-card p-5 shadow-[var(--shadow-card)]"
    >
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-[image:var(--gradient-teal)] text-teal-foreground">
          <Building2 className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold">
            Your workspace compliance profile
          </div>
          <div className="text-xs text-muted-foreground">
            {COMPANY.name} operates under {profile.country} pay transparency rules
          </div>
        </div>
        <span className="ml-auto rounded-full bg-teal/10 px-2.5 py-0.5 text-[11px] font-medium text-teal">
          {profile.implementationStatus}
        </span>
      </div>

      {/* Overview facts */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ProfileFact icon={Users} label="Reporting threshold" value={`${profile.reportingThreshold}+ employees`} />
        <ProfileFact icon={CalendarClock} label="Frequency" value={profile.reportingFrequency} />
        <ProfileFact icon={Clock} label="Deadline" value={profile.reportingDeadline} />
        <ProfileFact icon={Scale} label="Joint assessment" value={profile.jointAssessmentThreshold > 0 ? `${profile.jointAssessmentThreshold}% threshold` : "All gaps investigated"} />
      </div>

      {/* Top risks */}
      <div className="mt-5">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          <AlertTriangle className="h-3.5 w-3.5 text-warning" /> Top compliance risks
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {profile.topComplianceRisks.map((risk) => (
            <div
              key={risk}
              className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-2.5 text-xs text-muted-foreground"
            >
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
              {risk}
            </div>
          ))}
        </div>
      </div>

      {/* Accepted & risky justifications */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Accepted justifications
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {profile.acceptedJustifications.map((j) => (
              <span
                key={j}
                className="rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success"
              >
                {j}
              </span>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            <CircleAlert className="h-3.5 w-3.5 text-destructive" /> Risky justifications
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {profile.riskyJustifications.map((j) => (
              <span
                key={j}
                className="rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-[11px] font-medium text-destructive"
              >
                {j}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Filing authority */}
      <div className="mt-5 flex items-start gap-3 rounded-lg border border-border/60 bg-background p-3">
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-info/10 text-info">
          <Landmark className="h-3.5 w-3.5" />
        </div>
        <div>
          <div className="text-sm font-medium">{profile.filingAuthority}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {profile.filingAuthorityNote}
          </div>
        </div>
      </div>

      {/* Evidence to keep */}
      <div className="mt-5">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          <FolderCheck className="h-3.5 w-3.5 text-teal" /> Evidence to keep
        </div>
        <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {profile.evidenceToKeep.map((e) => (
            <div
              key={e}
              className="flex items-start gap-2 text-xs text-muted-foreground"
            >
              <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-teal" />
              {e}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function ProfileFact({
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
