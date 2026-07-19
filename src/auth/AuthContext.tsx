import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { UserProfile, UserRole } from "@/lib/user-context";

interface AuthContextValue {
  session: Session | null;
  currentUser: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function initialsFromEmail(email: string) {
  return email.slice(0, 2).toUpperCase();
}

async function fetchProfile(userId: string, fallbackEmail: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    console.error("Failed to fetch profile:", error);
    return null;
  } 
  
  if (!data) {
  console.warn("Profile not found");
  return null;
}
  return {
    id: data.id,
    name: data.name ?? fallbackEmail,
    email: data.email ?? fallbackEmail,
    jobTitle: data.job_title ?? "",
    department: data.department ?? "",
    role: (data.role ?? "HR Analyst") as UserRole,
    language: data.language ?? "English (UK)",
    timezone: "Europe/Berlin (CET)",
    avatar: data.avatar ?? initialsFromEmail(data.email ?? fallbackEmail),
    workspace_id: data.workspace_id ?? undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(sess: Session | null) {
    if (!sess?.user) {
      setCurrentUser(null);
      return;
    }
    const profile = await fetchProfile(sess.user.id, sess.user.email ?? "");
    setCurrentUser(profile);
  }

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      if (!mounted) return;
      setSession(initialSession);
      await loadProfile(initialSession);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setLoading(true);
      await loadProfile(newSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setCurrentUser(null);
  }

  async function refreshProfile() {
    await loadProfile(session);
  }

  return (
    <AuthContext.Provider value={{ session, currentUser, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}