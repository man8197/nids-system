import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Sun, Moon, Bell, Brain, Database, Lock, Save, Upload, RefreshCw } from "lucide-react";
import { nidsApi } from "@/lib/nidsApi";

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

      <Section title="DATASET UPLOAD" icon={<Upload className="h-4 w-4 text-glow-green" />}>
        <DatasetUploader />
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

function DatasetUploader() {
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  async function upload() {
    if (!file) return;
    setBusy(true);
    setStatus("Uploading & retraining models — this can take 30-90s for large CSVs…");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${nidsApi.base}/api/upload?retrain=true`, { method: "POST", body: fd });
      const j = await res.json();
      if (!res.ok) throw new Error(j.detail || "Upload failed");
      setStatus(`✓ Saved ${j.saved} (${(j.size / 1024).toFixed(1)} KB) · models retrained.`);
    } catch (e: any) {
      setStatus(`✗ ${e.message}. Is the Python backend running on ${nidsApi.base}?`);
    } finally {
      setBusy(false);
    }
  }

  async function retrain() {
    setBusy(true);
    setStatus("Retraining on current dataset…");
    try {
      const res = await fetch(`${nidsApi.base}/api/retrain`, { method: "POST" });
      if (!res.ok) throw new Error("Retrain failed");
      setStatus("✓ Models retrained.");
    } catch (e: any) {
      setStatus(`✗ ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Row label="Upload CICIDS CSV" hint="Trains Random Forest, Decision Tree & KNN on the new file">
        <label className="text-xs px-3 py-1.5 rounded-lg glass border border-[color:var(--cyber-cyan)]/30 cursor-pointer hover:glow-cyan flex items-center gap-1.5">
          <Upload className="h-3.5 w-3.5" /> {file ? file.name.slice(0, 24) : "Choose file"}
          <input type="file" accept=".csv" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
        </label>
      </Row>
      <div className="flex gap-2">
        <button disabled={!file || busy} onClick={upload}
          className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[color:var(--cyber-cyan)] to-[color:var(--cyber-purple)] text-black font-bold text-xs disabled:opacity-40 flex items-center justify-center gap-2">
          <Upload className="h-3.5 w-3.5" /> Upload &amp; Train
        </button>
        <button disabled={busy} onClick={retrain}
          className="px-4 py-2 rounded-lg glass border border-white/10 text-xs flex items-center gap-2 disabled:opacity-40">
          <RefreshCw className={`h-3.5 w-3.5 ${busy ? "animate-spin" : ""}`} /> Retrain
        </button>
      </div>
      {status && <div className="text-[11px] text-muted-foreground mt-1">{status}</div>}
    </>
  );
}
