import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome — PayClarity" },
      { name: "description", content: "Set up your first pay transparency assessment." },
    ],
  }),
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();
  const steps = [
    { label: "Company setup", done: true },
    { label: "Country selection", done: true },
    { label: "Start first report", done: false },
  ];
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
          <span className="text-xs text-muted-foreground">Getting started</span>
        </div>
      </header>

      <main className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-glow)]">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="mt-6 font-display text-4xl font-semibold">
            Welcome, Anna <span className="inline-block">👋</span>
          </h1>
          <p className="mt-3 text-muted-foreground">
            Let's prepare your first pay transparency assessment.
          </p>
        </motion.div>

        <motion.ol
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-10 grid w-full gap-3"
        >
          {steps.map((s, i) => (
            <li
              key={s.label}
              className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4 text-left shadow-[var(--shadow-card)]"
            >
              <span
                className={
                  "grid h-8 w-8 place-items-center rounded-full text-xs font-semibold " +
                  (s.done
                    ? "bg-teal text-teal-foreground"
                    : "border border-border text-muted-foreground")
                }
              >
                {s.done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span className={s.done ? "font-medium" : "font-medium text-muted-foreground"}>
                {s.label}
              </span>
            </li>
          ))}
        </motion.ol>

        <Button
          size="lg"
          variant="hero"
          className="mt-10 w-full max-w-xs"
          onClick={() => navigate({ to: "/app" })}
        >
          Continue <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      </main>
    </div>
  );
}