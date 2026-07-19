import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button, type buttonVariants } from "@/components/ui/button";
import { addUploadedFile } from "@/lib/demo-store";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Papa, { ParseResult } from "papaparse";
import type { VariantProps } from "class-variance-authority";

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];

function guessCountry(name: string): { country: string; countryCode: string } {
  const s = name.toLowerCase();

  if (s.includes("german")) return { country: "Germany", countryCode: "DE" };
  if (s.includes("france") || s.includes("french"))
    return { country: "France", countryCode: "FR" };
  if (s.includes("netherland") || s.includes("dutch"))
    return { country: "Netherlands", countryCode: "NL" };
  if (s.includes("italy") || s.includes("italian"))
    return { country: "Italy", countryCode: "IT" };
  if (s.includes("spain") || s.includes("spanish"))
    return { country: "Spain", countryCode: "ES" };
  if (s.includes("poland") || s.includes("polish"))
    return { country: "Poland", countryCode: "PL" };

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

    // Simulated upload progress
    for (let p = 15; p <= 100; p += 17) {
      await new Promise((r) => setTimeout(r, 90));
      setProgress(Math.min(100, p));
    }

    const meta = guessCountry(file.name);

    // Parse CSV
    const results = await new Promise<ParseResult<any>>((resolve) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: resolve,
      });
    });

    const employees = results.data;
    const requiredColumns = [
  "Employee ID",
  "Job Title",
  "Department",
  "Job Level",
  "Gender",
  "Base Salary (EUR)",
   ];

const csvColumns = Object.keys(employees[0] ?? {});

console.log("CSV Headers:", csvColumns);

const missingColumns = requiredColumns.filter(
  (column) => !csvColumns.includes(column)
);

if (missingColumns.length > 0) {
  setProgress(null);

  toast.warning(
  "Some optional columns are missing. Uploading with limited analysis."
);

  return;
}

    console.log("CSV Data:", employees);
    console.log("Employee Count:", employees.length);

    // Get logged-in user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setProgress(null);
      toast.error("Please log in first.");
      return;
    }

    // Save upload record
    const { data, error } = await supabase
      .from("salary_uploads")
      .insert([
        {
          user_id: user.id,
          file_name: file.name,
          country: meta.country,
          currency: "EUR",
          status: "Uploaded",
          employee_count: employees.length,
        },
      ])
      .select();

    if (error) {
      console.error(error);
      setProgress(null);
      toast.error("Upload failed");
      return;
    }

    console.log("Saved to Supabase:", data);

    const uploadId = data[0].id;
    localStorage.setItem("currentUploadId", uploadId);

console.log("Upload ID:", uploadId);

const employeeRecords = employees.map((employee: any) => ({
  upload_id: uploadId,
  employee_code: employee["Employee ID"],
  job_title: employee["Job Title"],
  department: employee["Department"],
  job_level: employee["Job Level"],
  gender: employee["Gender"],
  annual_base_salary: employee["Base Salary (EUR)"],
  bonus: employee["Variable Bonus (EUR)"],
  fte_percent: employee["FTE %"],
  hire_date: employee["Hire Date"],
  years_experience: employee["Total Years Experience"],

  // These should be present
  country: meta.country,
  country_code: meta.countryCode,
  currency: employee["Currency"],
  employment_type: employee["Employment Type"],

  certifications: null,
  management_responsibility: null,
  working_conditions: null,
}));

console.log("Employee Records:", employeeRecords);

const { error: employeeError } = await supabase
  .from("employee_records")
  .insert(employeeRecords);

if (employeeError) {
  console.error(employeeError);
  setProgress(null);

  toast.error("Failed to save employee records");
  return;
}

console.log("Employee records saved successfully.");

    // Demo UI
    addUploadedFile({
      name: file.name,
      ...meta,
      employees: employees.length,
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

    if (inputRef.current) {
      inputRef.current.value = "";
    }
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
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            Uploading {progress}%
          </>
        ) : (
          <>
            <Upload className="mr-1 h-4 w-4" />
            {label}
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
            <div className="mb-2 text-xs font-medium">
              Uploading CSV…
            </div>

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