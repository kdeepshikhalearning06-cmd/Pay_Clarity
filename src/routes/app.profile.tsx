import { useState } from "react";
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
import { CURRENT_USER, ROLE_DESCRIPTIONS, ALL_ROLES, type UserRole } from "@/lib/user-context";
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
  const [name, setName] = useState(CURRENT_USER.name);
  const [email, setEmail] = useState(CURRENT_USER.email);
  const [jobTitle, setJobTitle] = useState(CURRENT_USER.jobTitle);
  const [department, setDepartment] = useState(CURRENT_USER.department);
  const [role, setRole] = useState<UserRole>(CURRENT_USER.role);
  const [language, setLanguage] = useState(CURRENT_USER.language);
  const [timezone, setTimezone] = useState(CURRENT_USER.timezone);

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
          {CURRENT_USER.avatar}
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold">{CURRENT_USER.name}</h2>
          <div className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
            <Briefcase className="h-3.5 w-3.5" />
            {CURRENT_USER.jobTitle}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="rounded-full bg-teal/10 px-2.5 py-0.5 text-[11px] font-medium text-teal">
              {CURRENT_USER.role}
            </span>
            <span className="text-xs text-muted-foreground">{CURRENT_USER.department}</span>
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
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
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
        <Button variant="hero" onClick={() => toast.success("Profile updated")}>
          <Check className="mr-1 h-4 w-4" /> Save profile
        </Button>
      </div>
    </div>
  );
}
