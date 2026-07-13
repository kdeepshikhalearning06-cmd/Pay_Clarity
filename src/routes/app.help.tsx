import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { Search, ChevronDown, Rocket, Scale, Workflow, Monitor, CirclePlay as PlayCircle, ArrowRight, Circle as HelpCircle } from "lucide-react";
import { PageHeader } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { startTour } from "@/lib/tour-store";
import { toast } from "sonner";

export const Route = createFileRoute("/app/help")({
  head: () => ({
    meta: [
      { title: "Help Center — PayClarity" },
      { name: "description", content: "Guides, FAQs, and walkthroughs for using PayClarity." },
    ],
  }),
  component: HelpCenterPage,
});

type FAQItem = { q: string; a: string };
type HelpCategory = {
  id: string;
  label: string;
  icon: typeof Rocket;
  description: string;
  items: FAQItem[];
};

const CATEGORIES: HelpCategory[] = [
  {
    id: "getting-started",
    label: "Getting Started",
    icon: Rocket,
    description: "Set up your first assessment and upload payroll data",
    items: [
      {
        q: "How do I create my first assessment?",
        a: "Navigate to Data Sources and upload your payroll export (CSV format). PayClarity will validate the file, then guide you through the eight-stage workflow: validation, grouping, gap analysis, AI explanations, human review, and report generation.",
      },
      {
        q: "How do I upload payroll data?",
        a: "Go to Data Sources and click 'Upload File'. Select a CSV export from your payroll system. The file should include employee ID, name, gender, job title, salary, and country. PayClarity validates the structure and flags any missing or inconsistent fields.",
      },
      {
        q: "What are the workflow stages?",
        a: "Every assessment moves through eight stages: 1) Upload data, 2) Validate, 3) AI Grouping, 4) Gap Analysis, 5) AI Explanations, 6) Human Review, 7) Report Generation, 8) Submission. The Workflow Strip at the top of each page shows your current stage.",
      },
    ],
  },
  {
    id: "compliance-basics",
    label: "Compliance Basics",
    icon: Scale,
    description: "Understand EU pay transparency requirements",
    items: [
      {
        q: "What is the EU Pay Transparency Directive?",
        a: "The EU Pay Transparency Directive (2023/970) requires employers to report gender pay gaps annually and take corrective action when gaps exceed 5% without objective justification. It applies to organisations with 100+ employees and includes joint pay assessment obligations.",
      },
      {
        q: "What is the 5% threshold?",
        a: "When the gender pay gap in a job category exceeds 5% and cannot be objectively justified by factors like seniority, performance, or geography, employers must conduct a joint pay assessment with employee representatives and implement a remediation plan.",
      },
      {
        q: "What is a Joint Pay Assessment?",
        a: "A joint pay assessment is a mandatory review triggered when pay gaps exceed 5% without objective justification. It involves employee representatives, documents the causes of the gap, and produces a remediation plan with measurable targets and timelines.",
      },
    ],
  },
  {
    id: "workflow-help",
    label: "Workflow Help",
    icon: Workflow,
    description: "Detailed guidance for each workflow stage",
    items: [
      {
        q: "How does data validation work?",
        a: "PayClarity checks your uploaded data for completeness, consistency, and format compliance. Missing fields, duplicate IDs, and invalid values are flagged for correction before proceeding to grouping.",
      },
      {
        q: "How does AI Grouping work?",
        a: "PayClarity uses machine learning to group employees into comparable job categories based on job titles, responsibilities, and seniority. You can review and adjust groupings before proceeding to gap analysis.",
      },
      {
        q: "What happens in Gap Analysis?",
        a: "Gap Analysis calculates the gender pay gap for each job category. Categories exceeding 5% are flagged for explanation. The analysis considers both mean and median gaps, sample sizes, and statistical significance.",
      },
      {
        q: "How do AI Explanations work?",
        a: "For each flagged pay gap, PayClarity's AI analyses objective factors (seniority, performance, geography, experience) and generates a draft explanation with a confidence score. Explanations are cross-checked against your country's accepted justifications.",
      },
      {
        q: "What is Human Review?",
        a: "Human Review is the mandatory checkpoint where a reviewer approves, edits, rejects, or escalates each AI-generated explanation. The reviewer provides a final human justification that becomes part of the compliance report.",
      },
      {
        q: "How does Report Generation work?",
        a: "Once all explanations are approved, PayClarity generates a submission-ready compliance package tailored to your country's reporting requirements. Reports include gap analysis, justifications, and remediation plans where required.",
      },
    ],
  },
  {
    id: "platform-help",
    label: "Platform Help",
    icon: Monitor,
    description: "Notifications, roles, security, and audit trail",
    items: [
      {
        q: "How do notifications work?",
        a: "Notifications alert you to review assignments, threshold breaches, deadline reminders, approval events, report generation, and team changes. Access them from the bell icon in the header or the Notifications page. Configure preferences in Settings → Preferences.",
      },
      {
        q: "What are the user roles?",
        a: "PayClarity supports five roles: Workspace Admin (full access), HR Analyst (data management and review), Reviewer (review and approve), Legal Reviewer (escalated items with audit access), and Executive Viewer (read-only dashboards and reports).",
      },
      {
        q: "What are security permissions?",
        a: "Security settings, user management, integrations, full exports, and final report submission are restricted to authorized roles. Sensitive actions like deleting a workspace or exporting full salary data require password confirmation.",
      },
      {
        q: "How do exports work?",
        a: "Full salary data exports are restricted to Workspace Admins and require password confirmation. Compliance reports can be exported as PDF or CSV once all explanations are approved.",
      },
      {
        q: "What is the audit trail?",
        a: "The audit trail records all actions taken within the workspace: data uploads, validations, reviews, approvals, escalations, report generations, and settings changes. It provides a complete compliance record for regulatory inspection.",
      },
    ],
  },
];

function HelpCenterPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredCategories = useMemo(() => {
    let cats = CATEGORIES;
    if (activeCategory !== "all") {
      cats = cats.filter((c) => c.id === activeCategory);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      cats = cats
        .map((c) => ({
          ...c,
          items: c.items.filter(
            (item) =>
              item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q),
          ),
        }))
        .filter((c) => c.items.length > 0);
    }
    return cats;
  }, [query, activeCategory]);

  const totalItems = filteredCategories.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Help Center"
        description="Guides, FAQs, and walkthroughs to help you get the most from PayClarity"
        actions={
          <Button
            variant="hero"
            onClick={() => {
              startTour();
              toast.success("Product tour started");
            }}
          >
            <PlayCircle className="mr-1 h-4 w-4" /> Restart product tour
          </Button>
        }
      />

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for guides, FAQs, or topics…"
          className="h-11 pl-10"
        />
      </div>

      {/* Category filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <CategoryChip
          active={activeCategory === "all"}
          onClick={() => setActiveCategory("all")}
          label="All topics"
        />
        {CATEGORIES.map((c) => (
          <CategoryChip
            key={c.id}
            active={activeCategory === c.id}
            onClick={() => setActiveCategory(c.id)}
            label={c.label}
            icon={c.icon}
          />
        ))}
      </div>

      {/* Quick start banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center gap-3 rounded-2xl border border-teal/30 bg-teal/5 p-4"
      >
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[image:var(--gradient-teal)] text-teal-foreground">
          <PlayCircle className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium">New to PayClarity?</div>
          <div className="text-xs text-muted-foreground">
            Take the 8-step product tour to learn the platform in under 2 minutes.
          </div>
        </div>
        <Button
          size="sm"
          variant="hero"
          onClick={() => {
            startTour();
            toast.success("Product tour started");
          }}
        >
          Start tour <ArrowRight className="ml-1 h-3.5 w-3.5" />
        </Button>
      </motion.div>

      {/* Results count */}
      <div className="mb-3 text-xs text-muted-foreground tabular-nums">
        {totalItems} article{totalItems !== 1 ? "s" : ""}
      </div>

      {/* FAQ sections */}
      {filteredCategories.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card p-10 text-center shadow-[var(--shadow-card)]">
          <HelpCircle className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            No results for "{query}". Try a different search term.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredCategories.map((cat) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-card)]"
            >
              <div className="border-b border-border/60 p-4">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-teal/10 text-teal">
                    <cat.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{cat.label}</div>
                    <div className="text-xs text-muted-foreground">{cat.description}</div>
                  </div>
                </div>
              </div>
              <Accordion type="single" collapsible className="px-4">
                {cat.items.map((item, i) => (
                  <AccordionItem key={i} value={`item-${i}`} className="border-b border-border/60 last:border-b-0">
                    <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          ))}
        </div>
      )}

      {/* Contact support */}
      <div className="mt-6 rounded-2xl border border-border/60 bg-card p-5 text-center shadow-[var(--shadow-card)]">
        <p className="text-sm text-muted-foreground">
          Still need help? Contact your workspace admin or visit the{" "}
          <Link to="/app/compliance" className="font-medium text-teal hover:underline">
            Compliance Library
          </Link>{" "}
          for country-specific guidance.
        </p>
      </div>
    </div>
  );
}

function CategoryChip({
  active,
  onClick,
  label,
  icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: typeof Rocket;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
        active
          ? "border-teal bg-teal/10 text-teal"
          : "border-border/60 bg-background text-muted-foreground hover:border-teal/40 hover:text-foreground",
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}
