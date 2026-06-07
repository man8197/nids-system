import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Download, FileText, TrendingUp, Brain, Target } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from "recharts";
import { StatCard } from "@/components/cyber/StatCard";
import { nidsApi, useBackend } from "@/lib/nidsApi";
import { BackendBanner } from "@/components/cyber/BackendBanner";

export const Route = createFileRoute("/_app/reports")({ component: Reports });


const weekly = [
  { d: "Mon", det: 1240, blk: 1198 },
  { d: "Tue", det: 1580, blk: 1532 },
  { d: "Wed", det: 1102, blk: 1080 },
  { d: "Thu", det: 1820, blk: 1781 },
  { d: "Fri", det: 2104, blk: 2042 },
  { d: "Sat", det: 1410, blk: 1395 },
  { d: "Sun", det: 1280, blk: 1268 },
];

const ml = [
  { m: "W-1", acc: 91.2, prec: 88.5, rec: 86.4 },
  { m: "W-2", acc: 92.1, prec: 89.8, rec: 87.1 },
  { m: "W-3", acc: 93.4, prec: 91.2, rec: 89.6 },
  { m: "W-4", acc: 94.2, prec: 92.8, rec: 91.5 },
];

const reports = [
  { name: "Executive Summary — Sep 2025", type: "PDF", size: "2.4 MB", date: "Sep 14" },
  { name: "Weekly Threat Intelligence", type: "PDF", size: "1.8 MB", date: "Sep 12" },
  { name: "ML Model Performance Report", type: "CSV", size: "640 KB", date: "Sep 10" },
  { name: "Compliance Audit Q3", type: "PDF", size: "5.1 MB", date: "Sep 01" },
];

function Reports() {
  const { data: metrics } = useBackend(() => nidsApi.metrics(), []);
  const { data: stats } = useBackend(() => nidsApi.stats(), []);
  const rf = metrics?.random_forest;

  return (
    <div className="space-y-6">
      <BackendBanner />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Detection Accuracy" value={rf ? `${(rf.accuracy * 100).toFixed(2)}%` : "94.2%"} sub={rf ? `F1 ${rf.f1.toFixed(3)}` : "+2.8% w/w"} icon={<Target className="h-5 w-5 text-[color:var(--cyber-green)]" />} accent="green" />
        <StatCard label="Attack Records" value={stats ? stats.attack_records.toLocaleString() : "0.8%"} sub={stats ? `${stats.attack_percentage}% of total` : "−0.3% w/w"} icon={<TrendingUp className="h-5 w-5 text-[color:var(--cyber-cyan)]" />} accent="cyan" />
        <StatCard label="ML Inference" value={rf ? `${(rf.prediction_time_sec * 1000).toFixed(1)}ms` : "3.2ms"} sub="batch latency" icon={<Brain className="h-5 w-5 text-[color:var(--cyber-purple)]" />} accent="purple" />
        <StatCard label="Records Analyzed" value={stats ? stats.total_records.toLocaleString() : "142"} sub="CICIDS2017" icon={<FileText className="h-5 w-5 text-[color:var(--cyber-pink)]" />} accent="pink" />
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass cyber-border rounded-xl p-5">
          <h3 className="font-bold tracking-wider mb-1">WEEKLY DETECTION vs MITIGATION</h3>
          <p className="text-xs text-muted-foreground mb-4">Comparative attack analysis</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
              <XAxis dataKey="d" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "oklch(0.16 0.04 270 / 0.95)", border: "1px solid var(--cyber-cyan)", borderRadius: 8 }} />
              <Bar dataKey="det" fill="var(--cyber-pink)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="blk" fill="var(--cyber-cyan)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass cyber-border rounded-xl p-5">
          <h3 className="font-bold tracking-wider mb-1">ML MODEL PERFORMANCE</h3>
          <p className="text-xs text-muted-foreground mb-4">Accuracy · Precision · Recall</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={ml}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
              <XAxis dataKey="m" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
              <YAxis domain={[80, 100]} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "oklch(0.16 0.04 270 / 0.95)", border: "1px solid var(--cyber-cyan)", borderRadius: 8 }} />
              <Line type="monotone" dataKey="acc" stroke="var(--cyber-cyan)" strokeWidth={2} dot={{ fill: "var(--cyber-cyan)" }} />
              <Line type="monotone" dataKey="prec" stroke="var(--cyber-purple)" strokeWidth={2} dot={{ fill: "var(--cyber-purple)" }} />
              <Line type="monotone" dataKey="rec" stroke="var(--cyber-pink)" strokeWidth={2} dot={{ fill: "var(--cyber-pink)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass cyber-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h3 className="font-bold tracking-wider">AI-GENERATED REPORTS</h3>
            <p className="text-xs text-muted-foreground">Live exports from the ML backend</p>
          </div>
          <div className="flex gap-2">
            {(["csv", "excel", "pdf"] as const).map((f) => (
              <a key={f} href={nidsApi.reportUrl(f)} target="_blank" rel="noreferrer"
                className="text-xs px-4 py-2 rounded-lg bg-gradient-to-r from-[color:var(--cyber-cyan)] to-[color:var(--cyber-purple)] text-black font-bold flex items-center gap-1.5">
                <Download className="h-3.5 w-3.5" /> {f.toUpperCase()}
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {reports.map((r, i) => (
            <motion.div key={r.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass rounded-lg p-3 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-[color:var(--cyber-cyan)]/15 flex items-center justify-center glow-cyan">
                <FileText className="h-4 w-4 text-glow-cyan" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{r.name}</div>
                <div className="text-[11px] text-muted-foreground">{r.type} · {r.size} · {r.date}</div>
              </div>
              <button className="text-xs px-3 py-1.5 rounded-lg glass border border-[color:var(--cyber-cyan)]/30 hover:glow-cyan flex items-center gap-1.5">
                <Download className="h-3.5 w-3.5" /> Download
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
