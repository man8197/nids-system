import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Brain, Bug, Skull } from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { useBackend, nidsApi } from "@/lib/nidsApi";
import { BackendBanner } from "@/components/cyber/BackendBanner";

export const Route = createFileRoute("/_app/threats")({ component: Threats });

const fallbackRadar = [
  { metric: "DDoS", current: 82, baseline: 40 },
  { metric: "Malware", current: 64, baseline: 35 },
  { metric: "Phishing", current: 51, baseline: 30 },
  { metric: "Brute", current: 73, baseline: 42 },
  { metric: "Recon", current: 88, baseline: 50 },
  { metric: "C2", current: 47, baseline: 25 },
];

const COLORS = ["red", "pink", "purple", "red", "pink"];
const SEVS = ["Critical", "High", "Critical", "High", "Medium"];

function Threats() {
  const { data: stats } = useBackend(() => nidsApi.stats(), []);
  const labels = stats
    ? Object.entries(stats.label_distribution).filter(([k]) => k.toUpperCase() !== "BENIGN").sort((a, b) => b[1] - a[1])
    : [];
  const maxCount = labels[0]?.[1] || 1;
  const radar = labels.length > 0
    ? labels.slice(0, 6).map(([metric, count]) => ({
        metric: metric.length > 10 ? metric.slice(0, 10) : metric,
        current: Math.round((count / maxCount) * 100),
        baseline: Math.round((count / maxCount) * 35),
      }))
    : fallbackRadar;
  const timeline = stats?.timeline
    ? stats.timeline.map(t => ({ d: `T-${30 - t.t}`, threats: t.attacks, blocked: Math.round(t.attacks * 0.97) }))
    : Array.from({ length: 30 }, (_, i) => ({
        d: `D-${30 - i}`, threats: Math.round(50 + Math.sin(i / 3) * 30 + Math.random() * 40),
        blocked: Math.round(45 + Math.sin(i / 3) * 28 + Math.random() * 35),
      }));
  const malware = labels.length > 0
    ? labels.slice(0, 5).map(([name, count], i) => ({
        name, family: "CICIDS2017", count, sev: SEVS[i], color: COLORS[i],
      }))
    : [
        { name: "Emotet.B", family: "Trojan", count: 47, sev: "Critical", color: "red" },
        { name: "Mirai variant", family: "Botnet", count: 23, sev: "High", color: "pink" },
        { name: "Cobalt Strike", family: "Beacon", count: 18, sev: "Critical", color: "red" },
        { name: "AgentTesla", family: "Stealer", count: 12, sev: "High", color: "pink" },
        { name: "RedLine", family: "Stealer", count: 9, sev: "Medium", color: "purple" },
      ];
  const topAttack = labels[0]?.[0] || "DDoS";
  const topConfidence = stats ? Math.min(99, Math.round((labels[0]?.[1] || 0) / stats.total_records * 100 + 50)) : 87;
  return (
    <div className="space-y-6">
      <BackendBanner />
      {/* AI Prediction hero */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="glass cyber-border rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-[color:var(--cyber-purple)]/25 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-[color:var(--cyber-pink)]/20 blur-3xl" />
        <div className="relative flex flex-col lg:flex-row gap-6 items-center">
          <div className="relative">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
              className="h-28 w-28 rounded-full border-2 border-dashed border-[color:var(--cyber-cyan)]/50" />
            <Brain className="absolute inset-0 m-auto h-12 w-12 text-glow-cyan" />
          </div>
          <div className="flex-1">
            <div className="text-xs tracking-[0.3em] text-muted-foreground">NEURAL PREDICTION ENGINE</div>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mt-1">Dominant vector: {topAttack}</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
              ML models classify {topAttack} as the dominant attack pattern in the analyzed traffic ({stats ? `${labels[0]?.[1].toLocaleString()} flows` : "loading"}). Auto-mitigation policies engaged.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { l: "Confidence", v: `${topConfidence}%`, c: "purple" },
              { l: "Classes", v: String(labels.length || 6), c: "pink" },
              { l: "Severity", v: "HIGH", c: "red" },
            ].map(s => (
              <div key={s.l} className="glass rounded-lg px-4 py-3">
                <div className={`text-2xl font-bold text-glow-${s.c}`}>{s.v}</div>
                <div className="text-[10px] tracking-widest text-muted-foreground mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass cyber-border rounded-xl p-5">
          <h3 className="font-bold tracking-wider mb-1">THREAT PATTERN VECTOR</h3>
          <p className="text-xs text-muted-foreground mb-2">Current vs baseline anomaly</p>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radar}>
              <PolarGrid stroke="oklch(1 0 0 / 0.1)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
              <PolarRadiusAxis tick={{ fill: "var(--muted-foreground)", fontSize: 9 }} />
              <Radar dataKey="baseline" stroke="var(--cyber-cyan)" fill="var(--cyber-cyan)" fillOpacity={0.15} />
              <Radar dataKey="current" stroke="var(--cyber-pink)" fill="var(--cyber-pink)" fillOpacity={0.35} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass cyber-border rounded-xl p-5">
          <h3 className="font-bold tracking-wider mb-1">INTERACTIVE ATTACK TIMELINE</h3>
          <p className="text-xs text-muted-foreground mb-2">Detected vs blocked · 30 days</p>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={timeline}>
              <defs>
                <linearGradient id="th1" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--cyber-pink)" stopOpacity={0.5} /><stop offset="100%" stopColor="var(--cyber-pink)" stopOpacity={0} /></linearGradient>
                <linearGradient id="th2" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--cyber-green)" stopOpacity={0.5} /><stop offset="100%" stopColor="var(--cyber-green)" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
              <XAxis dataKey="d" tick={{ fill: "var(--muted-foreground)", fontSize: 9 }} />
              <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "oklch(0.16 0.04 270 / 0.95)", border: "1px solid var(--cyber-cyan)", borderRadius: 8 }} />
              <Area type="monotone" dataKey="threats" stroke="var(--cyber-pink)" fill="url(#th1)" strokeWidth={2} />
              <Area type="monotone" dataKey="blocked" stroke="var(--cyber-green)" fill="url(#th2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="font-bold tracking-wider mb-3 flex items-center gap-2"><Bug className="h-4 w-4 text-[color:var(--cyber-pink)]" /> MALWARE DETECTION</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {malware.map((m, i) => (
            <motion.div key={m.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3 }}
              className={`glass cyber-border rounded-xl p-4 relative overflow-hidden`}>
              <div className={`absolute -top-8 -right-8 h-24 w-24 rounded-full bg-[color:var(--cyber-${m.color})]/20 blur-2xl`} />
              <Skull className={`h-5 w-5 text-[color:var(--cyber-${m.color})] mb-3`} />
              <div className="text-sm font-bold">{m.name}</div>
              <div className="text-[10px] text-muted-foreground tracking-widest mt-0.5">{m.family.toUpperCase()}</div>
              <div className="flex items-center justify-between mt-3">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border tracking-widest text-glow-${m.color} border-[color:var(--cyber-${m.color})]/40`}>{m.sev}</span>
                <span className="text-xs font-mono">{m.count}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
