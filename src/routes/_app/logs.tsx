import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Search, Download, Filter, ScrollText, Shield, AlertCircle, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { useGlobalSearch } from "@/lib/globalSearch";
import { nidsApi, useLiveStream } from "@/lib/nidsApi";

export const Route = createFileRoute("/_app/logs")({ component: Logs });

const levels = ["INFO", "WARN", "ERROR", "AUDIT"] as const;
type Lvl = typeof levels[number];

const lvlStyle: Record<Lvl, string> = {
  INFO: "text-glow-cyan border-[color:var(--cyber-cyan)]/30",
  WARN: "text-glow-purple border-[color:var(--cyber-purple)]/30",
  ERROR: "text-glow-red border-[color:var(--cyber-red)]/30",
  AUDIT: "text-glow-green border-[color:var(--cyber-green)]/30",
};

const lines = [
  { t: "14:32:08.421", l: "ERROR" as Lvl, src: "ids.engine", m: "Signature match: ET-DDOS-UDP-AMP from 203.45.122.18" },
  { t: "14:32:08.118", l: "WARN" as Lvl, src: "ml.predictor", m: "Anomaly score 0.94 exceeds threshold (0.8) on flow 38f1" },
  { t: "14:32:07.902", l: "INFO" as Lvl, src: "net.capture", m: "Captured 12,840 packets on eth0 (window 1s)" },
  { t: "14:32:07.503", l: "AUDIT" as Lvl, src: "auth", m: "User alex.chen acknowledged alert #4821" },
  { t: "14:32:06.882", l: "ERROR" as Lvl, src: "fw.policy", m: "Auto-block applied to 91.218.7.42 (rule R-118)" },
  { t: "14:32:06.221", l: "INFO" as Lvl, src: "ml.predictor", m: "Model v4.2.1 inference 3.1ms · batch 128" },
  { t: "14:32:05.901", l: "WARN" as Lvl, src: "dns.monitor", m: "DGA-like resolution: zxq8s4.unknown.tld" },
  { t: "14:32:05.512", l: "INFO" as Lvl, src: "net.flow", m: "New flow tcp 10.0.2.14:443 ← 158.69.124.9:58821" },
  { t: "14:32:04.998", l: "AUDIT" as Lvl, src: "config", m: "Detection sensitivity changed: 7 → 8 by alex.chen" },
  { t: "14:32:04.117", l: "ERROR" as Lvl, src: "ids.engine", m: "Signature match: ET-SQLI-UNION on /api/users by 45.95.169.203" },
  { t: "14:32:03.880", l: "INFO" as Lvl, src: "system", m: "Memory 48% · CPU 62% · queue 12" },
  { t: "14:32:03.221", l: "WARN" as Lvl, src: "auth", m: "5 failed login attempts for admin@sentinel" },
];

function Logs() {
  const { events } = useLiveStream(60);
  const { query: gQ, setQuery: setGQ } = useGlobalSearch();
  const [localQ, setLocalQ] = useState("");
  const q = gQ || localQ;
  useEffect(() => { if (gQ) setLocalQ(gQ); }, [gQ]);
  const [lvl, setLvl] = useState<Lvl | "All">("All");
  const liveLines = events.map((e, i) => ({
    t: new Date(Date.now() - i * 1000).toISOString().slice(11, 23),
    l: (e.is_attack ? "ERROR" : "INFO") as Lvl,
    src: "ml.predictor",
    m: `${e.label} from ${e.src_ip} → port ${e.dst_port}${e.confidence != null ? ` (conf ${(e.confidence * 100).toFixed(1)}%)` : ""}`,
  }));
  const allLines = liveLines.length > 0 ? [...liveLines, ...lines] : lines;
  const filtered = allLines.filter(l => (lvl === "All" || l.l === lvl) && (q === "" || (l.m + l.src).toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Events / min", v: "8,420", c: "cyan", I: ScrollText },
          { l: "Audit entries", v: "1,204", c: "green", I: Shield },
          { l: "Errors", v: "47", c: "red", I: AlertCircle },
          { l: "Storage", v: "412 GB", c: "purple", I: Info },
        ].map(s => (
          <div key={s.l} className="glass cyber-border rounded-xl p-4 flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg bg-[color:var(--cyber-${s.c})]/15 flex items-center justify-center glow-${s.c}`}>
              <s.I className={`h-4 w-4 text-[color:var(--cyber-${s.c})]`} />
            </div>
            <div>
              <div className={`text-xl font-bold text-glow-${s.c}`}>{s.v}</div>
              <div className="text-[10px] tracking-widest text-muted-foreground">{s.l.toUpperCase()}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass cyber-border rounded-xl p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/30 flex-1 min-w-[200px]">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={e => { setLocalQ(e.target.value); setGQ(e.target.value); }} placeholder="grep logs…"
            className="bg-transparent outline-none text-sm w-full font-mono" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {(["All", ...levels] as const).map(s => (
            <button key={s} onClick={() => setLvl(s)}
              className={`text-xs px-3 py-1.5 rounded-full border font-mono ${lvl === s ? "border-[color:var(--cyber-cyan)] text-glow-cyan" : "border-white/10 text-muted-foreground hover:text-foreground"}`}>{s}</button>
          ))}
        </div>
        <a href={nidsApi.logsExportUrl()} target="_blank" rel="noreferrer"
          className="text-xs px-3 py-2 rounded-lg glass border border-[color:var(--cyber-cyan)]/30 hover:glow-cyan flex items-center gap-1.5">
          <Download className="h-3.5 w-3.5" /> Export
        </a>
      </div>

      <div className="glass cyber-border rounded-xl p-4 font-mono text-xs max-h-[600px] overflow-y-auto">
        {filtered.map((l, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
            className="flex gap-3 py-1.5 border-b border-white/[0.03] hover:bg-white/[0.02]">
            <span className="text-muted-foreground shrink-0 w-28">{l.t}</span>
            <span className={`shrink-0 w-14 text-center text-[10px] px-1.5 py-0.5 rounded border tracking-widest ${lvlStyle[l.l]}`}>{l.l}</span>
            <span className="shrink-0 w-28 text-glow-purple">{l.src}</span>
            <span className="text-foreground/90">{l.m}</span>
          </motion.div>
        ))}
      </div>

      <div className="glass cyber-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-4 w-4 text-glow-green" />
          <h3 className="font-bold tracking-wider">SECURE AUDIT TRAIL</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          All entries are cryptographically signed (Ed25519) and stored on append-only WORM media. Tamper detection runs continuously; last integrity verification 47s ago — <span className="text-glow-green">PASSED</span>.
        </p>
      </div>
    </div>
  );
}
