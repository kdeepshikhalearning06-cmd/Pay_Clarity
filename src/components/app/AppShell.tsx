import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import { LayoutDashboard, FileText, Users, Bot, History, Settings, Sparkles, Bell, Search, LogOut, ChevronRight, Database, Scale, ChartBar as BarChart3, TrendingUp, Building2, User, Circle as HelpCircle, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useDemoMode, disableDemo } from "@/lib/demo-store";
import { CURRENT_USER } from "@/lib/user-context";
import { useNotifications } from "@/lib/notifications-store";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Workspace",
    items: [
      { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { to: "/app/company-profile", label: "Company profile", icon: Building2 },
      { to: "/app/executive", label: "Executive view", icon: BarChart3 },
      { to: "/app/reports", label: "Reports", icon: FileText },
      { to: "/app/data-sources", label: "Data sources", icon: Database },
      { to: "/app/employees", label: "Employees", icon: Users },
      { to: "/app/audit", label: "Audit trail", icon: History },
      { to: "/app/assessments", label: "Assessment history", icon: TrendingUp },
      { to: "/app/compliance", label: "Compliance library", icon: Scale },
      { to: "/app/copilot", label: "AI Copilot", icon: Bot },
    ],
  },
];

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const crumbs = buildCrumbs(pathname);
  const [demo] = useDemoMode();
  const { unreadCount } = useNotifications();

  return (
    <div className="flex min-h-screen bg-muted/20">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/60 bg-background lg:flex">
        <Link to="/" className="flex items-center gap-2 border-b border-border/60 px-5 py-4 font-display font-semibold">
          <span className="grid h-7 w-7 place-items-center rounded bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-glow)]">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          PayClarity
          {demo && (
            <span className="ml-auto rounded bg-teal/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-teal">
              Demo
            </span>
          )}
        </Link>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-4">
              <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {group.label}
              </div>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className={cn(
                          "group flex items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors",
                          active
                            ? "bg-teal/10 text-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <item.icon className={cn("h-4 w-4", active && "text-teal")} />
                        {item.label}
                        {active && (
                          <motion.span
                            layoutId="sidebar-active"
                            className="ml-auto h-1.5 w-1.5 rounded-full bg-teal"
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-border/60 p-3">
          <Link
            to="/app/settings"
            className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Settings className="h-4 w-4" /> Settings
          </Link>
          {demo ? (
            <button
              type="button"
              onClick={() => {
                disableDemo();
                toast("Exited demo mode — returned to your workspace");
              }}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" /> Exit demo
            </button>
          ) : (
            <Link
              to="/"
              className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </Link>
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur lg:px-6">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {crumbs.map((c, i) => (
              <span key={c.href} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />}
                {i === crumbs.length - 1 ? (
                  <span className="font-medium text-foreground">{c.label}</span>
                ) : (
                  <Link to={c.href} className="hover:text-foreground">{c.label}</Link>
                )}
              </span>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search employees, reports…"
                className="h-8 w-64 rounded-md border border-input bg-background pl-8 pr-3 text-xs outline-none focus:border-teal focus:ring-2 focus:ring-teal/30"
              />
            </div>
            <div className="relative">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/app/notifications" aria-label="Notifications">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </Button>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1 text-xs transition-colors hover:bg-muted">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-[image:var(--gradient-teal)] text-[10px] font-semibold text-teal-foreground">{CURRENT_USER.avatar}</span>
                  <span className="hidden sm:inline">{CURRENT_USER.name}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{CURRENT_USER.name}</span>
                    <span className="text-xs text-muted-foreground">{CURRENT_USER.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/app/profile">
                    <User className="mr-2 h-4 w-4" /> My profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/app/notifications">
                    <Bell className="mr-2 h-4 w-4" /> Notifications
                    {unreadCount > 0 && (
                      <span className="ml-auto rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">{unreadCount}</span>
                    )}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/app/preferences">
                    <Settings className="mr-2 h-4 w-4" /> Preferences
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/coming-soon">
                    <HelpCircle className="mr-2 h-4 w-4" /> Help center
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {demo ? (
                  <DropdownMenuItem onClick={() => { disableDemo(); toast("Exited demo mode — returned to your workspace"); }}>
                    <LogOut className="mr-2 h-4 w-4" /> Exit demo
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link to="/">
                      <LogOut className="mr-2 h-4 w-4" /> Sign out
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex-1 px-4 py-6 lg:px-8 lg:py-8"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}

function buildCrumbs(pathname: string) {
  const map: Record<string, string> = {
    "/app/reports": "Reports",
    "/app/reports/setup": "New report",
    "/app/data-sources": "Data sources",
    "/app/validate": "Validate data",
    "/app/review": "Review data",
    "/app/grouping": "AI grouping",
    "/app/gap-analysis": "Gap analysis",
    "/app/explanations": "AI explanations",
    "/app/human-review": "Human review",
    "/app/generate-report": "Generate report",
    "/app/employees": "Employees",
    "/app/audit": "Audit trail",
    "/app/assessments": "Assessment history",
    "/app/compliance": "Compliance library",
    "/app/compliance/$countryCode": "Country detail",
    "/app/copilot": "AI Copilot",
    "/app/executive": "Executive view",
    "/app/company-profile": "Company profile",
    "/app/profile": "My profile",
    "/app/notifications": "Notifications",
    "/app/preferences": "Preferences",
    "/app/settings": "Settings",
  };
  const crumbs = [{ href: "/app", label: "Workspace" }];
  if (pathname !== "/app" && map[pathname]) {
    crumbs.push({ href: pathname, label: map[pathname] });
  }
  return crumbs;
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}