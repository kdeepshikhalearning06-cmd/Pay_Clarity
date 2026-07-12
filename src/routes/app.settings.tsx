import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Building2, ShieldCheck, Users, Lock, Bell, Mail, UserPlus, Trash2, KeyRound, MonitorSmartphone, History, TriangleAlert as AlertTriangle, Check } from "lucide-react";
import { PageHeader } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { cn } from "@/lib/utils";
import { COMPANY } from "@/lib/company-context";
import { SUPPORTED_COUNTRIES } from "@/lib/country-profiles";
import { toast } from "sonner";

export const Route = createFileRoute("/app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — PayClarity" },
      {
        name: "description",
        content:
          "Workspace preferences, team members, compliance settings, and security.",
      },
    ],
  }),
  component: SettingsPage,
});

type TabId = "company" | "compliance" | "team" | "security";

const TABS: { id: TabId; label: string; icon: typeof Building2 }[] = [
  { id: "company", label: "Company", icon: Building2 },
  { id: "compliance", label: "Compliance", icon: ShieldCheck },
  { id: "team", label: "Team", icon: Users },
  { id: "security", label: "Security", icon: Lock },
];

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "HR Manager" | "Reviewer" | "Viewer";
  status: "Active" | "Invited" | "Inactive";
};

const TEAM_MEMBERS: TeamMember[] = [
  { id: "t1", name: "Anna Novak", email: "anna.novak@acme.de", role: "Admin", status: "Active" },
  { id: "t2", name: "Marco Bianchi", email: "marco.bianchi@acme.de", role: "HR Manager", status: "Active" },
  { id: "t3", name: "Sophie Laurent", email: "sophie.laurent@acme.de", role: "Reviewer", status: "Active" },
  { id: "t4", name: "Lars Andersen", email: "lars.andersen@acme.de", role: "Reviewer", status: "Invited" },
];

const ROLE_PERMISSIONS: Record<TeamMember["role"], string[]> = {
  Admin: ["Full access", "Manage team", "Configure workspace", "Generate reports"],
  "HR Manager": ["Manage data", "Review explanations", "Generate reports", "View audit trail"],
  Reviewer: ["Review explanations", "Approve or reject", "Add notes"],
  Viewer: ["View dashboards", "View reports", "Read-only access"],
};

const LOGIN_HISTORY = [
  { device: "MacBook Pro — Chrome", location: "Berlin, DE", time: "2 hours ago", current: true },
  { device: "iPhone 15 — Safari", location: "Berlin, DE", time: "1 day ago", current: false },
  { device: "Windows PC — Edge", location: "Munich, DE", time: "3 days ago", current: false },
];

function SettingsPage() {
  const [tab, setTab] = useState<TabId>("company");
  const [companyName, setCompanyName] = useState(COMPANY.name);
  const [industry, setIndustry] = useState(COMPANY.industry);
  const [companySize, setCompanySize] = useState(COMPANY.companySize);
  const [country, setCountry] = useState(COMPANY.country);
  const [currency, setCurrency] = useState(COMPANY.currency);
  const [fiscalYear, setFiscalYear] = useState(COMPANY.fiscalYear);
  const [reportingYear, setReportingYear] = useState("FY2026");
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifDeadlines, setNotifDeadlines] = useState(true);
  const [notifAlerts, setNotifAlerts] = useState(true);
  const [notifWeekly, setNotifWeekly] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamMember["role"]>("Reviewer");
  const [members, setMembers] = useState<TeamMember[]>(TEAM_MEMBERS);

  const handleSaveCompany = () => {
    toast.success("Company settings saved");
  };

  const handleSaveCompliance = () => {
    toast.success("Compliance settings saved");
  };

  const handleInvite = () => {
    if (!inviteEmail.trim()) {
      toast("Enter an email address");
      return;
    }
    const newMember: TeamMember = {
      id: `t${Date.now()}`,
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: inviteRole,
      status: "Invited",
    };
    setMembers((prev) => [...prev, newMember]);
    setInviteEmail("");
    toast.success(`Invitation sent to ${newMember.email}`);
  };

  const handleRemoveMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    toast("Team member removed");
  };

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Settings"
        description="Workspace preferences, team members, compliance settings, and security"
      />

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-border/60 bg-card p-1 shadow-[var(--shadow-card)]">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              tab === t.id
                ? "bg-teal/10 text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <t.icon className={cn("h-4 w-4", tab === t.id && "text-teal")} />
            {t.label}
          </button>
        ))}
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {tab === "company" && (
          <Card>
            <CardHeader>
              <CardTitle>Company settings</CardTitle>
              <CardDescription>
                Your company information and reporting context
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="company-name">Company name</Label>
                <Input
                  id="company-name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger id="industry">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Consulting">Consulting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="company-size">Company size</Label>
                  <Select value={companySize} onValueChange={setCompanySize}>
                    <SelectTrigger id="company-size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50-100">50-100 employees</SelectItem>
                      <SelectItem value="100-250">100-250 employees</SelectItem>
                      <SelectItem value="250-500">250-500 employees</SelectItem>
                      <SelectItem value="500-1000">500-1000 employees</SelectItem>
                      <SelectItem value="1000+">1000+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="country">Country</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger id="country">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="SEK">SEK</SelectItem>
                      <SelectItem value="DKK">DKK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fiscal-year">Fiscal year</Label>
                  <Select value={fiscalYear} onValueChange={setFiscalYear}>
                    <SelectTrigger id="fiscal-year">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FY2024">FY2024</SelectItem>
                      <SelectItem value="FY2025">FY2025</SelectItem>
                      <SelectItem value="FY2026">FY2026</SelectItem>
                      <SelectItem value="FY2027">FY2027</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {country !== COMPANY.country && (
                <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  <p className="text-xs text-muted-foreground">
                    Changing country updates compliance rules for the entire
                    workspace. All reporting thresholds, filing deadlines, and
                    justification requirements will switch to {country}'s
                    regulations.
                  </p>
                </div>
              )}
              <div className="flex justify-end">
                <Button variant="hero" onClick={handleSaveCompany}>
                  <Check className="mr-1 h-4 w-4" /> Save changes
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {tab === "compliance" && (
          <Card>
            <CardHeader>
              <CardTitle>Compliance settings</CardTitle>
              <CardDescription>
                Reporting cycle and notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="reporting-year">Reporting year</Label>
                <Select value={reportingYear} onValueChange={setReportingYear}>
                  <SelectTrigger id="reporting-year">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FY2024">FY2024</SelectItem>
                    <SelectItem value="FY2025">FY2025</SelectItem>
                    <SelectItem value="FY2026">FY2026</SelectItem>
                    <SelectItem value="FY2027">FY2027</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3 rounded-lg border border-border/60 bg-background p-4">
                <div className="text-sm font-medium">Notification preferences</div>
                <ToggleRow
                  icon={Mail}
                  label="Email notifications"
                  description="Receive compliance updates via email"
                  checked={notifEmail}
                  onChange={setNotifEmail}
                />
                <ToggleRow
                  icon={Bell}
                  label="Deadline reminders"
                  description="Get reminded before reporting deadlines"
                  checked={notifDeadlines}
                  onChange={setNotifDeadlines}
                />
                <ToggleRow
                  icon={AlertTriangle}
                  label="Compliance alerts"
                  description="Alerts for joint assessment triggers and risk thresholds"
                  checked={notifAlerts}
                  onChange={setNotifAlerts}
                />
                <ToggleRow
                  icon={History}
                  label="Weekly summary"
                  description="Weekly digest of workflow progress and pending reviews"
                  checked={notifWeekly}
                  onChange={setNotifWeekly}
                />
              </div>
              <div className="flex justify-end">
                <Button variant="hero" onClick={handleSaveCompliance}>
                  <Check className="mr-1 h-4 w-4" /> Save settings
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {tab === "team" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Invite team member</CardTitle>
                <CardDescription>
                  Assign roles and permissions for workspace access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-end gap-2">
                  <div className="min-w-[200px] flex-1 space-y-1.5">
                    <Label htmlFor="invite-email">Email address</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="colleague@acme.de"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Role</Label>
                    <Select
                      value={inviteRole}
                      onValueChange={(v) => setInviteRole(v as TeamMember["role"])}
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="HR Manager">HR Manager</SelectItem>
                        <SelectItem value="Reviewer">Reviewer</SelectItem>
                        <SelectItem value="Viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="hero" onClick={handleInvite}>
                    <UserPlus className="mr-1 h-4 w-4" /> Invite
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team members</CardTitle>
                <CardDescription>
                  {members.length} members in this workspace
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 font-medium">Name</th>
                        <th className="px-3 py-2 font-medium">Role</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                        <th className="px-3 py-2 font-medium" />
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((m) => (
                        <tr
                          key={m.id}
                          className="border-t border-border/60 transition-colors hover:bg-muted/30"
                        >
                          <td className="px-3 py-3">
                            <div className="font-medium">{m.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {m.email}
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <Select
                              value={m.role}
                              onValueChange={(v) =>
                                setMembers((prev) =>
                                  prev.map((mem) =>
                                    mem.id === m.id
                                      ? { ...mem, role: v as TeamMember["role"] }
                                      : mem,
                                  ),
                                )
                              }
                            >
                              <SelectTrigger className="h-8 w-[130px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Admin">Admin</SelectItem>
                                <SelectItem value="HR Manager">HR Manager</SelectItem>
                                <SelectItem value="Reviewer">Reviewer</SelectItem>
                                <SelectItem value="Viewer">Viewer</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[11px] font-medium",
                                m.status === "Active"
                                  ? "bg-success/10 text-success"
                                  : m.status === "Invited"
                                    ? "bg-warning/10 text-warning"
                                    : "bg-muted text-muted-foreground",
                              )}
                            >
                              {m.status}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleRemoveMember(m.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Role permissions</CardTitle>
                <CardDescription>
                  What each role can do in the workspace
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(Object.entries(ROLE_PERMISSIONS) as [TeamMember["role"], string[]][]).map(
                    ([role, perms]) => (
                      <div
                        key={role}
                        className="rounded-lg border border-border/60 bg-background p-3"
                      >
                        <div className="text-sm font-medium">{role}</div>
                        <ul className="mt-2 space-y-1">
                          {perms.map((p) => (
                            <li
                              key={p}
                              className="flex items-center gap-1.5 text-xs text-muted-foreground"
                            >
                              <Check className="h-3 w-3 shrink-0 text-teal" />
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {tab === "security" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Change password</CardTitle>
                <CardDescription>
                  Update your account password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="current-pw">Current password</Label>
                  <Input id="current-pw" type="password" placeholder="••••••••" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="new-pw">New password</Label>
                    <Input id="new-pw" type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirm-pw">Confirm password</Label>
                    <Input id="confirm-pw" type="password" placeholder="••••••••" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="hero"
                    onClick={() => toast.success("Password updated")}
                  >
                    <KeyRound className="mr-1 h-4 w-4" /> Update password
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session management</CardTitle>
                <CardDescription>
                  Active sessions and login history
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {LOGIN_HISTORY.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-border/60 bg-background p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-lg bg-muted/40">
                        <MonitorSmartphone className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          {s.device}
                          {s.current && (
                            <span className="ml-2 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {s.location} · {s.time}
                        </div>
                      </div>
                    </div>
                    {!s.current && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toast("Session revoked")}
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: typeof Bell;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <div>
          <div className="text-sm font-medium">{label}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
