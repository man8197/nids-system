import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { AlertOctagon, ShieldAlert, Eye, Zap, Filter, Search, X } from "lucide-react";

export const Route = createFileRoute("/_app/alerts")({ component: Alerts });

type Sev = "Critical" | "High" | "Medium" | "Low";

const all = [
  { id: 1, sev: "Critical" as Sev, title: "DDoS amplification — 14k pps", src: "203.45.122.18", time: "14:32:08", desc: "Coordinated UDP amplification using DNS reflection from multiple ASNs.", color: "red" },
  { id: 2, sev: "High" as Sev, title: "SSH brute force burst", src: "91.218.7.42", time: "14:31:54", desc: "1,820 failed auth attempts in 90s targeting administrative accounts.", color: "pink" },
  { id: 3, sev: "Medium" as Sev, title: "Anomalous lateral movement", src: "10.0.2.18", time: "14:30:47", desc: "SMB enumeration patterns inconsistent with user behavior baseline.", color: "purple" },
  { id: 4, sev: "Critical" as Sev, title: "Ransomware signature match", src: "172.111.0.34", time: "14:30:12", desc: "File entropy + crypto API calls match LockBit 3.0 signature.", color: "red" },
  { id: 5, sev: "Low" as Sev, title: "Unusual DNS lookup", src: "88.214.26.110", time: "14:29:33", desc: "DGA-like domain resolution, no payload delivery observed.", color: "cyan" },
  { id: 6, sev: "High" as Sev, title: "SQL injection probe", src: "45.95.169.203", time: "14:28:11", desc: "UNION-based attempts against /api/users endpoint.", color: "pink" },
  { id: 7, sev: "Medium" as Sev, title: "Port scan from new ASN", src: "158.69.124.9", time: "14:27:02", desc: "Sequential scan across 4,000 ports on edge node.", color: "purple" },
];

const sevs: Sev[] = ["Critical", "High", "Medium", "Low"];
const icons: Record<Sev, any> = { Critical: AlertOctagon, High: ShieldAlert, Medium: Eye, Low: Zap };

function Alerts() {
  const [filter, setFilter] = useState<Sev | "All">("All");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<typeof all[number] | null>(null);
  const filtered = all.filter(a => (filter === "All" || a.sev === filter) && (q === "" || a.title.toLowerCase().includes(q.toLowerCase()) || a.src.includes(q)));

  const counts = sevs.map(s => ({ s, n: all.filter(a => a.sev === s).length }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {counts.map(({ s, n }) => {
          const colors: Record<Sev, string> = { Critical: "red", High: "pink", Medium: "purple", Low: "cyan" };
          const c = colors[s];
          return (
            <motion.button key={s} whileHover={{ y: -2 }} onClick={() => setFilter(filter === s ? "All" : s)}
              className={`glass cyber-border rounded-xl p-4 text-left relative overflow-hidden ${filter === s ? `glow-${c}` : ""}`}>
              <div className={`absolute -top-6 -right-6 h-20 w-20 rounded-full bg-[color:var(--cyber-${c})]/20 blur-2xl`} />
              <div className="text-[10px] tracking-widest text-muted-foreground">{s.toUpperCase()}</div>
              <div className={`text-3xl font-bold text-glow-${c} mt-1`}>{n}</div>
              <div className="text-xs text-muted-foreground mt-1">active alerts</div>
            </motion.button>
          );
        })}
      </div>

      <div className="glass cyber-border rounded-xl p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/30 flex-1 min-w-[200px]">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search title or source IP…"
            className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {(["All", ...sevs] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-full border ${filter === s ? "border-[color:var(--cyber-cyan)] text-glow-cyan" : "border-white/10 text-muted-foreground hover:text-foreground"}`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {filtered.map((a, i) => {
            const Icon = icons[a.sev];
            return (
              <motion.button
                key={a.id} layout
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setOpen(a)}
                className={`w-full glass cyber-border rounded-xl p-4 flex items-center gap-4 text-left hover:bg-white/[0.03]`}>
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center bg-[color:var(--cyber-${a.color})]/15 glow-${a.color}`}>
                  <Icon className={`h-5 w-5 text-[color:var(--cyber-${a.color})]`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border tracking-widest text-glow-${a.color} border-[color:var(--cyber-${a.color})]/40`}>{a.sev}</span>
                    <span className="text-sm font-medium truncate">{a.title}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1 font-mono">src: {a.src} · {a.time}</div>
                </div>
                <div className="text-xs text-muted-foreground">Details →</div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="glass-strong cyber-border rounded-2xl p-6 max-w-lg w-full relative">
              <button onClick={() => setOpen(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
              <div className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full border tracking-widest text-glow-${open.color} border-[color:var(--cyber-${open.color})]/40`}>{open.sev}</div>
              <h3 className="text-xl font-bold mt-2 gradient-text-cyan">{open.title}</h3>
              <p className="text-sm text-muted-foreground mt-3">{open.desc}</p>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="glass rounded-lg p-3"><div className="text-[10px] text-muted-foreground tracking-widest">SOURCE</div><div className="font-mono text-sm">{open.src}</div></div>
                <div className="glass rounded-lg p-3"><div className="text-[10px] text-muted-foreground tracking-widest">TIME</div><div className="font-mono text-sm">{open.time}</div></div>
              </div>
              <div className="mt-5 flex gap-2">
                <button className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[color:var(--cyber-cyan)] to-[color:var(--cyber-purple)] text-black font-bold text-sm">Block source</button>
                <button className="flex-1 py-2 rounded-lg glass border border-white/10 text-sm">Acknowledge</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
