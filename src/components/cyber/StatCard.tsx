import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function StatCard({
  label, value, sub, icon, accent = "cyan", delay = 0,
}: {
  label: string; value: ReactNode; sub?: string; icon: ReactNode;
  accent?: "cyan" | "purple" | "pink" | "green" | "red" | "amber"; delay?: number;
}) {
  const glow = `glow-${accent === "amber" ? "cyan" : accent}`;
  const text = `text-glow-${accent === "amber" ? "cyan" : accent}`;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -3 }}
      className="relative glass cyber-border rounded-xl p-5 overflow-hidden group"
    >
      <div className={`absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[color:var(--cyber-${accent})]/20 blur-3xl group-hover:bg-[color:var(--cyber-${accent})]/30 transition-colors`} />
      <div className="flex items-start justify-between relative">
        <div>
          <div className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">{label}</div>
          <div className={`mt-2 text-3xl font-bold ${text}`}>{value}</div>
          {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
        </div>
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center bg-[color:var(--cyber-${accent})]/15 ${glow}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
