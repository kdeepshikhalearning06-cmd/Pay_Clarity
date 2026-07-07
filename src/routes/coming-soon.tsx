import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/coming-soon")({
  head: () => ({
    meta: [
      { title: "Coming soon — PayClarity" },
      { name: "description", content: "This part of the PayClarity portfolio prototype is coming soon." },
    ],
  }),
  component: ComingSoon,
});

function ComingSoon() {
  return (
    <div className="grid min-h-screen place-items-center px-6" style={{ background: "var(--gradient-hero)" }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md text-center"
      >
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-glow)]">
          <Sparkles className="h-6 w-6" />
        </div>
        <h1 className="mt-6 font-display text-4xl font-semibold">Coming soon</h1>
        <p className="mt-3 text-muted-foreground">
          This screen is part of the PayClarity product vision and will be built
          out in a later iteration of the portfolio prototype.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button variant="outline" asChild>
            <Link to="/"><ArrowLeft className="mr-1.5 h-4 w-4" />Back home</Link>
          </Button>
          <Button variant="hero" asChild>
            <Link to="/app">Explore the demo</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}