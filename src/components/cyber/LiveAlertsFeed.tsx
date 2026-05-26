import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { AlertOctagon, ShieldAlert, Eye, Zap } from "lucide-react";

const seed = [
  { sev: "Critical", title: "DDoS amplification detected", ip: "203.45.122.18", icon: AlertOctagon, color: "red" },
  { sev: "High", title: "Brute force on SSH endpoint", ip: "91.218.7.42", icon: ShieldAlert, color: "pink" },
  { sev: "Medium", title: "Lateral movement attempt", ip: "10.0.2.18", icon: Eye, color: "purple" },
  { sev: "Critical", title: "Ransomware signature match", ip: "172.111.0.34", icon: Zap, color: "red" },
  { sev: "Low", title: "Anomalous DNS lookup", ip: "88.214.26.110", icon: Eye, color: "cyan" },
];

export function LiveAlertsFeed() {
  const [items, setItems] = useState(seed);
  useEffect(() => {
    const id = setInterval(() => {
      setItems(prev => {
        const next = [...prev];
        const e = next.pop()!;
        return [{ ...e, ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` }, ...next];
      });
    }, 2500);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="glass cyber-border rounded-xl p-5 h-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold tracking-wider">LIVE INTRUSION FEED</h3>
          <p className="text-xs text-muted-foreground">Streaming alerts</p>
        </div>
        <span className="text-[10px] tracking-widest text-glow-green flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--cyber-green)] pulse-glow" /> LIVE
        </span>
      </div>
      <div className="space-y-2 max-h-[440px] overflow-y-auto no-scrollbar">
        <AnimatePresence initial={false}>
          {items.map((a, i) => {
            const Icon = a.icon;
            return (
              <motion.div
                key={a.ip + i}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`flex items-start gap-3 p-3 rounded-lg glass border border-[color:var(--cyber-${a.color})]/25`}
              >
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center bg-[color:var(--cyber-${a.color})]/15 glow-${a.color}`}>
                  <Icon className={`h-4 w-4 text-[color:var(--cyber-${a.color})]`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border tracking-widest text-glow-${a.color} border-[color:var(--cyber-${a.color})]/40`}>{a.sev}</span>
                    <span className="text-[10px] text-muted-foreground">now</span>
                  </div>
                  <div className="text-sm mt-1 truncate">{a.title}</div>
                  <div className="text-[10px] font-mono text-muted-foreground mt-0.5">src: {a.ip}</div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
