import { useEffect, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Sparkles,
  ShieldCheck,
  Bot,
  Upload,
  LineChart,
  FileCheck2,
  Users,
  Workflow,
  ChevronDown,
  ArrowRight,
  Globe2,
  Lock,
  Zap,
  UserCog,
  Building2,
  Scale,
  PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function useSmoothAnchor() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const a = t.closest("a[href^='#']") as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href")?.slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", `#${id}`);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const links = [
    { href: "#how", label: "How it works" },
    { href: "#benefits", label: "Benefits" },
    { href: "#try", label: "Try it" },
    { href: "#faq", label: "FAQ" },
  ];
  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-background/80 backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-glow)]">
            <Sparkles className="h-4 w-4" />
          </span>
          PayClarity
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Log in</Link>
          </Button>
          <Button size="sm" variant="hero" asChild>
            <Link to="/signup">
              Start free trial <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <button
          className="md:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          <ChevronDown
            className={cn("h-5 w-5 transition-transform", open && "rotate-180")}
          />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border/60 bg-background/95 md:hidden"
          >
            <div className="flex flex-col gap-1 p-4">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="rounded-md px-3 py-2 text-sm hover:bg-muted"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </a>
              ))}
              <Button variant="ghost" asChild onClick={() => setOpen(false)}>
                <Link to="/login">Log in</Link>
              </Button>
              <Button variant="hero" className="mt-2" asChild onClick={() => setOpen(false)}>
                <Link to="/signup">Start free trial</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 400], [0, 80]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0.4]);
  return (
    <section
      id="top"
      className="relative overflow-hidden pt-32 pb-24"
      style={{ background: "var(--gradient-hero)" }}
    >
      <motion.div
        style={{ y, opacity }}
        aria-hidden
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute left-1/2 top-24 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-teal/30 blur-3xl" />
        <div className="absolute right-1/4 top-1/2 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      </motion.div>

      {/* grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 75%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge
            variant="secondary"
            className="mb-6 gap-1.5 rounded-full border border-border/60 bg-background/70 px-4 py-1.5 backdrop-blur"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal" />
            </span>
            <span className="text-xs font-medium tracking-wide">
              EU Pay Transparency Directive — Ready
            </span>
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="mx-auto max-w-4xl font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl"
        >
          The AI copilot that guides HR through{" "}
          <span className="relative inline-block">
            <span className="bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">
              pay transparency
            </span>
            <motion.span
              layoutId="hero-underline"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="absolute -bottom-1 left-0 h-1 w-full origin-left rounded-full bg-teal/60"
            />
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
        >
          Not a dashboard. Not a calculator. An AI expert that walks your team
          through one complicated compliance process — from CSV to audit-ready
          report.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button size="lg" variant="hero" asChild>
            <Link to="/signup">
              Start free trial <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#how">See how it works</a>
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-xs text-muted-foreground"
        >
          No credit card · 14-day trial · SOC 2 in progress
        </motion.p>

        <HeroPreview />
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.35 }}
      className="relative mx-auto mt-16 max-w-5xl"
    >
      <div className="absolute -inset-6 rounded-3xl bg-[image:var(--gradient-primary)] opacity-20 blur-2xl" />
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-elegant)]">
        <div className="flex items-center gap-2 border-b border-border/60 bg-muted/40 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
          <span className="ml-3 font-mono text-xs text-muted-foreground">
            app.payclarity.eu / reports / germany-2026-q1
          </span>
        </div>
        <div className="grid gap-4 p-6 md:grid-cols-3">
          {[
            {
              label: "Compliance Readiness",
              value: "96%",
              trend: "+12 pts this week",
              tone: "success" as const,
            },
            {
              label: "Employees analysed",
              value: "1,428",
              trend: "6 need review",
              tone: "info" as const,
            },
            {
              label: "Mean pay gap",
              value: "3.2%",
              trend: "Below 5% threshold",
              tone: "teal" as const,
            },
          ].map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="rounded-xl border border-border/60 bg-background p-4"
            >
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                {c.label}
              </div>
              <div className="mt-2 font-display text-3xl font-semibold">
                {c.value}
              </div>
              <div
                className={cn(
                  "mt-1 text-xs",
                  c.tone === "success" && "text-success",
                  c.tone === "info" && "text-info",
                  c.tone === "teal" && "text-teal",
                )}
              >
                {c.trend}
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mx-6 mb-6 rounded-xl border border-teal/30 bg-teal/5 p-4">
          <div className="flex items-start gap-3">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[image:var(--gradient-teal)] text-teal-foreground">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex-1 text-sm">
              <div className="font-medium">AI Copilot</div>
              <p className="mt-1 text-muted-foreground">
                I regrouped 24 Software Engineers into 3 job clusters using
                seniority signals. Sales Managers show an 8.3% gap —{" "}
                <span className="text-foreground">want me to explain why?</span>
              </p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="teal">
                  Explain gap
                </Button>
                <Button size="sm" variant="ghost">
                  Approve grouping
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const audiences = [
  {
    icon: UserCog,
    title: "HR Managers",
    body: "Own the pay transparency workflow end-to-end. Upload data, review AI insights, and ship reports without a spreadsheet.",
  },
  {
    icon: Building2,
    title: "People Operations",
    body: "Standardise job architecture across countries and keep compliance evidence organised, versioned, and auditable.",
  },
  {
    icon: Scale,
    title: "Compliance Teams",
    body: "Every AI decision comes with reasoning, confidence, and human override — a defensible audit trail regulators will trust.",
  },
];

function Audiences() {
  return (
    <section className="border-y border-border/60 bg-muted/30 py-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-teal">
            Designed for Modern HR Teams
          </p>
          <h2 className="mt-3 font-display text-2xl font-semibold md:text-3xl">
            Built for the people who own pay equity.
          </h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {audiences.map((a, i) => (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:border-teal/40 hover:shadow-[var(--shadow-elegant)]"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal/10 text-teal transition-transform group-hover:scale-110">
                <a.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{a.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{a.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    icon: Upload,
    title: "Upload your data",
    body: "Drop a CSV or use demo data. The copilot validates, cleans, and flags every issue before you touch a spreadsheet.",
  },
  {
    icon: Workflow,
    title: "AI groups your roles",
    body: "Job architecture done in minutes, not weeks. Merge, split, and rename clusters — with reasoning you can approve.",
  },
  {
    icon: LineChart,
    title: "Gap analysis you can trust",
    body: "Mean, median, bonus, quartiles, and a risk heatmap. Every number links back to the employees behind it.",
  },
  {
    icon: FileCheck2,
    title: "Audit-ready report",
    body: "Export a country-specific PDF with AI explanations, human reviews, and a complete audit trail.",
  },
];

function HowItWorks() {
  return (
    <section id="how" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="How it works"
          title="One workflow. Four confident steps."
          subtitle="PayClarity replaces a two-week compliance sprint with an afternoon of guided decisions."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:border-teal/40 hover:shadow-[var(--shadow-elegant)]"
            >
              <div className="absolute right-4 top-4 font-display text-xs text-muted-foreground/60">
                0{i + 1}
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-glow)]">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const benefits = [
  {
    icon: Bot,
    title: "Embedded AI copilot",
    body: "Not a step in the wizard — a persistent expert available on every screen, with explanations you can approve, edit, or flag.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise-grade trust",
    body: "Full audit trail, confidence labels, and human overrides on every AI decision. Built for regulators, not demos.",
  },
  {
    icon: Globe2,
    title: "Country-aware compliance",
    body: "Germany, Netherlands, Denmark, Sweden, Finland — each with the right currency, terminology, and legal thresholds.",
  },
  {
    icon: Users,
    title: "Built for collaboration",
    body: "Comments, approvals, and role-based reviews on every AI explanation. HR, Legal, and Finance in one place.",
  },
  {
    icon: Zap,
    title: "Action-oriented, not vanity",
    body: "We don't just show 72% readiness — we hand you the prioritized action list that gets you to 100%.",
  },
  {
    icon: Lock,
    title: "Your data, your control",
    body: "EU-hosted, encrypted at rest, and never used to train foundation models. SOC 2 Type II in progress.",
  },
];

function Benefits() {
  return (
    <section id="benefits" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Why PayClarity"
          title="A compliance product that actually finishes the job."
          subtitle="Everything spreadsheets and legacy tools ask you to figure out — done for you, in the open."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)] transition-all hover:border-primary/30 hover:shadow-[var(--shadow-elegant)]"
            >
              <b.icon className="h-6 w-6 text-teal" />
              <h3 className="mt-4 font-display text-lg font-semibold">
                {b.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {b.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TryPayClarity() {
  const navigate = useNavigate();
  return (
    <section id="try" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow="Try PayClarity"
          title="Two ways to experience the copilot."
          subtitle="Kick the tires with a full guided workspace, or jump straight into a live demo — no signup required."
        />
        <div className="mx-auto mt-14 grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-teal/40 bg-card p-8 shadow-[var(--shadow-elegant)]"
          >
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-teal/20 blur-3xl transition-opacity group-hover:opacity-80" />
            <div className="relative">
              <Badge variant="secondary" className="w-fit rounded-full border border-teal/30 bg-teal/10 text-teal">
                Recommended
              </Badge>
              <h3 className="mt-4 font-display text-2xl font-semibold">
                Start your 14-day free trial
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create your workspace, connect your own data, and prepare a
                real report with your team. No card required.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                <li>• Your own private workspace</li>
                <li>• Invite HR, Legal, and Finance</li>
                <li>• Full AI copilot & audit trail</li>
              </ul>
              <Button
                size="lg"
                variant="hero"
                className="mt-8 w-full"
                onClick={() => navigate({ to: "/signup" })}
              >
                Start 14-Day Free Trial <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group relative flex flex-col rounded-2xl border border-border/60 bg-card p-8 shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-[var(--shadow-elegant)]"
          >
            <Badge variant="secondary" className="w-fit rounded-full">
              No signup
            </Badge>
            <h3 className="mt-4 font-display text-2xl font-semibold">
              Explore with demo data
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Experience the complete PayClarity workflow using a realistic
              demo company and sample salary dataset.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li>• Instant access — no email needed</li>
              <li>• Sample dataset of 1,428 employees</li>
              <li>• Explore every screen at your own pace</li>
            </ul>
            <Button
              size="lg"
              variant="outline"
              className="mt-8 w-full"
              onClick={() => navigate({ to: "/app" })}
            >
              <PlayCircle className="mr-1.5 h-4 w-4" /> Explore with Demo Data
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              No signup required.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const faqs = [
  {
    q: "Is PayClarity aligned with the EU Pay Transparency Directive?",
    a: "Yes. Every country template is mapped to the directive's reporting requirements, with country-specific thresholds, terminology, and legal notes updated as national implementations are finalised.",
  },
  {
    q: "Where is my employee data stored?",
    a: "All data is encrypted at rest and in transit and hosted exclusively in EU regions. Your data is never used to train foundation models, and you can delete an entire workspace with one click.",
  },
  {
    q: "How is the AI different from a chatbot bolted onto a dashboard?",
    a: "The copilot is embedded in every step — validation, job grouping, gap explanations, human review — and every AI decision carries a confidence label, reasoning, and a one-click human override.",
  },
  {
    q: "Can multiple people collaborate on a report?",
    a: "Yes. Invite HR, Legal, and Finance with role-based permissions. Comments, approvals, and reviewers are captured in the audit trail alongside every AI explanation.",
  },
  {
    q: "What happens after my trial?",
    a: "Your workspace stays intact. Pick a plan when you're ready — nothing is deleted, and no card is charged automatically.",
  },
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="py-24">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeader
          eyebrow="FAQ"
          title="Answers before you ask."
        />
        <div className="mt-12 divide-y divide-border/60 rounded-2xl border border-border/60 bg-card">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-muted/40"
                >
                  <span className="font-medium">{f.q}</span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-muted-foreground transition-transform",
                      isOpen && "rotate-180 text-teal",
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-sm text-muted-foreground">
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Cta() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <section id="cta" className="pb-24">
      <div className="mx-auto max-w-6xl px-6">
        <div
          className="relative overflow-hidden rounded-3xl border border-border/60 p-10 text-center shadow-[var(--shadow-elegant)] md:p-16"
          style={{ background: "var(--gradient-primary)" }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, var(--teal), transparent 40%), radial-gradient(circle at 80% 60%, var(--info), transparent 40%)",
            }}
          />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl font-display text-4xl font-semibold text-primary-foreground md:text-5xl">
              Ship your first pay transparency report this week.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
              Start free, keep your workspace forever, and let the AI copilot do
              the heavy lifting.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!email) return;
                setSent(true);
              }}
              className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="anna@company.eu"
                className="h-11 flex-1 rounded-md border border-white/20 bg-white/10 px-4 text-sm text-primary-foreground placeholder:text-primary-foreground/60 outline-none backdrop-blur focus:border-teal focus:ring-2 focus:ring-teal/40"
              />
              <Button type="submit" variant="teal" size="lg">
                {sent ? "Check your inbox ✓" : "Start free trial"}
              </Button>
            </form>
            <AnimatePresence>
              {sent && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 text-sm text-primary-foreground/80"
                >
                  We just sent a magic link to {email}.
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/30 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="grid h-6 w-6 place-items-center rounded bg-[image:var(--gradient-primary)] text-primary-foreground">
            <Sparkles className="h-3 w-3" />
          </span>
          © {new Date().getFullYear()} PayClarity — AI Compliance Copilot
        </div>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground">
            Privacy
          </a>
          <a href="#" className="hover:text-foreground">
            Security
          </a>
          <a href="#" className="hover:text-foreground">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-xs font-medium uppercase tracking-widest text-teal">
          {eyebrow}
        </div>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-5xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-4 text-muted-foreground md:text-lg">{subtitle}</p>
        )}
      </motion.div>
    </div>
  );
}

export default function LandingPage() {
  useSmoothAnchor();
  return (
    <div className="min-h-screen bg-background font-sans text-foreground antialiased">
      <Nav />
      <main>
        <Hero />
        <TrustStrip />
        <HowItWorks />
        <Benefits />
        <Pricing />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}