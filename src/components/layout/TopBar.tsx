import { Bell, Search, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useGlobalSearch } from "@/lib/globalSearch";
import { useNavigate, useRouterState } from "@tanstack/react-router";

export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { query, setQuery } = useGlobalSearch();
  const navigate = useNavigate();
  const { location } = useRouterState();
  return (
    <header className="sticky top-0 z-20 glass-strong border-b border-[color:var(--cyber-cyan)]/15 px-6 py-4 flex items-center justify-between gap-4">
      <div>
        <h1 className="text-xl md:text-2xl font-bold gradient-text-cyan tracking-wider">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5 tracking-wide">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!["/alerts", "/logs", "/threats", "/map"].includes(location.pathname)) {
              navigate({ to: "/alerts" });
            }
          }}
          className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg glass w-72">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search threats, IPs, logs…"
            className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground" />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground">↵</kbd>
        </form>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg glass">
          <motion.span
            animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
            className="h-2 w-2 rounded-full bg-[color:var(--cyber-green)] shadow-[0_0_8px_var(--cyber-green)]"
          />
          <span className="text-xs tracking-widest text-glow-green">SECURE</span>
        </div>

        <button className="relative p-2 rounded-lg glass hover:glow-cyan transition-shadow">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[color:var(--cyber-pink)] shadow-[0_0_6px_var(--cyber-pink)]" />
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass cyber-border">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[color:var(--cyber-purple)] to-[color:var(--cyber-pink)] flex items-center justify-center text-xs font-bold">
            AX
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-semibold">Alex Chen</div>
            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Shield className="h-2.5 w-2.5" /> SOC Admin
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
