import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Activity, ShieldAlert, Bell, Globe2, FileBarChart,
  ScrollText, Settings, UserCircle, LogIn, Cpu, Radar
} from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/traffic", label: "Traffic Monitor", icon: Activity },
  { to: "/threats", label: "Threat Analysis", icon: ShieldAlert },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/map", label: "Attack Map", icon: Globe2 },
  { to: "/reports", label: "Reports", icon: FileBarChart },
  { to: "/logs", label: "Logs", icon: ScrollText },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/profile", label: "Profile", icon: UserCircle },
  { to: "/login", label: "Auth", icon: LogIn },
];

export function Sidebar() {
  const { location } = useRouterState();
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col glass-strong border-r border-[color:var(--cyber-cyan)]/15 relative z-10">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5">
        <div className="relative">
          <div className="absolute inset-0 rounded-lg bg-[color:var(--cyber-cyan)]/30 blur-md" />
          <div className="relative h-10 w-10 rounded-lg bg-gradient-to-br from-[color:var(--cyber-cyan)] to-[color:var(--cyber-purple)] flex items-center justify-center">
            <Radar className="h-5 w-5 text-black" />
          </div>
        </div>
        <div>
          <div className="font-bold tracking-widest text-sm gradient-text-cyan">SENTINEL</div>
          <div className="text-[10px] text-muted-foreground tracking-[0.2em]">AI · NIDS · v4.2</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                active
                  ? "bg-gradient-to-r from-[color:var(--cyber-cyan)]/15 to-transparent text-glow-cyan border border-[color:var(--cyber-cyan)]/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-[color:var(--cyber-cyan)] shadow-[0_0_12px_var(--cyber-cyan)]"
                />
              )}
              <Icon className="h-4 w-4" />
              <span className="font-medium tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="m-3 p-4 rounded-xl glass cyber-border">
        <div className="flex items-center gap-2 mb-2">
          <Cpu className="h-4 w-4 text-[color:var(--cyber-green)]" />
          <span className="text-xs tracking-widest text-glow-green">AI ENGINE</span>
        </div>
        <div className="text-[10px] text-muted-foreground mb-2">Neural model active</div>
        <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: "0%" }} animate={{ width: "94%" }} transition={{ duration: 1.5 }}
            className="h-full bg-gradient-to-r from-[color:var(--cyber-green)] to-[color:var(--cyber-cyan)]"
          />
        </div>
        <div className="mt-1 text-[10px] text-muted-foreground">Accuracy 94.2%</div>
      </div>
    </aside>
  );
}
