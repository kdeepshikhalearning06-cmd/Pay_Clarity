import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/auth/AuthContext";
import { useDemoMode } from "@/lib/demo-store";
import { COMPANY, COUNTRY_NAMES } from "@/lib/company-context";

export interface WorkspaceData {
  id: string;
  name: string;
  industry: string;
  companySize: string;
  country: string;
  countries: { code: string; name: string }[];
  currency: string;
  fiscalYear: string;
  assessmentName: string;
  assessmentStatus: string;
  readiness: number;
  employees: number;
  overallGap: number;
  medianGap: number;
  assessmentDate: string;
  reportsGenerated: number;
}

export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface WorkspaceContextValue {
  workspace: WorkspaceData | null;
  members: WorkspaceMember[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateWorkspace: (patch: Partial<WorkspaceData>) => Promise<boolean>;
  addMember: (email: string, role: string) => Promise<boolean>;
  updateMember: (id: string, patch: Partial<WorkspaceMember>) => Promise<boolean>;
  removeMember: (id: string) => Promise<boolean>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

function countryCode(name: string): string {
  const entry = Object.entries(COUNTRY_NAMES).find(([, n]) => n === name);
  return entry ? entry[0] : name.slice(0, 2).toUpperCase();
}

function mapWorkspaceRow(row: Record<string, unknown>): WorkspaceData {
  const countryNames = Array.isArray(row.countries)
    ? (row.countries as string[]).map((c) => ({
        code: countryCode(c),
        name: c,
      }))
    : [];
  return {
    id: row.id as string,
    name: row.name as string,
    industry: row.industry as string,
    companySize: row.company_size as string,
    country: row.country as string,
    countries: countryNames.length
      ? countryNames
      : [{ code: countryCode(row.country as string), name: row.country as string }],
    currency: row.currency as string,
    fiscalYear: row.fiscal_year as string,
    assessmentName:
      (row.assessment_name as string) ||
      `${row.fiscal_year as string} Pay Transparency Assessment`,
    assessmentStatus: row.assessment_status as string,
    readiness: row.readiness as number,
    employees: row.employees as number,
    overallGap: Number(row.overall_gap) || 0,
    medianGap: Number(row.median_gap) || 0,
    assessmentDate: (row.assessment_date as string) || "",
    reportsGenerated: row.reports_generated as number,
  };
}

function mapMemberRow(row: Record<string, unknown>): WorkspaceMember {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    role: row.role as string,
    status: row.status as string,
  };
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { currentUser, session } = useAuth();
  const [demo] = useDemoMode();
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWorkspace = useCallback(async () => {
    if (demo) {
      setWorkspace({
        id: "demo",
        name: COMPANY.name,
        industry: COMPANY.industry,
        companySize: COMPANY.companySize,
        country: COMPANY.country,
        countries: COMPANY.countries,
        currency: COMPANY.currency,
        fiscalYear: COMPANY.fiscalYear,
        assessmentName: COMPANY.assessmentName,
        assessmentStatus: COMPANY.assessmentStatus,
        readiness: COMPANY.readiness,
        employees: COMPANY.employees,
        overallGap: COMPANY.overallGap,
        medianGap: COMPANY.medianGap,
        assessmentDate: COMPANY.assessmentDate,
        reportsGenerated: COMPANY.reportsGenerated,
      });
      setMembers([
        { id: "t1", name: "Anna Novak", email: "anna.novak@acme.de", role: "Admin", status: "Active" },
        { id: "t2", name: "Marco Bianchi", email: "marco.bianchi@acme.de", role: "HR Manager", status: "Active" },
        { id: "t3", name: "Sophie Laurent", email: "sophie.laurent@acme.de", role: "Reviewer", status: "Active" },
        { id: "t4", name: "Lars Andersen", email: "lars.andersen@acme.de", role: "Reviewer", status: "Invited" },
      ]);
      setLoading(false);
      setError(null);
      return;
    }

    if (!session?.user || !currentUser?.workspace_id) {
      setWorkspace(null);
      setMembers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const [wsRes, membersRes] = await Promise.all([
      supabase
        .from("workspaces")
        .select("*")
        .eq("id", currentUser.workspace_id)
        .maybeSingle(),
      supabase
        .from("workspace_members")
        .select("*")
        .eq("workspace_id", currentUser.workspace_id)
        .order("created_at", { ascending: true }),
    ]);

    if (wsRes.error) {
      setError(wsRes.error.message);
    } else if (wsRes.data) {
      setWorkspace(mapWorkspaceRow(wsRes.data as Record<string, unknown>));
    } else {
      setWorkspace(null);
    }

    if (membersRes.error) {
      setError(membersRes.error.message);
    } else if (membersRes.data) {
      setMembers(
        (membersRes.data as Record<string, unknown>[]).map(mapMemberRow),
      );
    } else {
      setMembers([]);
    }

    setLoading(false);
  }, [demo, session?.user, currentUser?.workspace_id]);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  const updateWorkspace = useCallback(
    async (patch: Partial<WorkspaceData>): Promise<boolean> => {
      if (!workspace || demo) {
        if (demo) {
          setWorkspace((prev) => (prev ? { ...prev, ...patch } : prev));
          return true;
        }
        return false;
      }

      const update: Record<string, unknown> = {};
      if (patch.name !== undefined) update.name = patch.name;
      if (patch.industry !== undefined) update.industry = patch.industry;
      if (patch.companySize !== undefined) update.company_size = patch.companySize;
      if (patch.country !== undefined) update.country = patch.country;
      if (patch.countries !== undefined)
        update.countries = patch.countries.map((c) => c.name);
      if (patch.currency !== undefined) update.currency = patch.currency;
      if (patch.fiscalYear !== undefined) update.fiscal_year = patch.fiscalYear;
      if (patch.assessmentName !== undefined)
        update.assessment_name = patch.assessmentName;

      const { error: updateError } = await supabase
        .from("workspaces")
        .update(update)
        .eq("id", workspace.id);

      if (updateError) {
        setError(updateError.message);
        return false;
      }

      setWorkspace((prev) => (prev ? { ...prev, ...patch } : prev));
      return true;
    },
    [workspace, demo],
  );

  const addMember = useCallback(
    async (email: string, role: string): Promise<boolean> => {
      if (!workspace || demo) {
        if (demo) {
          const newMember: WorkspaceMember = {
            id: `t${Date.now()}`,
            name: email.split("@")[0],
            email,
            role,
            status: "Invited",
          };
          setMembers((prev) => [...prev, newMember]);
          return true;
        }
        return false;
      }

      const { data, error: insertError } = await supabase
        .from("workspace_members")
        .insert({
          workspace_id: workspace.id,
          email,
          name: email.split("@")[0],
          role,
          status: "Invited",
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return false;
      }

      if (data) {
        setMembers((prev) => [...prev, mapMemberRow(data as Record<string, unknown>)]);
      }
      return true;
    },
    [workspace, demo],
  );

  const updateMember = useCallback(
    async (id: string, patch: Partial<WorkspaceMember>): Promise<boolean> => {
      if (!workspace || demo) {
        if (demo) {
          setMembers((prev) =>
            prev.map((m) => (m.id === id ? { ...m, ...patch } : m)),
          );
          return true;
        }
        return false;
      }

      const update: Record<string, unknown> = {};
      if (patch.role !== undefined) update.role = patch.role;
      if (patch.status !== undefined) update.status = patch.status;

      const { error: updateError } = await supabase
        .from("workspace_members")
        .update(update)
        .eq("id", id)
        .eq("workspace_id", workspace.id);

      if (updateError) {
        setError(updateError.message);
        return false;
      }

      setMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      );
      return true;
    },
    [workspace, demo],
  );

  const removeMember = useCallback(
    async (id: string): Promise<boolean> => {
      if (!workspace || demo) {
        if (demo) {
          setMembers((prev) => prev.filter((m) => m.id !== id));
          return true;
        }
        return false;
      }

      const { error: deleteError } = await supabase
        .from("workspace_members")
        .delete()
        .eq("id", id)
        .eq("workspace_id", workspace.id);

      if (deleteError) {
        setError(deleteError.message);
        return false;
      }

      setMembers((prev) => prev.filter((m) => m.id !== id));
      return true;
    },
    [workspace, demo],
  );

  return (
    <WorkspaceContext.Provider
      value={{
        workspace,
        members,
        loading,
        error,
        refresh: loadWorkspace,
        updateWorkspace,
        addMember,
        updateMember,
        removeMember,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within a WorkspaceProvider");
  return ctx;
}
