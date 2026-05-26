import { createFileRoute } from "@tanstack/react-router";
import { WorldAttackMap } from "@/components/cyber/WorldAttackMap";
import { motion } from "framer-motion";
import { Globe2, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

export const Route = createFileRoute("/_app/map")({ component: MapPage });

const countries = [
  { name: "Russia", count: 4823, pct: 28, color: "red" },
  { name: "China", count: 3914, pct: 23, color: "pink" },
  { name: "USA", count: 2102, pct: 12, color: "cyan" },
  { name: "Brazil", count: 1640, pct: 10, color: "purple" },
  { name: "Iran", count: 1218, pct: 7, color: "red" },
  { name: "Netherlands", count: 945, pct: 6, color: "purple" },
  { name: "Germany", count: 720, pct: 4, color: "cyan" },
  { name: "India", count: 612, pct: 4, color: "green" },
];

function MapPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <WorldAttackMap />
          <div className="glass cyber-border rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Globe2 className="h-4 w-4 text-glow-cyan" />
              Holographic projection · WGS84 · real-time telemetry
            </div>
            <div className="flex items-center gap-2">
              {[ZoomIn, ZoomOut, Maximize2].map((Icon, i) => (
                <button key={i} className="p-2 rounded-lg glass hover:glow-cyan transition-shadow">
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass cyber-border rounded-xl p-5">
            <h3 className="font-bold tracking-wider mb-1">ATTACK HEAT ZONES</h3>
            <p className="text-xs text-muted-foreground mb-4">By country · last 24h</p>
            <div className="space-y-3">
              {countries.map((c, i) => (
                <motion.div key={c.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>{c.name}</span>
                    <span className="font-mono text-muted-foreground">{c.count.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${c.pct * 3}%` }}
                      transition={{ duration: 1, delay: i * 0.05 }}
                      className={`h-full bg-gradient-to-r from-[color:var(--cyber-${c.color})] to-[color:var(--cyber-purple)]`}
                      style={{ boxShadow: `0 0 8px var(--cyber-${c.color})` }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="glass cyber-border rounded-xl p-5">
            <h3 className="font-bold tracking-wider mb-3">LIVE COUNTERS</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { l: "Live attacks", v: "14,832", c: "pink" },
                { l: "Targets", v: "287", c: "cyan" },
                { l: "Origins", v: "3,914", c: "purple" },
                { l: "Mitigated", v: "98.4%", c: "green" },
              ].map(s => (
                <div key={s.l} className="glass rounded-lg p-3 text-center">
                  <div className={`text-2xl font-bold text-glow-${s.c}`}>{s.v}</div>
                  <div className="text-[10px] tracking-widest text-muted-foreground mt-1">{s.l.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
