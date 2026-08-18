import { motion } from "motion/react";
import { Building2, ShieldCheck, Globe } from "lucide-react";
import { useWorkspace } from "@/lib/workspace-context";
import { cn } from "@/lib/utils";

export function AssessmentContextBanner({
  className,
}: {
  className?: string;
}) {
  const { workspace } = useWorkspace();

  if (!workspace) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-border/60 bg-card p-4 shadow-[var(--shadow-card)]",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-[image:var(--gradient-teal)] text-teal-foreground">
          <Building2 className="h-4 w-4" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Company
          </div>
          <div className="text-sm font-medium">{workspace.name}</div>
        </div>
      </div>
      <div className="h-8 w-px bg-border/60" />
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Assessment
        </div>
        <div className="text-sm font-medium">{workspace.assessmentName}</div>
      </div>
      <div className="h-8 w-px bg-border/60" />
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Countries included
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Globe className="h-3.5 w-3.5 text-teal" />
          {workspace.countries.map((c) => c.name).join(" · ")}
        </div>
      </div>
      <div className="h-8 w-px bg-border/60" />
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Status
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <span className="h-2 w-2 rounded-full bg-warning" />
          {workspace.assessmentStatus}
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-teal" />
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Readiness
          </div>
          <div className="font-display text-lg font-bold tabular-nums text-teal">
            {workspace.readiness}%
          </div>
        </div>
      </div>
    </motion.div>
  );
}
