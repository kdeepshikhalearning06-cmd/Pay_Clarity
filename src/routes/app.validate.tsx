import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck,
  TriangleAlert as AlertTriangle,
  CircleAlert as AlertCircle,
  DollarSign,
  Users,
  Copy,
  Building2,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Flag,
  CircleCheck as CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { PageHeader } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { WorkflowStrip } from "@/components/app/WorkflowStrip";
import { useDemoMode, useUploadedFiles } from "@/lib/demo-store";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/app/validate")({
  head: () => ({
    meta: [
      {
        title: "Validate data — PayClarity",
      },
      {
        name: "description",
        content:
          "Review data quality issues before AI processing begins.",
      },
    ],
  }),
  component: ValidatePage,
});


type CheckKey =
  | "missing_salary"
  | "missing_gender"
  | "duplicate_ids"
  | "invalid_currency"
  | "missing_department"
  | "invalid_title";


type ValidationCheck = {
  key: CheckKey;
  title: string;
  description: string;
  icon: typeof DollarSign;
  severity: "error" | "warning";
  count: number;
  sampleRows: string[];
};


type IssueStatus = "open" | "ignored" | "review";


// ===============================
// DEMO MODE VALIDATION
// ===============================

function buildChecks(
  demo: boolean,
  fileCount: number,
): ValidationCheck[] {

  if (!demo && fileCount === 0) return [];

  return [
    {
      key: "missing_salary",
      title: "Missing salary values",
      description:
        "Employees without a salary cannot be included in pay gap calculations.",
      icon: DollarSign,
      severity: "error",
      count: 14,
      sampleRows: [
        "DE-1042",
        "DE-1087",
        "NL-2014",
        "FR-3051",
        "DE-1129",
      ],
    },

    {
      key: "missing_gender",
      title: "Missing gender information",
      description:
        "Gender is required for gender pay gap analysis under the EU directive.",
      icon: Users,
      severity: "error",
      count: 23,
      sampleRows: [
        "FR-3018",
        "NL-2076",
        "IT-4033",
        "DE-1099",
        "FR-3024",
      ],
    },

    {
      key: "duplicate_ids",
      title: "Duplicate employee IDs",
      description:
        "Duplicate IDs may cause double-counting or data corruption.",
      icon: Copy,
      severity: "error",
      count: 3,
      sampleRows: [
        "DE-1102",
        "NL-2045",
        "FR-3077",
      ],
    },

    {
      key: "invalid_currency",
      title: "Invalid currency values",
      description:
        "Salaries with invalid currency codes.",
      icon: AlertCircle,
      severity: "warning",
      count: 8,
      sampleRows: [
        "DE-1067",
        "DE-1134",
        "IT-4019",
        "FR-3042",
        "NL-2088",
      ],
    },

    {
      key: "missing_department",
      title: "Missing departments",
      description:
        "Employees without department assignment cannot be grouped.",
      icon: Building2,
      severity: "warning",
      count: 19,
      sampleRows: [
        "DE-1055",
        "NL-2031",
        "FR-3068",
        "IT-4044",
        "DE-1078",
      ],
    },

    {
      key: "invalid_title",
      title: "Invalid job titles",
      description:
        "Blank job titles cannot be processed by AI grouping.",
      icon: Briefcase,
      severity: "warning",
      count: 11,
      sampleRows: [
        "DE-1091",
        "FR-3037",
        "NL-2058",
        "IT-4061",
        "DE-1115",
      ],
    },
  ];
}



// ===============================
// REAL MODE VALIDATION ENGINE
// ===============================

function validateEmployees(
  employees: any[],
): ValidationCheck[] {


  const missingSalary = employees.filter(
    (e) =>
      !e.annual_base_salary ||
      e.annual_base_salary <= 0,
  );


  const missingGender = employees.filter(
    (e) => !e.gender,
  );


  const missingDepartment = employees.filter(
    (e) => !e.department,
  );


  const missingTitle = employees.filter(
    (e) => !e.job_title,
  );


  const invalidCurrency = employees.filter(
    (e) => !e.currency,
  );


  const duplicateIds = employees
    .map((e) => e.employee_code)
    .filter(
      (id, index, arr) =>
        arr.indexOf(id) !== index,
    );


  return [
    {
      key: "missing_salary",
      title: "Missing salary values",
      description:
        "Employees without salary cannot be included in pay gap calculations.",
      icon: DollarSign,
      severity: "error",
      count: missingSalary.length,
      sampleRows: missingSalary
        .slice(0, 5)
        .map((e) => e.employee_code),
    },

    {
      key: "missing_gender",
      title: "Missing gender information",
      description:
        "Gender information is required for pay gap analysis.",
      icon: Users,
      severity: "error",
      count: missingGender.length,
      sampleRows: missingGender
        .slice(0, 5)
        .map((e) => e.employee_code),
    },

    {
      key: "duplicate_ids",
      title: "Duplicate employee IDs",
      description:
        "Duplicate IDs may cause data corruption.",
      icon: Copy,
      severity: "error",
      count: duplicateIds.length,
      sampleRows: duplicateIds.slice(0, 5),
    },

    {
      key: "invalid_currency",
      title: "Invalid currency values",
      description:
        "Missing currency information.",
      icon: AlertCircle,
      severity: "warning",
      count: invalidCurrency.length,
      sampleRows: invalidCurrency
        .slice(0, 5)
        .map((e) => e.employee_code),
    },

    {
      key: "missing_department",
      title: "Missing departments",
      description:
        "Employees need departments for comparison groups.",
      icon: Building2,
      severity: "warning",
      count: missingDepartment.length,
      sampleRows: missingDepartment
        .slice(0, 5)
        .map((e) => e.employee_code),
    },

    {
      key: "invalid_title",
      title: "Invalid job titles",
      description:
        "Job titles are required for AI grouping.",
      icon: Briefcase,
      severity: "warning",
      count: missingTitle.length,
      sampleRows: missingTitle
        .slice(0, 5)
        .map((e) => e.employee_code),
    },
  ];
}



// ===============================
// PAGE COMPONENT
// ===============================

function ValidatePage() {

  const [demo] = useDemoMode();
  const files = useUploadedFiles();

  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {

    if (demo) return;


    async function fetchEmployees() {

      setLoading(true);


      const { data, error } =
        await supabase
          .from("employee_records")
          .select("*");


      if (error) {
        console.error(
          "Employee fetch error:",
          error,
        );
        setLoading(false);
        return;
      }


      setEmployees(data || []);
      setLoading(false);
    }


    fetchEmployees();

  }, [demo]);



  const checks = useMemo(() => {

    if (demo) {
      return buildChecks(
        true,
        files.length,
      );
    }


    return validateEmployees(
      employees,
    );

  }, [
    demo,
    files.length,
    employees,
  ]);
    const totalRecords = demo
    ? 1428
    : employees.length;


  const errorCount = checks
    .filter((c) => c.severity === "error")
    .reduce(
      (sum, c) => sum + c.count,
      0,
    );


  const warningCount = checks
    .filter((c) => c.severity === "warning")
    .reduce(
      (sum, c) => sum + c.count,
      0,
    );


  const recordsWithIssues = Math.min(
    errorCount + warningCount,
    totalRecords,
  );


  const validRecords =
    totalRecords - recordsWithIssues;


  const validationScore =
    totalRecords === 0
      ? 0
      : Math.round(
          (validRecords / totalRecords) * 100,
        );



  const [issueStates, setIssueStates] =
    useState<Record<string, IssueStatus>>({});


  const [expandedKey, setExpandedKey] =
    useState<string | null>(null);



  const updateIssue = (
    key: string,
    status: IssueStatus,
  ) => {

    setIssueStates((prev) => ({
      ...prev,
      [key]: status,
    }));


    const labels: Record<
      IssueStatus,
      string
    > = {
      open: "restored as open",
      ignored: "ignored",
      review: "marked for review",
    };


    toast.success(
      `Issue ${labels[status]}`,
    );
  };



  const hasData =
    demo || employees.length > 0;



  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <PageHeader
          title="Validate data"
          description="Running data quality checks..."
        />

        <div className="mt-10 text-center text-muted-foreground">
          Loading employee records...
        </div>
      </div>
    );
  }



  if (!hasData) {
    return (
      <div className="mx-auto max-w-4xl">
        <PageHeader
          title="Validate data"
          description="Identify and resolve data quality issues before analysis begins"
        />

        <NoDataState />
      </div>
    );
  }



  return (
    <div className="mx-auto max-w-6xl">

      <PageHeader
        title="Validate data"
        description="Identify and resolve data quality issues before AI processing begins"
        actions={
          <Button
            variant="outline"
            asChild
          >
            <Link to="/app/data-sources">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Data sources
            </Link>
          </Button>
        }
      />


      <div className="mb-6">
        <WorkflowStrip current="validate" />
      </div>



      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {[
          {
            label: "Total records",
            value:
              totalRecords.toLocaleString(),
            icon: ShieldCheck,
            tone: "text-info",
          },

          {
            label: "Valid records",
            value:
              validRecords.toLocaleString(),
            icon: CheckCircle2,
            tone: "text-success",
          },

          {
            label: "Need attention",
            value:
              recordsWithIssues.toLocaleString(),
            icon: AlertTriangle,
            tone: "text-warning",
          },

          {
            label: "Validation score",
            value: `${validationScore}%`,
            icon: ShieldCheck,
            tone:
              validationScore >= 90
                ? "text-success"
                : validationScore >= 70
                  ? "text-warning"
                  : "text-destructive",
          },

        ].map((m, i) => (

          <motion.div
            key={m.label}
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: i * 0.05,
            }}
            className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]"
          >

            <div className="flex items-center justify-between">

              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                {m.label}
              </div>

              <m.icon
                className={cn(
                  "h-4 w-4",
                  m.tone,
                )}
              />

            </div>


            <div className="mt-3 font-display text-3xl font-semibold tabular-nums">
              {m.value}
            </div>

          </motion.div>

        ))}

      </div>



      <motion.div
        className="mb-6 rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]"
      >

        <div className="flex items-center justify-between">

          <div>
            <div className="font-display text-sm font-semibold">
              Data quality score
            </div>

            <div className="text-xs text-muted-foreground">
              Weighted by validation issues
            </div>

          </div>


          <div className="font-display text-2xl font-bold">
            {validationScore}%
          </div>

        </div>


        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">

          <div
            className="h-full rounded-full bg-primary"
            style={{
              width:
                `${validationScore}%`,
            }}
          />

        </div>


      </motion.div>




      <div className="grid gap-4 md:grid-cols-2">


        {checks.map((check) => {

          const status =
            issueStates[check.key] ?? "open";


          const isExpanded =
            expandedKey === check.key;



          return (

            <motion.div
              key={check.key}
              className={cn(
                "rounded-2xl border bg-card p-5 shadow-[var(--shadow-card)]",

                status === "ignored"
                  ? "opacity-60"
                  : ""
              )}
            >

              <div className="flex items-start gap-3">


                <div className="grid h-10 w-10 place-items-center rounded-xl bg-muted">

                  <check.icon className="h-5 w-5" />

                </div>



                <div className="flex-1">


                  <h3 className="font-display text-sm font-semibold">
                    {check.title}
                  </h3>


                  <p className="mt-1 text-xs text-muted-foreground">
                    {check.description}
                  </p>


                  <div className="mt-2 text-sm">
                    {check.count} affected rows
                  </div>


                </div>

              </div>



              <Button
                size="sm"
                variant="ghost"
                className="mt-3"
                onClick={() =>
                  setExpandedKey(
                    isExpanded
                      ? null
                      : check.key,
                  )
                }
              >

                {isExpanded
                  ? "Hide rows"
                  : "View rows"}

              </Button>



              {isExpanded && (

                <div className="mt-3 flex flex-wrap gap-2">

                  {check.sampleRows.map(
                    (row) => (

                      <span
                        key={row}
                        className="rounded-md border px-2 py-1 text-xs"
                      >
                        {row}
                      </span>

                    ),
                  )}

                </div>

              )}



              <div className="mt-3 flex gap-2">


                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    updateIssue(
                      check.key,
                      "ignored",
                    )
                  }
                >
                  <EyeOff className="mr-1 h-3 w-3" />
                  Ignore
                </Button>



                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    updateIssue(
                      check.key,
                      "review",
                    )
                  }
                >
                  <Flag className="mr-1 h-3 w-3" />
                  Review
                </Button>


              </div>


            </motion.div>

          );

        })}

      </div>




      <div className="mt-6 flex justify-between">

        <Button
          variant="outline"
          asChild
        >

          <Link to="/app/data-sources">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Link>

        </Button>



        <Button
          variant="hero"
          asChild
        >

          <Link to="/app/review">

            Continue to review

            <ArrowRight className="ml-1 h-4 w-4" />

          </Link>

        </Button>


      </div>


    </div>
  );
}




function NoDataState() {

  return (

    <motion.div
      className="rounded-3xl border bg-card p-10 text-center"
    >

      <ShieldCheck className="mx-auto h-8 w-8" />


      <h2 className="mt-5 text-2xl font-semibold">
        No data to validate yet
      </h2>


      <p className="mt-2 text-muted-foreground">
        Upload payroll data first.
      </p>


      <Button
        className="mt-5"
        asChild
      >

        <Link to="/app/data-sources">
          Go to data sources
        </Link>

      </Button>


    </motion.div>

  );
}