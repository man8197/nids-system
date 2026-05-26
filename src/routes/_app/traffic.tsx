import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell,
} from "recharts";
import { StatCard } from "@/components/cyber/StatCard";
import { ArrowDownToLine, ArrowUpFromLine, Network, Wifi, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/_app/traffic")({ component: Traffic });

const flow = Array.from({ length: 60 }, (_, i) => ({
  t: i,
  in: 200 + Math.sin(i / 4) * 100 + Math.random() * 60,
  out: 160 + Math.cos(i / 5) * 80 + Math.random() * 50,
}));

const protocols = [
  { name: "TCP", value: 4820, color: "var(--cyber-cyan)" },
  { name: "UDP", value: 2140, color: "var(--cyber-purple)" },
  { name: "HTTP", value: 3650, color: "var(--cyber-pink)" },
  { name: "DNS", value: 980, color: "var(--cyber-green)" },
  { name: "ICMP", value: 230, color: "var(--cyber-amber)" },
];

const suspIPs = [
  { ip: "203.45.122.18", reqs: 1840, geo: "RU", score: 94 },
  { ip: "91.218.7.42", reqs: 1230, geo: "CN", score: 88 },
  { ip: "45.95.169.203", reqs: 940, geo: "NL", score: 81 },
  { ip: "172.111.0.34", reqs: 720, geo: "US", score: 74 },
  { ip: "88.214.26.110", reqs: 530, geo: "DE", score: 67 },
];

function Heatmap() {
  const rows = 7, cols = 24;
  return (
    <div className="glass cyber-border rounded-xl p-5">
      <h3 className="font-bold tracking-wider mb-1">TRAFFIC HEATMAP</h3>
      <p className="text-xs text-muted-foreground mb-4">Packets per hour · last 7 days</p>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: rows * cols }).map((_, i) => {
          const v = Math.random();
          const color = v > 0.85 ? "var(--cyber-pink)" : v > 0.6 ? "var(--cyber-purple)" : v > 0.3 ? "var(--cyber-cyan)" : "oklch(0.3 0.05 270)";
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.3 + v * 0.7, scale: 1 }}
              transition={{ delay: i * 0.005 }}
              className="aspect-square rounded-sm"
              style={{ background: color, boxShadow: v > 0.6 ? `0 0 6px ${color}` : "none" }}
            />
          );
        })}
      </div>
    </div>
  );
}

function PacketStream() {
  return (
    <div className="glass cyber-border rounded-xl p-5 h-[260px] overflow-hidden relative">
      <h3 className="font-bold tracking-wider mb-1">LIVE PACKET STREAM</h3>
      <p className="text-xs text-muted-foreground mb-3">Real-time wire capture</p>
      <div className="absolute inset-0 top-16 overflow-hidden">
        {Array.from({ length: 18 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -20, x: `${Math.random() * 100}%` }}
            animate={{ y: 280 }}
            transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 3, ease: "linear" }}
            className="absolute text-[10px] font-mono text-glow-cyan whitespace-nowrap"
          >
            {`>> ${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.x.x  TCP ${Math.floor(Math.random() * 9000)}`}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Traffic() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Inbound" value="842 Mbps" sub="peak 1.2 Gbps" icon={<ArrowDownToLine className="h-5 w-5 text-[color:var(--cyber-cyan)]" />} accent="cyan" />
        <StatCard label="Outbound" value="614 Mbps" sub="steady" icon={<ArrowUpFromLine className="h-5 w-5 text-[color:var(--cyber-purple)]" />} accent="purple" />
        <StatCard label="Active Flows" value="14,820" sub="+3.2%" icon={<Network className="h-5 w-5 text-[color:var(--cyber-pink)]" />} accent="pink" />
        <StatCard label="Packet Loss" value="0.04%" sub="nominal" icon={<Wifi className="h-5 w-5 text-[color:var(--cyber-green)]" />} accent="green" />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass cyber-border rounded-xl p-5 scanline">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold tracking-wider">BANDWIDTH ANALYSIS</h3>
            <p className="text-xs text-muted-foreground">In/out throughput · last 60 minutes</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={flow}>
            <defs>
              <linearGradient id="ti" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--cyber-cyan)" stopOpacity={0.6} /><stop offset="100%" stopColor="var(--cyber-cyan)" stopOpacity={0} /></linearGradient>
              <linearGradient id="to" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--cyber-pink)" stopOpacity={0.5} /><stop offset="100%" stopColor="var(--cyber-pink)" stopOpacity={0} /></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
            <XAxis dataKey="t" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
            <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "oklch(0.16 0.04 270 / 0.95)", border: "1px solid var(--cyber-cyan)", borderRadius: 8 }} />
            <Area type="monotone" dataKey="in" stroke="var(--cyber-cyan)" fill="url(#ti)" strokeWidth={2} />
            <Area type="monotone" dataKey="out" stroke="var(--cyber-pink)" fill="url(#to)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass cyber-border rounded-xl p-5">
          <h3 className="font-bold tracking-wider mb-1">PROTOCOL MONITORING</h3>
          <p className="text-xs text-muted-foreground mb-4">Flow distribution</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={protocols}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
              <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "oklch(0.16 0.04 270 / 0.95)", border: "1px solid var(--cyber-cyan)", borderRadius: 8 }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {protocols.map((p, i) => <Cell key={i} fill={p.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <PacketStream />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><Heatmap /></div>
        <div className="glass cyber-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold tracking-wider">SUSPICIOUS IPs</h3>
            <AlertCircle className="h-4 w-4 text-[color:var(--cyber-pink)]" />
          </div>
          <div className="space-y-2">
            {suspIPs.map((ip, i) => (
              <motion.div key={ip.ip} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="glass rounded-lg p-3 flex items-center gap-3">
                <div className="text-xs font-mono">{ip.geo}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm truncate">{ip.ip}</div>
                  <div className="text-[10px] text-muted-foreground">{ip.reqs.toLocaleString()} requests</div>
                </div>
                <div className={`text-xs px-2 py-1 rounded-full border ${ip.score > 85 ? "text-glow-red border-[color:var(--cyber-red)]/40" : "text-glow-pink border-[color:var(--cyber-pink)]/40"}`}>{ip.score}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
