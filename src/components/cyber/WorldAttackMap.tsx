import { motion } from "framer-motion";

// Approximate normalized coords (x%, y%) for major attack hotspots
const nodes = [
  { name: "New York", x: 26, y: 38, color: "var(--cyber-cyan)" },
  { name: "London", x: 47, y: 32, color: "var(--cyber-purple)" },
  { name: "Moscow", x: 56, y: 28, color: "var(--cyber-pink)" },
  { name: "Beijing", x: 76, y: 38, color: "var(--cyber-red)" },
  { name: "Tokyo", x: 84, y: 42, color: "var(--cyber-amber)" },
  { name: "São Paulo", x: 32, y: 70, color: "var(--cyber-pink)" },
  { name: "Sydney", x: 86, y: 76, color: "var(--cyber-cyan)" },
  { name: "Mumbai", x: 68, y: 50, color: "var(--cyber-purple)" },
  { name: "Lagos", x: 49, y: 60, color: "var(--cyber-green)" },
];

const target = { x: 30, y: 42, name: "HQ · US-East" };

export function WorldAttackMap() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="glass cyber-border rounded-xl p-5 h-full relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold tracking-wider">GLOBAL ATTACK MAP</h3>
          <p className="text-xs text-muted-foreground">Live attack origin telemetry</p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-[color:var(--cyber-pink)]/10 text-glow-pink border border-[color:var(--cyber-pink)]/30">
          {nodes.length * 142} events/min
        </span>
      </div>

      <div className="relative aspect-[16/9] rounded-lg overflow-hidden"
        style={{ background: "radial-gradient(ellipse at center, oklch(0.18 0.06 270 / 0.6), oklch(0.1 0.03 270))" }}>
        {/* Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 56" preserveAspectRatio="none">
          {Array.from({ length: 11 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 10} y1="0" x2={i * 10} y2="56" stroke="var(--cyber-cyan)" strokeWidth="0.05" />
          ))}
          {Array.from({ length: 7 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 8} x2="100" y2={i * 8} stroke="var(--cyber-cyan)" strokeWidth="0.05" />
          ))}
        </svg>

        {/* World silhouette (simplified continents using soft blobs) */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 56" preserveAspectRatio="none">
          <defs>
            <radialGradient id="continent">
              <stop offset="0%" stopColor="var(--cyber-cyan)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="var(--cyber-cyan)" stopOpacity="0" />
            </radialGradient>
          </defs>
          {[
            [22, 35, 14, 18], [30, 65, 8, 14], [50, 35, 10, 14], [55, 55, 8, 12],
            [72, 38, 12, 14], [82, 72, 6, 8],
          ].map(([cx, cy, rx, ry], i) => (
            <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#continent)" />
          ))}
        </svg>

        {/* Attack lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 56" preserveAspectRatio="none">
          {nodes.map((n, i) => {
            const mx = (n.x + target.x) / 2;
            const my = Math.min(n.y, target.y) - 12;
            const d = `M ${n.x} ${n.y} Q ${mx} ${my} ${target.x} ${target.y}`;
            return (
              <g key={i}>
                <path d={d} stroke={n.color} strokeWidth="0.15" fill="none" opacity="0.4" />
                <motion.circle
                  r="0.5" fill={n.color}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 2, delay: i * 0.3, repeat: Infinity, repeatDelay: 1 }}
                  style={{ filter: `drop-shadow(0 0 1px ${n.color})` }}
                >
                  <animateMotion dur="2s" begin={`${i * 0.3}s`} repeatCount="indefinite" path={d} />
                </motion.circle>
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map((n, i) => (
          <div key={i} className="absolute" style={{ left: `${n.x}%`, top: `${n.y}%`, transform: "translate(-50%,-50%)" }}>
            <div className="relative h-2 w-2 rounded-full" style={{ background: n.color, boxShadow: `0 0 10px ${n.color}` }}>
              <span className="absolute inset-0 rounded-full ping-ring" style={{ background: n.color, opacity: 0.4 }} />
            </div>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] tracking-widest text-muted-foreground whitespace-nowrap">
              {n.name}
            </div>
          </div>
        ))}

        {/* Target */}
        <div className="absolute" style={{ left: `${target.x}%`, top: `${target.y}%`, transform: "translate(-50%,-50%)" }}>
          <div className="h-3 w-3 rounded-full bg-[color:var(--cyber-green)] glow-green" />
          <div className="absolute -inset-4 border border-[color:var(--cyber-green)]/40 rounded-full" />
          <div className="absolute -inset-7 border border-[color:var(--cyber-green)]/20 rounded-full" />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] tracking-widest text-glow-green whitespace-nowrap">
            {target.name}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mt-3 text-xs">
        {[
          { l: "Origins", v: "47 ASNs", c: "cyan" },
          { l: "Targets", v: "12 hosts", c: "green" },
          { l: "Top vector", v: "DDoS", c: "pink" },
          { l: "Blocked", v: "98.4%", c: "purple" },
        ].map(s => (
          <div key={s.l} className="glass rounded-lg p-2">
            <div className="text-[10px] text-muted-foreground tracking-widest">{s.l}</div>
            <div className={`font-bold text-glow-${s.c}`}>{s.v}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
