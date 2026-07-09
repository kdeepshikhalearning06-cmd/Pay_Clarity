import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button, type buttonVariants } from "@/components/ui/button";
import { addUploadedFile } from "@/lib/demo-store";
import { toast } from "sonner";
import type { VariantProps } from "class-variance-authority";

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];

function guessCountry(name: string): { country: string; countryCode: string } {
  const s = name.toLowerCase();
  if (s.includes("german")) return { country: "Germany", countryCode: "DE" };
  if (s.includes("france") || s.includes("french")) return { country: "France", countryCode: "FR" };
  if (s.includes("netherland") || s.includes("dutch")) return { country: "Netherlands", countryCode: "NL" };
  if (s.includes("italy") || s.includes("italian")) return { country: "Italy", countryCode: "IT" };
  if (s.includes("spain") || s.includes("spanish")) return { country: "Spain", countryCode: "ES" };
  if (s.includes("poland") || s.includes("polish")) return { country: "Poland", countryCode: "PL" };
  return { country: "Unspecified", countryCode: "—" };
}

export function UploadButton({
  variant = "outline",
  size = "default",
  label = "Upload CSV",
  className,
  onUploaded,
}: {
  variant?: ButtonVariant;
  size?: VariantProps<typeof buttonVariants>["size"];
  label?: string;
  className?: string;
  onUploaded?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setProgress(0);
    // simulated progress
    for (let p = 15; p <= 100; p += 17) {
      await new Promise((r) => setTimeout(r, 90));
      setProgress(Math.min(100, p));
    }
    const meta = guessCountry(file.name);
    addUploadedFile({
      name: file.name,
      ...meta,
      employees: Math.floor(200 + Math.random() * 1400),
      sizeKB: Math.max(4, Math.round(file.size / 1024)),
      validation: "Processing",
      processing: "Queued",
      source: "upload",
    });
    setProgress(null);
    toast.success("Payroll snapshot uploaded", {
      description: "Validation and analysis will begin in the next workflow step.",
    });
    onUploaded?.();
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => inputRef.current?.click()}
        disabled={progress !== null}
      >
        {progress !== null ? (
          <>
            <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Uploading {progress}%
          </>
        ) : (
          <>
            <Upload className="mr-1 h-4 w-4" /> {label}
          </>
        )}
      </Button>
      <AnimatePresence>
        {progress !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed bottom-4 right-4 z-50 w-64 rounded-lg border border-border/60 bg-card p-3 shadow-[var(--shadow-card)]"
          >
            <div className="mb-2 text-xs font-medium">Uploading CSV…</div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-teal"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}