import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Shield, Clock, Activity, KeyRound, Edit, Monitor, Globe } from "lucide-react";

export const Route = createFileRoute("/_app/profile")({ component: Profile });

const activity = [
  { time: "14:32", act: "Acknowledged Critical alert #4821" },
  { time: "13:18", act: "Updated detection sensitivity to 8/10" },
  { time: "11:42", act: "Generated monthly compliance report" },
  { time: "10:08", act: "Blocked source IP 203.45.122.18" },
  { time: "09:14", act: "Logged in from Singapore (192.168.0.x)" },
];

const sessions = [
  { device: "MacBook Pro · Safari", loc: "Singapore, SG", ip: "203.116.92.41", time: "Active now", current: true },
  { device: "iPhone 15 · Sentinel App", loc: "Singapore, SG", ip: "203.116.92.41", time: "2h ago", current: false },
  { device: "Windows · Edge", loc: "Tokyo, JP", ip: "126.218.10.5", time: "Yesterday", current: false },
];

const perms = [
  { name: "View dashboards", on: true },
  { name: "Manage alerts", on: true },
  { name: "Modify detection rules", on: true },
  { name: "Export logs", on: true },
  { name: "User administration", on: true },
  { name: "Billing & subscription", on: false },
];

function Profile() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="lg:col-span-1 glass cyber-border rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[color:var(--cyber-purple)]/25 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-[color:var(--cyber-pink)]/20 blur-3xl" />
        <div className="relative text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[color:var(--cyber-cyan)] to-[color:var(--cyber-pink)] blur-lg opacity-60" />
            <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-[color:var(--cyber-purple)] to-[color:var(--cyber-pink)] flex items-center justify-center text-3xl font-bold">
              AX
            </div>
          </div>
          <h2 className="text-xl font-bold mt-3 gradient-text-cyan">Alex Chen</h2>
          <div className="text-xs text-muted-foreground">alex@sentinel.io</div>
          <div className="mt-3 inline-flex items-center gap-2 text-[10px] tracking-widest text-glow-cyan px-3 py-1 rounded-full border border-[color:var(--cyber-cyan)]/40">
            <Shield className="h-3 w-3" /> SOC ADMIN · LVL 9
          </div>
          <button className="w-full mt-5 py-2 rounded-lg glass border border-white/10 text-sm flex items-center justify-center gap-2 hover:glow-cyan">
            <Edit className="h-3.5 w-3.5" /> Edit profile
          </button>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          {[
            { l: "Alerts", v: "1,420", c: "cyan" },
            { l: "Reports", v: "184", c: "purple" },
            { l: "Hours", v: "612", c: "pink" },
          ].map(s => (
            <div key={s.l} className="glass rounded-lg p-3">
              <div className={`text-xl font-bold text-glow-${s.c}`}>{s.v}</div>
              <div className="text-[10px] tracking-widest text-muted-foreground">{s.l.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="lg:col-span-2 space-y-5">
        <div className="glass cyber-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-glow-cyan" />
            <h3 className="font-bold tracking-wider">RECENT ACTIVITY</h3>
          </div>
          <div className="space-y-3">
            {activity.map((a, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 text-sm">
                <span className="font-mono text-xs text-muted-foreground w-12">{a.time}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--cyber-cyan)] shadow-[0_0_6px_var(--cyber-cyan)]" />
                <span>{a.act}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="glass cyber-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-glow-purple" />
              <h3 className="font-bold tracking-wider">LOGIN HISTORY</h3>
            </div>
            <div className="space-y-3">
              {sessions.map((s, i) => (
                <div key={i} className="glass rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm">
                        <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
                        {s.device}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                        <Globe className="h-3 w-3" /> {s.loc} · <span className="font-mono">{s.ip}</span>
                      </div>
                    </div>
                    {s.current
                      ? <span className="text-[10px] tracking-widest text-glow-green px-2 py-0.5 rounded-full border border-[color:var(--cyber-green)]/40">LIVE</span>
                      : <span className="text-[10px] text-muted-foreground">{s.time}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass cyber-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <KeyRound className="h-4 w-4 text-glow-pink" />
              <h3 className="font-bold tracking-wider">ROLES & PERMISSIONS</h3>
            </div>
            <div className="space-y-2">
              {perms.map(p => (
                <div key={p.name} className="flex items-center justify-between text-sm py-1.5 border-b border-white/5 last:border-0">
                  <span>{p.name}</span>
                  <span className={p.on ? "text-glow-green text-xs" : "text-muted-foreground text-xs"}>
                    {p.on ? "ALLOWED" : "DENIED"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
