import { Link, useRouterState } from "@tanstack/react-router";
import { Shield, LayoutDashboard, Activity, Users, History, Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/monitor", label: "Monitor", icon: Activity },
  { to: "/contacts", label: "Contacts", icon: Users },
  { to: "/incidents", label: "Incidents", icon: History },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

export function AppHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-hero text-primary-foreground shadow-soft">
            <Shield className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">RapidResQ</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || pathname.startsWith(to + "/");
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t border-border/60 bg-warning/10 px-4 py-1.5 text-center text-xs text-warning-foreground/80 sm:px-6">
        Prototype · simulated detection &amp; alerts · not a real emergency service
      </div>
      <nav className="flex items-center justify-around border-t border-border/60 bg-background/90 px-2 py-1.5 md:hidden">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || pathname.startsWith(to + "/");
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-md py-1.5 text-[10px] font-medium",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
