import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  User,
  Mail,
  Briefcase,
  Building2,
  Globe,
  Clock,
  Shield,
  ArrowRight,
  Check,
} from "lucide-react";
import { PageHeader } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ROLE_DESCRIPTIONS, ALL_ROLES, type UserRole } from "@/lib/user-context";
import { useAuth } from "@/auth/AuthContext";
import { useDemoMode } from "@/lib/demo-store";
import { DEMO_USER } from "@/lib/user-context";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/app/profile")({
  head: () => ({
    meta: [
      { title: "My profile — PayClarity" },
      { name: "description", content: "Your personal profile and workspace preferences." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { currentUser, refreshProfile } = useAuth();
  const [demo] = useDemoMode();

  const profileUser = demo ? DEMO_USER : currentUser;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState<UserRole>("HR Analyst");
  const [language, setLanguage] = useState("English (UK)");
  const [timezone, setTimezone] = useState("Europe/Berlin (CET)");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profileUser) {
      setName(profileUser.name);
      setEmail(profileUser.email);
      setJobTitle(profileUser.jobTitle);
      setDepartment(profileUser.department);
      setRole(profileUser.role);
      setLanguage(profileUser.language);
      setTimezone(profileUser.timezone);
    }
  }, [profileUser]);

  const handleSave = async () => {
    if (demo) {
      toast.success("Profile updated");
      return;
    }

    if (!currentUser) return;

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        name,
        job_title: jobTitle,
        department,
        role,
        language,
        timezone,
      })
      .eq("id", currentUser.id);

    setSaving(false);

    if (error) {
      toast.error("Failed to save profile: " + error.message);
      return;
    }

    await refreshProfile();
    toast.success("Profile updated");
  };

  if (!profileUser) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader title="My profile" description="Loading…" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="My profile"
        description="Your personal information and workspace preferences"
        actions={
          <Button variant="outline" asChild>
            <Link to="/app/settings">
              Workspace settings <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        }
      />

      {/* Profile header card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)]"
      >
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[image:var(--gradient-teal)] text-xl font-semibold text-teal-foreground">
          {profileUser.avatar}
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold">{profileUser.name}</h2>
          <div className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
            <Briefcase className="h-3.5 w-3.5" />
            {profileUser.jobTitle || "—"}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="rounded-full bg-teal/10 px-2.5 py-0.5 text-[11px] font-medium text-teal">
              {profileUser.role}
            </span>
            <span className="text-xs text-muted-foreground">{profileUser.department || "—"}</span>
          </div>
        </div>
      </motion.div>

      {/* Personal information */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
          <CardDescription>Your name, role, and contact details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">
                <User className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />
                Full name
              </Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">
                <Mail className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />
                Email address
              </Label>
              <Input id="email" type="email" value={email} disabled onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="job-title">
                <Briefcase className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />
                Job title
              </Label>
              <Input id="job-title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="department">
                <Building2 className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />
                Department
              </Label>
              <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="role">
              <Shield className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />
              Role in Pay Transparency Process
            </Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[role]}</p>
          </div>
        </CardContent>
      </Card>

      {/* Localization */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Localization</CardTitle>
          <CardDescription>Language and timezone preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="language">
                <Globe className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />
                Language
              </Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English (UK)">English (UK)</SelectItem>
                  <SelectItem value="English (US)">English (US)</SelectItem>
                  <SelectItem value="Deutsch">Deutsch</SelectItem>
                  <SelectItem value="Nederlands">Nederlands</SelectItem>
                  <SelectItem value="Dansk">Dansk</SelectItem>
                  <SelectItem value="Svenska">Svenska</SelectItem>
                  <SelectItem value="Suomi">Suomi</SelectItem>
                  <SelectItem value="Francais">Francais</SelectItem>
                  <SelectItem value="Espanol">Espanol</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="timezone">
                <Clock className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />
                Timezone
              </Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Berlin (CET)">Europe/Berlin (CET)</SelectItem>
                  <SelectItem value="Europe/Amsterdam (CET)">Europe/Amsterdam (CET)</SelectItem>
                  <SelectItem value="Europe/Copenhagen (CET)">Europe/Copenhagen (CET)</SelectItem>
                  <SelectItem value="Europe/Stockholm (CET)">Europe/Stockholm (CET)</SelectItem>
                  <SelectItem value="Europe/Helsinki (EET)">Europe/Helsinki (EET)</SelectItem>
                  <SelectItem value="Europe/Paris (CET)">Europe/Paris (CET)</SelectItem>
                  <SelectItem value="Europe/Madrid (CET)">Europe/Madrid (CET)</SelectItem>
                  <SelectItem value="Europe/London (GMT)">Europe/London (GMT)</SelectItem>
                  <SelectItem value="America/New_York (EST)">America/New_York (EST)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="hero" onClick={handleSave} disabled={saving}>
          <Check className="mr-1 h-4 w-4" /> {saving ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </div>
  );
}
