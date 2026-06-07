import { useBackend, nidsApi } from "@/lib/nidsApi";
import { Server, AlertCircle, CheckCircle2 } from "lucide-react";

export function BackendBanner() {
  const { data, error, loading } = useBackend(() => nidsApi.health(), []);
  if (loading) return null;

  if (error || !data?.ready) {
    return (
      <div className="glass cyber-border rounded-xl p-4 flex items-start gap-3 border-[color:var(--cyber-amber)]/40">
        <AlertCircle className="h-5 w-5 text-[color:var(--cyber-amber)] mt-0.5" />
        <div className="flex-1 text-sm">
          <div className="font-bold tracking-wider text-glow-pink">
            ML BACKEND OFFLINE
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Showing demo values. Start the Python backend in VS Code to see real
            CICIDS2017 model output:
          </div>
          <code className="block mt-2 text-[11px] font-mono bg-black/40 px-3 py-2 rounded border border-white/10">
            cd backend &amp;&amp; python -m app.train &amp;&amp; uvicorn app.main:app --reload
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className="glass cyber-border rounded-xl p-3 flex items-center gap-3 border-[color:var(--cyber-green)]/40">
      <CheckCircle2 className="h-4 w-4 text-[color:var(--cyber-green)]" />
      <Server className="h-4 w-4 text-glow-cyan" />
      <div className="text-xs">
        <span className="text-glow-green font-bold tracking-wider">ML BACKEND ONLINE</span>
        <span className="text-muted-foreground ml-3">
          {data.models_loaded.join(" · ")} loaded from {nidsApi.base}
        </span>
      </div>
    </div>
  );
}
