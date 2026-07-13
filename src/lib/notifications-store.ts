import { useState, useCallback } from "react";

export type NotificationCategory =
  | "review_assignment"
  | "threshold_alert"
  | "deadline_reminder"
  | "approval_event"
  | "report_generation"
  | "team_event";

export type NotificationPriority = "high" | "medium" | "low";

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: NotificationPriority;
  actionTo?: string;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    category: "review_assignment",
    title: "New review assigned",
    message: "Engineering IC Level 2 has been assigned to you for human review.",
    timestamp: "2026-03-12T14:22:00Z",
    read: false,
    priority: "high",
    actionTo: "/app/human-review",
  },
  {
    id: "n2",
    category: "threshold_alert",
    title: "Threshold exceeded",
    message: "Marketing IC pay gap (10.1%) exceeds the 5% joint assessment threshold.",
    timestamp: "2026-03-12T11:30:00Z",
    read: false,
    priority: "high",
    actionTo: "/app/gap-analysis",
  },
  {
    id: "n3",
    category: "deadline_reminder",
    title: "Reporting deadline approaching",
    message: "Germany annual report submission is due in 84 days (June 2026).",
    timestamp: "2026-03-12T09:00:00Z",
    read: false,
    priority: "medium",
    actionTo: "/app/generate-report",
  },
  {
    id: "n4",
    category: "approval_event",
    title: "Explanation approved",
    message: "Product Management explanation was approved by Marco Bianchi.",
    timestamp: "2026-03-11T16:45:00Z",
    read: true,
    priority: "low",
  },
  {
    id: "n5",
    category: "report_generation",
    title: "Report generated",
    message: "FY2026 assessment report draft has been generated successfully.",
    timestamp: "2026-03-11T14:12:00Z",
    read: true,
    priority: "medium",
    actionTo: "/app/reports",
  },
  {
    id: "n6",
    category: "team_event",
    title: "Team member invited",
    message: "Lars Andersen was invited as Reviewer to the workspace.",
    timestamp: "2026-03-10T10:30:00Z",
    read: true,
    priority: "low",
  },
  {
    id: "n7",
    category: "threshold_alert",
    title: "Joint assessment required",
    message: "Sales Management (9.4%) requires joint pay assessment per Article 10.",
    timestamp: "2026-03-10T08:15:00Z",
    read: false,
    priority: "high",
    actionTo: "/app/human-review",
  },
  {
    id: "n8",
    category: "approval_event",
    title: "Explanation escalated",
    message: "Engineering Management was escalated for legal review.",
    timestamp: "2026-03-09T15:20:00Z",
    read: true,
    priority: "medium",
  },
];

let notifications: AppNotification[] = [...INITIAL_NOTIFICATIONS];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function useNotifications() {
  const [, setTick] = useState(0);
  const subscribe = useCallback(() => setTick((t) => t + 1), []);
  useState(() => {
    listeners.add(subscribe);
    return () => listeners.delete(subscribe);
  });

  const markRead = useCallback((id: string) => {
    notifications = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n,
    );
    emit();
  }, []);

  const markAllRead = useCallback(() => {
    notifications = notifications.map((n) => ({ ...n, read: true }));
    emit();
  }, []);

  const markUnread = useCallback((id: string) => {
    notifications = notifications.map((n) =>
      n.id === id ? { ...n, read: false } : n,
    );
    emit();
  }, []);

  const removeNotification = useCallback((id: string) => {
    notifications = notifications.filter((n) => n.id !== id);
    emit();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    markUnread,
    removeNotification,
  };
}

export const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  review_assignment: "Review assignments",
  threshold_alert: "Threshold alerts",
  deadline_reminder: "Deadline reminders",
  approval_event: "Approval events",
  report_generation: "Report generation",
  team_event: "Team events",
};
