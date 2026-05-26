import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Fingerprint, Lock, Mail, ScanLine, Radar, KeyRound, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Particles } from "@/components/cyber/Particles";

export const Route = createFileRoute("/login")({ component: Login });

type Mode = "login" | "forgot" | "otp";

function Login() {
  const [mode, setMode] = useState<Mode>("login");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  return (
    <div className="min-h-screen relative overflow-hidden flex">
      <div className="absolute inset-0"><Particles density={60} /></div>

      {/* Left visual */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--cyber-purple)]/20 via-transparent to-[color:var(--cyber-cyan)]/20" />
        <div className="relative text-center max-w-md">
          <div className="relative inline-block">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="h-48 w-48 rounded-full border-2 border-dashed border-[color:var(--cyber-cyan)]/40" />
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-6 rounded-full border border-[color:var(--cyber-purple)]/50" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-[color:var(--cyber-cyan)] to-[color:var(--cyber-pink)] flex items-center justify-center glow-cyan">
                <Radar className="h-10 w-10 text-black" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold gradient-text mt-8 tracking-widest">SENTINEL</h1>
          <p className="text-sm text-muted-foreground mt-2 tracking-wider">AI-POWERED NETWORK INTRUSION DETECTION</p>
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            {[
              { v: "99.97%", l: "uptime" },
              { v: "3.2ms", l: "inference" },
              { v: "287", l: "deployments" },
            ].map(s => (
              <div key={s.l} className="glass rounded-lg p-3">
                <div className="text-xl font-bold text-glow-cyan">{s.v}</div>
                <div className="text-[10px] tracking-widest text-muted-foreground">{s.l.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-strong cyber-border rounded-2xl p-8 w-full max-w-md scanline">
          <div className="flex items-center gap-2 text-xs tracking-widest text-glow-cyan">
            <ShieldCheck className="h-3.5 w-3.5" /> SECURE TERMINAL · TLS 1.3
          </div>
          <h2 className="text-2xl font-bold mt-4 gradient-text-cyan">
            {mode === "login" && "Authenticate"}
            {mode === "forgot" && "Recover access"}
            {mode === "otp" && "Verify identity"}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {mode === "login" && "Biometric or credential authentication"}
            {mode === "forgot" && "We'll send a recovery code to your email"}
            {mode === "otp" && "Enter the 6-digit code from your authenticator"}
          </p>

          <div className="mt-6 space-y-3">
            {mode !== "otp" && (
              <Field icon={<Mail className="h-4 w-4" />} label="Email" placeholder="alex@sentinel.io" />
            )}
            {mode === "login" && (
              <Field icon={<Lock className="h-4 w-4" />} label="Password" placeholder="••••••••••" type="password" />
            )}
            {mode === "otp" && (
              <div>
                <div className="text-[10px] tracking-widest text-muted-foreground mb-2">VERIFICATION CODE</div>
                <div className="flex gap-2 justify-between">
                  {otp.map((v, i) => (
                    <input key={i} maxLength={1} value={v}
                      onChange={e => {
                        const next = [...otp]; next[i] = e.target.value; setOtp(next);
                        const el = e.target.nextElementSibling as HTMLInputElement | null;
                        if (e.target.value && el) el.focus();
                      }}
                      className="h-12 w-12 text-center text-xl font-bold bg-black/40 rounded-lg border border-[color:var(--cyber-cyan)]/30 focus:border-[color:var(--cyber-cyan)] focus:glow-cyan outline-none" />
                  ))}
                </div>
              </div>
            )}

            {mode === "login" && (
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-muted-foreground">
                  <input type="checkbox" className="accent-[color:var(--cyber-cyan)]" /> Remember device
                </label>
                <button onClick={() => setMode("forgot")} className="text-glow-cyan hover:underline">Forgot?</button>
              </div>
            )}
          </div>

          <button onClick={() => mode === "login" ? setMode("otp") : mode === "forgot" ? setMode("otp") : null}
            className="w-full mt-6 py-3 rounded-lg bg-gradient-to-r from-[color:var(--cyber-cyan)] via-[color:var(--cyber-purple)] to-[color:var(--cyber-pink)] text-black font-bold tracking-widest text-sm glow-cyan hover:opacity-90 transition-opacity">
            {mode === "login" && "ENGAGE"}
            {mode === "forgot" && "SEND RECOVERY"}
            {mode === "otp" && "VERIFY & ENTER"}
          </button>

          {mode === "login" && (
            <>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[10px] tracking-widest text-muted-foreground">OR</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <button className="w-full py-3 rounded-lg glass border border-[color:var(--cyber-cyan)]/30 flex items-center justify-center gap-2 text-sm hover:glow-cyan">
                <Fingerprint className="h-4 w-4 text-glow-cyan" /> Biometric authentication
              </button>
              <Link to="/" className="block text-center text-xs text-muted-foreground mt-4 hover:text-glow-cyan">
                Skip to dashboard demo →
              </Link>
            </>
          )}

          {mode !== "login" && (
            <button onClick={() => setMode("login")} className="block w-full text-center text-xs text-muted-foreground mt-4 hover:text-glow-cyan">
              ← Back to sign in
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function Field({ icon, label, placeholder, type = "text" }: { icon: React.ReactNode; label: string; placeholder: string; type?: string }) {
  return (
    <div>
      <div className="text-[10px] tracking-widest text-muted-foreground mb-1.5">{label.toUpperCase()}</div>
      <div className="flex items-center gap-2 bg-black/40 rounded-lg px-3 py-2.5 border border-white/10 focus-within:border-[color:var(--cyber-cyan)] focus-within:glow-cyan transition-all">
        <span className="text-muted-foreground">{icon}</span>
        <input type={type} placeholder={placeholder} className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground/50" />
      </div>
    </div>
  );
}
