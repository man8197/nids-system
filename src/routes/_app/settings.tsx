import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Sun, Moon, Bell, Brain, Database, Plug, Lock, Save } from "lucide-react";

export const Route = createFileRoute("/_app/settings")({ component: Settings });

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)}
      className={`relative h-6 w-11 rounded-full transition-colors ${on ? "bg-gradient-to-r from-[color:var(--cyber-cyan)] to-[color:var(--cyber-purple)] glow-cyan" : "bg-white/10"}`}>
      <motion.span animate={{ x: on ? 22 : 2 }} className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-lg" />
    </button>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="glass cyber-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-[color:var(--cyber-cyan)]/15 flex items-center justify-center glow-cyan">{icon}</div>
        <h3 className="font-bold tracking-wider">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </motion.div>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="min-w-0">
        <div className="text-sm">{label}</div>
        {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
      </div>
      {children}
    </div>
  );
}

function Settings() {
  const [dark, setDark] = useState(true);
  const [notifs, setNotifs] = useState({ email: true, sms: false, push: true });
  const [sens, setSens] = useState(7);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <Section title="ACCOUNT" icon={<Lock className="h-4 w-4 text-glow-cyan" />}>
        <Row label="Display name"><input defaultValue="Alex Chen" className="bg-black/40 rounded-lg px-3 py-1.5 text-sm border border-white/10 focus:border-[color:var(--cyber-cyan)] outline-none" /></Row>
        <Row label="Email"><input defaultValue="alex@sentinel.io" className="bg-black/40 rounded-lg px-3 py-1.5 text-sm border border-white/10 focus:border-[color:var(--cyber-cyan)] outline-none" /></Row>
        <Row label="Two-factor auth" hint="Time-based OTP enforced"><Toggle on onChange={() => {}} /></Row>
      </Section>

      <Section title="APPEARANCE" icon={dark ? <Moon className="h-4 w-4 text-glow-purple" /> : <Sun className="h-4 w-4 text-glow-cyan" />}>
        <Row label="Theme" hint="Dark / light mode"><Toggle on={dark} onChange={setDark} /></Row>
        <Row label="Compact density"><Toggle on={false} onChange={() => {}} /></Row>
        <Row label="Reduce motion"><Toggle on={false} onChange={() => {}} /></Row>
      </Section>

      <Section title="NOTIFICATIONS" icon={<Bell className="h-4 w-4 text-glow-pink" />}>
        <Row label="Email alerts"><Toggle on={notifs.email} onChange={v => setNotifs({ ...notifs, email: v })} /></Row>
        <Row label="SMS alerts" hint="For Critical only"><Toggle on={notifs.sms} onChange={v => setNotifs({ ...notifs, sms: v })} /></Row>
        <Row label="Push notifications"><Toggle on={notifs.push} onChange={v => setNotifs({ ...notifs, push: v })} /></Row>
      </Section>

      <Section title="AI DETECTION" icon={<Brain className="h-4 w-4 text-glow-purple" />}>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Sensitivity</span>
            <span className="text-glow-cyan font-bold text-sm">{sens}/10</span>
          </div>
          <input type="range" min={1} max={10} value={sens} onChange={e => setSens(+e.target.value)}
            className="w-full accent-[color:var(--cyber-cyan)]" />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>Conservative</span><span>Aggressive</span>
          </div>
        </div>
        <Row label="Auto-mitigation" hint="Block matched threats instantly"><Toggle on onChange={() => {}} /></Row>
        <Row label="Behavioral baselining" hint="Retrain every 24h"><Toggle on onChange={() => {}} /></Row>
      </Section>

      <Section title="API INTEGRATIONS" icon={<Plug className="h-4 w-4 text-glow-green" />}>
        {["Splunk SIEM", "Slack #soc-alerts", "PagerDuty", "Microsoft Sentinel"].map(s => (
          <Row key={s} label={s}><span className="text-[10px] tracking-widest text-glow-green px-2 py-0.5 rounded-full border border-[color:var(--cyber-green)]/30">CONNECTED</span></Row>
        ))}
      </Section>

      <Section title="DATABASE" icon={<Database className="h-4 w-4 text-glow-cyan" />}>
        <Row label="Cluster" hint="Primary node"><span className="font-mono text-xs">pg://sentinel-east-1</span></Row>
        <Row label="Retention" hint="Telemetry events"><span className="text-sm">90 days</span></Row>
        <Row label="Encryption at rest"><span className="text-glow-green text-xs">AES-256-GCM</span></Row>
      </Section>

      <div className="lg:col-span-2 flex justify-end">
        <button className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[color:var(--cyber-cyan)] to-[color:var(--cyber-purple)] text-black font-bold text-sm flex items-center gap-2 glow-cyan">
          <Save className="h-4 w-4" /> Save configuration
        </button>
      </div>
    </div>
  );
}
