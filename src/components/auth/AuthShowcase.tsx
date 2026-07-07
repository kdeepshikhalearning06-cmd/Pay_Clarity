import { motion } from "motion/react";
import { Bot, LineChart, ShieldCheck, Sparkles, TrendingUp, FileCheck2 } from "lucide-react";

export function AuthShowcase() {
  return (
    <div className="relative hidden h-full w-full overflow-hidden lg:block" style={{ background: "var(--gradient-hero)" }}>
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-16 h-80 w-80 rounded-full bg-teal/25 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />

      <div className="relative flex h-full flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-2 font-display text-lg font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-glow)]">
              <Sparkles className="h-4 w-4" />
            </span>
            PayClarity
          </div>
        </div>

        <div className="mx-auto w-full max-w-md">
          <FloatingDashboard />
        </div>

        <div className="max-w-md">
          <h2 className="font-display text-3xl font-semibold leading-tight">
            Simplify Pay Transparency Compliance
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Upload your pay data, identify gender pay gaps, generate AI-assisted
            explanations, and prepare compliance-ready reports — all in one workflow.
          </p>
        </div>
      </div>
    </div>
  );
}

function FloatingDashboard() {
  const cards = [
    { icon: ShieldCheck, label: "Compliance Readiness", value: "96%", tone: "text-success" },
    { icon: LineChart, label: "Mean pay gap", value: "3.2%", tone: "text-teal" },
    { icon: TrendingUp, label: "Employees analysed", value: "1,428", tone: "text-info" },
  ];
  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="rounded-2xl border border-border/60 bg-card/90 p-4 shadow-[var(--shadow-elegant)] backdrop-blur"
      >
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <span className="h-2 w-2 rounded-full bg-destructive/70" />
          <span className="h-2 w-2 rounded-full bg-warning/70" />
          <span className="h-2 w-2 rounded-full bg-success/70" />
          <span className="ml-2 font-mono text-[10px] text-muted-foreground">app.payclarity.eu</span>
        </div>
        <div className="mt-4 grid gap-2">
          {cards.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.15, duration: 0.5 }}
              className="flex items-center justify-between rounded-lg border border-border/60 bg-background p-3"
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <c.icon className={`h-3.5 w-3.5 ${c.tone}`} />
                {c.label}
              </div>
              <div className={`font-display text-lg font-semibold ${c.tone}`}>{c.value}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-3 flex items-start gap-2 rounded-lg border border-teal/30 bg-teal/5 p-3"
        >
          <div className="grid h-6 w-6 shrink-0 place-items-center rounded bg-[image:var(--gradient-teal)] text-teal-foreground">
            <Bot className="h-3 w-3" />
          </div>
          <div className="text-[11px] leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">AI Copilot:</span> Sales
            Managers show an 8.3% gap — reviewing 24 roles for you.
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30, rotate: -3 }}
        animate={{ opacity: 1, y: 0, rotate: -3 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="absolute -bottom-6 -left-6 w-52 rounded-xl border border-border/60 bg-card/95 p-3 shadow-[var(--shadow-elegant)] backdrop-blur"
      >
        <div className="flex items-center gap-2 text-xs">
          <FileCheck2 className="h-4 w-4 text-teal" />
          <span className="font-medium">Report ready</span>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">Germany 2026 Q1 · signed off by Legal</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -20, rotate: 4 }}
        animate={{ opacity: 1, y: 0, rotate: 4 }}
        transition={{ delay: 1.3, duration: 0.6 }}
        className="absolute -right-8 -top-6 w-44 rounded-xl border border-border/60 bg-card/95 p-3 shadow-[var(--shadow-elegant)] backdrop-blur"
      >
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Audit trail</div>
        <div className="mt-1 font-display text-lg font-semibold text-teal">100%</div>
        <div className="text-[10px] text-muted-foreground">every decision logged</div>
      </motion.div>
    </div>
  );
}
