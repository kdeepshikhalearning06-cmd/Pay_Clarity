import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  FileText,
  Users,
  Bot,
  History,
  Settings,
  Sparkles,
  Bell,
  Search,
  LogOut,
  ChevronRight,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useDemoMode, disableDemo } from "@/lib/demo-store";
import { toast } from "sonner";

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
      { to: "/app/reports", label: "Reports", icon: FileText },
      { to: "/app/data-sources", label: "Data sources", icon: Database },
      { to: "/app/employees", label: "Employees", icon: Users },
      { to: "/app/audit", label: "Audit trail", icon: History },
      { to: "/app/copilot", label: "AI Copilot", icon: Bot },
    ],
  },
];

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const crumbs = buildCrumbs(pathname);
  const [demo] = useDemoMode();

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
            <Button variant="ghost" size="icon" asChild>
              <Link to="/coming-soon" aria-label="Notifications"><Bell className="h-4 w-4" /></Link>
            </Button>
            <Link to="/app/settings" className="flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1 text-xs transition-colors hover:bg-muted">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[image:var(--gradient-teal)] text-[10px] font-semibold text-teal-foreground">AN</span>
              <span className="hidden sm:inline">Anna Novak</span>
            </Link>
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
    "/app/employees": "Employees",
    "/app/audit": "Audit trail",
    "/app/copilot": "AI Copilot",
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