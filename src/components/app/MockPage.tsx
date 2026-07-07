import { motion } from "motion/react";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "./AppShell";
import { Link } from "@tanstack/react-router";

export function MockPage({
  title,
  description,
  copilot,
  children,
  nextTo,
  nextLabel,
}: {
  title: string;
  description: string;
  copilot?: string;
  children: React.ReactNode;
  nextTo?: string;
  nextLabel?: string;
}) {
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={title}
        description={description}
        actions={
          nextTo && nextLabel ? (
            <Button variant="hero" asChild>
              <Link to={nextTo}>{nextLabel}</Link>
            </Button>
          ) : undefined
        }
      />
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        {children}
      </motion.div>
      {copilot && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-teal/40 bg-teal/5 p-4">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[image:var(--gradient-teal)] text-teal-foreground">
            <Bot className="h-4 w-4" />
          </div>
          <div className="text-sm">
            <div className="font-medium">AI Copilot</div>
            <p className="text-muted-foreground">{copilot}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={"rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)] " + className}>
      {children}
    </div>
  );
}