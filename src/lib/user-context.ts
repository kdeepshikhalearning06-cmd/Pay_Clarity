export type UserRole =
  | "Workspace Admin"
  | "HR Analyst"
  | "Reviewer"
  | "Legal Reviewer"
  | "Executive Viewer";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  department: string;
  role: UserRole;
  language: string;
  timezone: string;
  avatar: string;
}

export const CURRENT_USER: UserProfile = {
  id: "u1",
  name: "Anna Novak",
  email: "anna.novak@acme.de",
  jobTitle: "Head of People Operations",
  department: "Human Resources",
  role: "Workspace Admin",
  language: "English (UK)",
  timezone: "Europe/Berlin (CET)",
  avatar: "AN",
};

export const ROLE_PERMISSIONS: Record<UserRole, {
  canManageUsers: boolean;
  canManageSecurity: boolean;
  canManageIntegrations: boolean;
  canExportFull: boolean;
  canSubmitReport: boolean;
  canReview: boolean;
  canApprove: boolean;
  canEscalate: boolean;
  canViewAuditTrail: boolean;
  canEditSettings: boolean;
}> = {
  "Workspace Admin": {
    canManageUsers: true,
    canManageSecurity: true,
    canManageIntegrations: true,
    canExportFull: true,
    canSubmitReport: true,
    canReview: true,
    canApprove: true,
    canEscalate: true,
    canViewAuditTrail: true,
    canEditSettings: true,
  },
  "HR Analyst": {
    canManageUsers: false,
    canManageSecurity: false,
    canManageIntegrations: false,
    canExportFull: false,
    canSubmitReport: false,
    canReview: true,
    canApprove: true,
    canEscalate: false,
    canViewAuditTrail: true,
    canEditSettings: true,
  },
  Reviewer: {
    canManageUsers: false,
    canManageSecurity: false,
    canManageIntegrations: false,
    canExportFull: false,
    canSubmitReport: false,
    canReview: true,
    canApprove: true,
    canEscalate: true,
    canViewAuditTrail: false,
    canEditSettings: false,
  },
  "Legal Reviewer": {
    canManageUsers: false,
    canManageSecurity: false,
    canManageIntegrations: false,
    canExportFull: false,
    canSubmitReport: false,
    canReview: true,
    canApprove: true,
    canEscalate: true,
    canViewAuditTrail: true,
    canEditSettings: false,
  },
  "Executive Viewer": {
    canManageUsers: false,
    canManageSecurity: false,
    canManageIntegrations: false,
    canExportFull: false,
    canSubmitReport: false,
    canReview: false,
    canApprove: false,
    canEscalate: false,
    canViewAuditTrail: true,
    canEditSettings: false,
  },
};

export function hasPermission(
  role: UserRole,
  permission: keyof typeof ROLE_PERMISSIONS[UserRole],
): boolean {
  return ROLE_PERMISSIONS[role][permission];
}

export const ALL_ROLES: UserRole[] = [
  "Workspace Admin",
  "HR Analyst",
  "Reviewer",
  "Legal Reviewer",
  "Executive Viewer",
];

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  "Workspace Admin": "Full access including user management, security, and report submission",
  "HR Analyst": "Manage data, review explanations, and configure workspace settings",
  Reviewer: "Review and approve or escalate AI-generated explanations",
  "Legal Reviewer": "Review escalated items with audit trail access",
  "Executive Viewer": "Read-only access to dashboards and reports",
};
