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

  if (error) {
    console.error("Failed to fetch profile:", error);
    return null;
  }

  if (!data) {
    // Profile doesn't exist yet — create one for this new user
    const { data: created, error: createError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        email: fallbackEmail,
        name: fallbackEmail.split("@")[0],
        avatar: initialsFromEmail(fallbackEmail),
      })
      .select()
      .maybeSingle();

    if (createError || !created) {
      console.error("Failed to create profile:", createError);
      return null;
    }

    return {
      id: created.id,
      name: created.name ?? fallbackEmail,
      email: created.email ?? fallbackEmail,
      jobTitle: created.job_title ?? "",
      department: created.department ?? "",
      role: (created.role ?? "HR Analyst") as UserRole,
      language: created.language ?? "English (UK)",
      timezone: created.timezone ?? "Europe/Berlin (CET)",
      avatar: created.avatar ?? initialsFromEmail(created.email ?? fallbackEmail),
      workspace_id: created.workspace_id ?? undefined,
    };
  }

  return {
    id: data.id,
    name: data.name ?? fallbackEmail,
    email: data.email ?? fallbackEmail,
    jobTitle: data.job_title ?? "",
    department: data.department ?? "",
    role: (data.role ?? "HR Analyst") as UserRole,
    language: data.language ?? "English (UK)",
    timezone: data.timezone ?? "Europe/Berlin (CET)",
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

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setLoading(true);
      (async () => {
        await loadProfile(newSession);
        setLoading(false);
      })();
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
