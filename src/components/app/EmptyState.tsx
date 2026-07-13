import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  ctaLabel,
  ctaTo,
  onCtaClick,
  secondaryLabel,
  secondaryTo,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaTo?: string;
  onCtaClick?: () => void;
  secondaryLabel?: string;
  secondaryTo?: string;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/60 bg-card p-10 text-center shadow-[var(--shadow-card)]",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-20 h-48 opacity-40"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div className="relative">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-glow)]">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mt-5 font-display text-xl font-semibold tracking-tight">
          {title}
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
        {(ctaLabel || onCtaClick) && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {ctaLabel && ctaTo && (
              <Button variant="hero" asChild>
                <Link to={ctaTo}>{ctaLabel}</Link>
              </Button>
            )}
            {ctaLabel && onCtaClick && !ctaTo && (
              <Button variant="hero" onClick={onCtaClick}>
                {ctaLabel}
              </Button>
            )}
            {secondaryLabel && secondaryTo && (
              <Button variant="outline" asChild>
                <Link to={secondaryTo}>{secondaryLabel}</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
