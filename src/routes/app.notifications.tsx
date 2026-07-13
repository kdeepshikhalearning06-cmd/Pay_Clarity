import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { Bell, CheckCheck, Trash2, ClipboardCheck, TriangleAlert as AlertTriangle, CalendarClock, CircleCheck as CheckCircle2, FileText, Users, ListFilter as Filter, CircleAlert } from "lucide-react";
import { PageHeader } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useNotifications,
  CATEGORY_LABELS,
  type NotificationCategory,
  type AppNotification,
} from "@/lib/notifications-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { EmptyState } from "@/components/app/EmptyState";

export const Route = createFileRoute("/app/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — PayClarity" },
      { name: "description", content: "Review assignments, threshold alerts, deadlines, and team events." },
    ],
  }),
  component: NotificationsPage,
});

const CATEGORY_ICONS: Record<NotificationCategory, typeof Bell> = {
  review_assignment: ClipboardCheck,
  threshold_alert: AlertTriangle,
  deadline_reminder: CalendarClock,
  approval_event: CheckCircle2,
  report_generation: FileText,
  team_event: Users,
};

const CATEGORY_TONES: Record<NotificationCategory, string> = {
  review_assignment: "bg-teal/10 text-teal",
  threshold_alert: "bg-destructive/10 text-destructive",
  deadline_reminder: "bg-warning/10 text-warning",
  approval_event: "bg-success/10 text-success",
  report_generation: "bg-info/10 text-info",
  team_event: "bg-muted text-muted-foreground",
};

function NotificationsPage() {
  const { notifications, unreadCount, markRead, markAllRead, markUnread, removeNotification } =
    useNotifications();
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(
    () =>
      filter === "all"
        ? notifications
        : filter === "unread"
          ? notifications.filter((n) => !n.read)
          : notifications.filter((n) => n.category === filter),
    [notifications, filter],
  );

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Notifications"
        description="Review assignments, threshold alerts, deadlines, and team events"
        actions={
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={() => { markAllRead(); toast.success("All notifications marked as read"); }}>
                <CheckCheck className="mr-1 h-3.5 w-3.5" />
                Mark all read
              </Button>
            )}
          </div>
        }
      />

      {/* Unread summary */}
      {unreadCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center gap-2 rounded-xl border border-teal/30 bg-teal/5 p-3"
        >
          <Bell className="h-4 w-4 text-teal" />
          <span className="text-sm text-muted-foreground">
            You have <span className="font-medium text-foreground">{unreadCount} unread</span> notification{unreadCount > 1 ? "s" : ""}.
          </span>
        </motion.div>
      )}

      {/* Filter */}
      <div className="mb-4 flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="h-9 w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All notifications</SelectItem>
            <SelectItem value="unread">Unread only</SelectItem>
            {(Object.keys(CATEGORY_LABELS) as NotificationCategory[]).map((cat) => (
              <SelectItem key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto text-xs text-muted-foreground tabular-nums">
          {filtered.length} notification{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Notification list */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((n) => (
            <NotificationCard
              key={n.id}
              notification={n}
              onMarkRead={() => markRead(n.id)}
              onMarkUnread={() => markUnread(n.id)}
              onRemove={() => removeNotification(n.id)}
            />
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <EmptyState
            icon={Bell}
            title="No notifications"
            description="You're all caught up. Review assignments, threshold alerts, and deadline reminders will appear here."
          />
        )}
      </div>
    </div>
  );
}

function NotificationCard({
  notification,
  onMarkRead,
  onMarkUnread,
  onRemove,
}: {
  notification: AppNotification;
  onMarkRead: () => void;
  onMarkUnread: () => void;
  onRemove: () => void;
}) {
  const Icon = CATEGORY_ICONS[notification.category];
  const tone = CATEGORY_TONES[notification.category];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={cn(
        "flex items-start gap-3 rounded-xl border bg-card p-4 shadow-[var(--shadow-card)] transition-all",
        notification.read ? "border-border/60" : "border-teal/30 bg-teal/[0.02]",
      )}
    >
      <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", tone)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{notification.title}</span>
          {!notification.read && (
            <span className="h-2 w-2 shrink-0 rounded-full bg-teal" />
          )}
          {notification.priority === "high" && (
            <span className="flex items-center gap-0.5 rounded-full bg-destructive/10 px-1.5 py-0.5 text-[9px] font-medium text-destructive">
              <CircleAlert className="h-2.5 w-2.5" />
              High
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">{notification.message}</p>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-[11px] text-muted-foreground">
            {formatTimestamp(notification.timestamp)}
          </span>
          <span className="rounded-full bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">
            {CATEGORY_LABELS[notification.category]}
          </span>
          {notification.actionTo && (
            <Link
              to={notification.actionTo}
              className="text-[11px] font-medium text-teal hover:underline"
            >
              View →
            </Link>
          )}
        </div>
      </div>
      <div className="flex shrink-0 flex-col gap-1">
        {notification.read ? (
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onMarkUnread}>
            <Bell className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        ) : (
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onMarkRead}>
            <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        )}
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onRemove}>
          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </div>
    </motion.div>
  );
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const now = new Date("2026-03-12T15:00:00Z");
  const diffMs = now.getTime() - d.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  const diffD = Math.floor(diffH / 24);
  if (diffH < 1) return "Just now";
  if (diffH < 24) return `${diffH}h ago`;
  if (diffD < 7) return `${diffD}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
