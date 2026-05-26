import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { StatCard } from "@/components/cyber/StatCard";
import {
  Shield, AlertTriangle, Network, Activity, Cpu, MemoryStick, Wifi, Zap, Eye, Brain
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line, BarChart, Bar
} from "recharts";
import { WorldAttackMap } from "@/components/cyber/WorldAttackMap";
import { LiveAlertsFeed } from "@/components/cyber/LiveAlertsFeed";

export const Route = createFileRoute("/_app/")({ component: Dashboard });

const traffic = Array.from({ length: 24 }, (_, i) => ({
  t: `${i}:00`,
  in: Math.round(200 + Math.sin(i / 2) * 80 + Math.random() * 60),
  out: Math.round(150 + Math.cos(i / 2) * 60 + Math.random() * 40),
  threats: Math.round(Math.random() * 30 + (i > 18 ? 40 : 5)),
}));

const attackDist = [
  { name: "DDoS", value: 432, color: "var(--cyber-pink)" },
  { name: "Brute Force", value: 281, color: "var(--cyber-purple)" },
  { name: "SQL Injection", value: 156, color: "var(--cyber-cyan)" },
  { name: "Malware", value: 198, color: "var(--cyber-red)" },
  { name: "Phishing", value: 92, color: "var(--cyber-amber)" },
];

const logs = [
  { time: "14:32:08", src: "203.45.122.18", dst: "10.0.2.14", type: "DDoS", sev: "Critical" },
  { time: "14:31:54", src: "91.218.7.42", dst: "10.0.1.5", type: "Brute Force", sev: "High" },
  { time: "14:31:21", src: "158.69.124.9", dst: "10.0.3.22", type: "Port Scan", sev: "Medium" },
  { time: "14:30:47", src: "45.95.169.203", dst: "10.0.2.11", type: "SQL Injection", sev: "Critical" },
  { time: "14:30:12", src: "172.111.0.34", dst: "10.0.4.7", type: "Malware C2", sev: "High" },
  { time: "14:29:33", src: "88.214.26.110", dst: "10.0.1.18", type: "Anomaly", sev: "Low" },
];

const sevColor: Record<string, string> = {
  Critical: "text-glow-red border-[color:var(--cyber-red)]/40 bg-[color:var(--cyber-red)]/10",
  High: "text-glow-pink border-[color:var(--cyber-pink)]/40 bg-[color:var(--cyber-pink)]/10",
  Medium: "text-glow-purple border-[color:var(--cyber-purple)]/40 bg-[color:var(--cyber-purple)]/10",
  Low: "text-glow-cyan border-[color:var(--cyber-cyan)]/40 bg-[color:var(--cyber-cyan)]/10",
};

function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Attacks Detected" value="12,847" sub="+18% vs yesterday" icon={<AlertTriangle className="h-5 w-5 text-[color:var(--cyber-pink)]" />} accent="pink" delay={0} />
        <StatCard label="Threats Blocked" value="12,503" sub="97.3% block rate" icon={<Shield className="h-5 w-5 text-[color:var(--cyber-green)]" />} accent="green" delay={0.05} />
        <StatCard label="Active Connections" value="3,412" sub="Live sessions" icon={<Network className="h-5 w-5 text-[color:var(--cyber-cyan)]" />} accent="cyan" delay={0.1} />
        <StatCard label="AI Risk Score" value="74/100" sub="Elevated" icon={<Brain className="h-5 w-5 text-[color:var(--cyber-purple)]" />} accent="purple" delay={0.15} />
      </div>

      {/* AI Risk meter + system health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RiskMeter />
        <SystemMetric label="CPU Load" value={62} icon={<Cpu className="h-4 w-4" />} accent="cyan" />
        <SystemMetric label="Memory" value={48} icon={<MemoryStick className="h-4 w-4" />} accent="purple" />
      </div>

      {/* Traffic chart + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 glass cyber-border rounded-xl p-5 scanline">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold tracking-wider">NETWORK TRAFFIC · 24H</h3>
              <p className="text-xs text-muted-foreground">Mbps inbound / outbound with threat overlay</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <Legend color="var(--cyber-cyan)" label="Inbound" />
              <Legend color="var(--cyber-purple)" label="Outbound" />
              <Legend color="var(--cyber-pink)" label="Threats" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={traffic}>
              <defs>
                <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--cyber-cyan)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="var(--cyber-cyan)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--cyber-purple)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--cyber-purple)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
              <XAxis dataKey="t" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
              <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "oklch(0.16 0.04 270 / 0.95)", border: "1px solid var(--cyber-cyan)", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="in" stroke="var(--cyber-cyan)" fill="url(#g1)" strokeWidth={2} />
              <Area type="monotone" dataKey="out" stroke="var(--cyber-purple)" fill="url(#g2)" strokeWidth={2} />
              <Line type="monotone" dataKey="threats" stroke="var(--cyber-pink)" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass cyber-border rounded-xl p-5">
          <h3 className="font-bold tracking-wider mb-1">ATTACK DISTRIBUTION</h3>
          <p className="text-xs text-muted-foreground mb-4">Last 24 hours</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={attackDist} dataKey="value" innerRadius={50} outerRadius={85} paddingAngle={4} stroke="none">
                {attackDist.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "oklch(0.16 0.04 270 / 0.95)", border: "1px solid var(--cyber-cyan)", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {attackDist.map(a => (
              <div key={a.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: a.color, boxShadow: `0 0 8px ${a.color}` }} />
                  <span className="text-muted-foreground">{a.name}</span>
                </div>
                <span className="font-mono">{a.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Map + Live alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><WorldAttackMap /></div>
        <LiveAlertsFeed />
      </div>

      {/* Logs */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="glass cyber-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold tracking-wider">RECENT INTRUSION LOG</h3>
            <p className="text-xs text-muted-foreground">Live streaming events</p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-[color:var(--cyber-green)]/10 text-glow-green border border-[color:var(--cyber-green)]/30 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--cyber-green)] pulse-glow" /> LIVE
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-widest text-muted-foreground">
              <tr className="text-left border-b border-white/5">
                <th className="py-2 font-medium">Time</th>
                <th className="font-medium">Source IP</th>
                <th className="font-medium">Target</th>
                <th className="font-medium">Type</th>
                <th className="font-medium">Severity</th>
                <th className="font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-3 font-mono text-xs text-muted-foreground">{l.time}</td>
                  <td className="font-mono text-xs">{l.src}</td>
                  <td className="font-mono text-xs text-muted-foreground">{l.dst}</td>
                  <td className="text-xs">{l.type}</td>
                  <td>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border tracking-wider ${sevColor[l.sev]}`}>{l.sev}</span>
                  </td>
                  <td className="text-right text-xs text-glow-green">BLOCKED</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <span className="h-2 w-2 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
      {label}
    </div>
  );
}

function RiskMeter() {
  const score = 74;
  const r = 60, c = 2 * Math.PI * r;
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="glass cyber-border rounded-xl p-5 flex items-center gap-5 relative overflow-hidden">
      <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-[color:var(--cyber-pink)]/15 blur-3xl" />
      <div className="relative">
        <svg width="150" height="150" viewBox="0 0 150 150">
          <circle cx="75" cy="75" r={r} stroke="oklch(1 0 0 / 0.08)" strokeWidth="10" fill="none" />
          <motion.circle
            cx="75" cy="75" r={r} stroke="url(#grad)" strokeWidth="10" fill="none"
            strokeLinecap="round" strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c - (score / 100) * c }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            transform="rotate(-90 75 75)"
            style={{ filter: "drop-shadow(0 0 8px var(--cyber-pink))" }}
          />
          <defs>
            <linearGradient id="grad" x1="0" x2="1">
              <stop offset="0%" stopColor="var(--cyber-cyan)" />
              <stop offset="50%" stopColor="var(--cyber-purple)" />
              <stop offset="100%" stopColor="var(--cyber-pink)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold gradient-text">{score}</div>
          <div className="text-[10px] tracking-widest text-muted-foreground">RISK</div>
        </div>
      </div>
      <div className="flex-1">
        <div className="text-xs tracking-widest text-muted-foreground">AI THREAT INDEX</div>
        <div className="text-xl font-bold text-glow-pink mt-1">ELEVATED</div>
        <p className="text-xs text-muted-foreground mt-2">Neural model detects unusual traffic patterns originating from 3 ASNs. Recommend deeper inspection.</p>
        <div className="mt-3 flex items-center gap-2 text-xs">
          <Zap className="h-3.5 w-3.5 text-[color:var(--cyber-amber)]" />
          <span className="text-glow-cyan">Auto-mitigation enabled</span>
        </div>
      </div>
    </motion.div>
  );
}

function SystemMetric({ label, value, icon, accent }: { label: string; value: number; icon: React.ReactNode; accent: "cyan" | "purple" }) {
  const data = Array.from({ length: 20 }, (_, i) => ({ x: i, y: value + Math.sin(i) * 8 + Math.random() * 6 }));
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="glass cyber-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-xs tracking-widest text-muted-foreground">
          {icon}<span>{label}</span>
        </div>
        <Wifi className="h-3 w-3 text-[color:var(--cyber-green)]" />
      </div>
      <div className={`text-3xl font-bold text-glow-${accent}`}>{value}%</div>
      <ResponsiveContainer width="100%" height={60}>
        <LineChart data={data}>
          <Line type="monotone" dataKey="y" stroke={`var(--cyber-${accent})`} strokeWidth={2} dot={false}
            style={{ filter: `drop-shadow(0 0 4px var(--cyber-${accent}))` }} />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
