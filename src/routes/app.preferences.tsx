import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Bell, Mail, CalendarClock, TriangleAlert as AlertTriangle, Users, FileText, Check, Globe, Clock, ArrowRight, CirclePlay as PlayCircle, Compass } from "lucide-react";
import { PageHeader } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
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
import { CURRENT_USER } from "@/lib/user-context";
import { startTour } from "@/lib/tour-store";
import { toast } from "sonner";

export const Route = createFileRoute("/app/preferences")({
  head: () => ({
    meta: [
      { title: "Preferences — PayClarity" },
      { name: "description", content: "Notification and localization preferences." },
    ],
  }),
  component: PreferencesPage,
});

function PreferencesPage() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [reviewAssignments, setReviewAssignments] = useState(true);
  const [thresholdAlerts, setThresholdAlerts] = useState(true);
  const [deadlineReminders, setDeadlineReminders] = useState(true);
  const [approvalEvents, setApprovalEvents] = useState(false);
  const [reportGeneration, setReportGeneration] = useState(true);
  const [teamEvents, setTeamEvents] = useState(false);
  const [language, setLanguage] = useState(CURRENT_USER.language);
  const [timezone, setTimezone] = useState(CURRENT_USER.timezone);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Preferences"
        description="Notification and localization preferences"
        actions={
          <Button variant="outline" asChild>
            <Link to="/app/profile">
              My profile <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        }
      />

      {/* Notification preferences */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Notification preferences</CardTitle>
          <CardDescription>Choose which events trigger notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ToggleRow
            icon={Mail}
            label="Email notifications"
            description="Receive all notifications via email"
            checked={emailNotif}
            onChange={setEmailNotif}
          />
          <div className="border-t border-border/60 pt-3">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Notification categories
            </div>
            <ToggleRow
              icon={Bell}
              label="Review assignments"
              description="When a new explanation is assigned to you"
              checked={reviewAssignments}
              onChange={setReviewAssignments}
            />
            <ToggleRow
              icon={AlertTriangle}
              label="Threshold alerts"
              description="When a pay gap exceeds the 5% joint assessment threshold"
              checked={thresholdAlerts}
              onChange={setThresholdAlerts}
            />
            <ToggleRow
              icon={CalendarClock}
              label="Deadline reminders"
              description="Before reporting deadlines are due"
              checked={deadlineReminders}
              onChange={setDeadlineReminders}
            />
            <ToggleRow
              icon={Check}
              label="Approval events"
              description="When explanations are approved, rejected, or escalated"
              checked={approvalEvents}
              onChange={setApprovalEvents}
            />
            <ToggleRow
              icon={FileText}
              label="Report generation"
              description="When compliance reports are generated or updated"
              checked={reportGeneration}
              onChange={setReportGeneration}
            />
            <ToggleRow
              icon={Users}
              label="Team events"
              description="When team members are invited or roles change"
              checked={teamEvents}
              onChange={setTeamEvents}
            />
          </div>
        </CardContent>
      </Card>

      {/* Localization */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Localization</CardTitle>
          <CardDescription>Language and timezone for your workspace</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="pref-language">
                <Globe className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />
                Language
              </Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="pref-language">
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
              <Label htmlFor="pref-timezone">
                <Clock className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />
                Timezone
              </Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="pref-timezone">
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
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product tour */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Product tour</CardTitle>
          <CardDescription>Restart the interactive walkthrough</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Interactive product tour</div>
                <div className="text-xs text-muted-foreground">
                  Walk through the 8 key features of PayClarity in under 2 minutes.
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                startTour();
                toast.success("Product tour started");
              }}
            >
              <PlayCircle className="mr-1 h-3.5 w-3.5" /> Restart tour
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="hero" onClick={() => toast.success("Preferences saved")}>
          <Check className="mr-1 h-4 w-4" /> Save preferences
        </Button>
      </div>
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
    <div className="flex items-center justify-between py-1">
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
