import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, TriangleAlert as AlertTriangle, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CURRENT_USER, hasPermission } from "@/lib/user-context";
import { toast } from "sonner";

export type SensitiveAction =
  | "delete_workspace"
  | "export_full_salary"
  | "remove_admin_user";

const ACTION_CONFIG: Record<SensitiveAction, { title: string; description: string; warning: string }> = {
  delete_workspace: {
    title: "Delete workspace",
    description: "This will permanently delete all data, reports, and audit trails for this workspace. This action cannot be undone.",
    warning: "All employee data, compliance reports, and historical assessments will be permanently removed.",
  },
  export_full_salary: {
    title: "Export full salary data",
    description: "This will export all employee salary information including names, compensation, and demographic data.",
    warning: "The exported file will contain sensitive personal data. Ensure it is stored securely and shared only with authorized personnel.",
  },
  remove_admin_user: {
    title: "Remove admin user",
    description: "This will revoke admin access for the selected user and reassign their pending reviews.",
    warning: "The user will lose all workspace access immediately. Pending reviews will be reassigned to you.",
  },
};

export function useSecurityConfirmation() {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<SensitiveAction | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const requestConfirmation = (act: SensitiveAction) => {
    setAction(act);
    setPassword("");
    setError(null);
    setOpen(true);
  };

  const handleConfirm = () => {
    if (!password.trim()) {
      setError("Please enter your password to confirm.");
      return;
    }
    if (password.length < 4) {
      setError("Password is too short.");
      return;
    }
    setOpen(false);
    const config = action ? ACTION_CONFIG[action] : null;
    toast.success(`${config?.title ?? "Action"} confirmed and executed.`);
    setPassword("");
    setAction(null);
  };

  const handleCancel = () => {
    setOpen(false);
    setPassword("");
    setError(null);
    setAction(null);
  };

  const dialog = (
    <Dialog open={open} onOpenChange={(o) => !o && handleCancel()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-destructive/10 text-destructive">
              <Lock className="h-4 w-4" />
            </div>
            {action ? ACTION_CONFIG[action].title : "Confirm action"}
          </DialogTitle>
          <DialogDescription>
            {action ? ACTION_CONFIG[action].description : ""}
          </DialogDescription>
        </DialogHeader>

        {action && (
          <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <p className="text-xs text-muted-foreground">
              {ACTION_CONFIG[action].warning}
            </p>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="confirm-password">Enter your password to confirm</Label>
          <Input
            id="confirm-password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            placeholder="Your account password"
            onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Confirm & execute
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { requestConfirmation, dialog };
}

export function AccessRestricted({ message }: { message?: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-10 text-center shadow-[var(--shadow-card)]">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-muted/40">
        <Lock className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold">Access restricted</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        {message ??
          "Your role does not have permission to access this section. Contact your workspace admin if you need access."}
      </p>
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Eye className="h-3.5 w-3.5" />
        Current role: <span className="font-medium text-foreground">{CURRENT_USER.role}</span>
      </div>
    </div>
  );
}

export function useCanAccess() {
  return {
    canManageUsers: hasPermission(CURRENT_USER.role, "canManageUsers"),
    canManageSecurity: hasPermission(CURRENT_USER.role, "canManageSecurity"),
    canManageIntegrations: hasPermission(CURRENT_USER.role, "canManageIntegrations"),
    canExportFull: hasPermission(CURRENT_USER.role, "canExportFull"),
    canSubmitReport: hasPermission(CURRENT_USER.role, "canSubmitReport"),
  };
}
