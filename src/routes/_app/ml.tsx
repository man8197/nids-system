import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  RadialBarChart, RadialBar, PolarAngleAxis, Legend,
} from "recharts";
import { Brain, Cpu, Gauge, ListChecks, Lightbulb, AlertOctagon } from "lucide-react";
import { useBackend, nidsApi, ModelMetric } from "@/lib/nidsApi";
import { BackendBanner } from "@/components/cyber/BackendBanner";

export const Route = createFileRoute("/_app/ml")({ component: MlModels });

const MODEL_COLORS: Record<string, string> = {
  random_forest: "var(--cyber-cyan)",
  decision_tree: "var(--cyber-purple)",
  knn: "var(--cyber-pink)",
};
const MODEL_LABEL: Record<string, string> = {
  random_forest: "Random Forest",
  decision_tree: "Decision Tree",
  knn: "KNN",
};

function MlModels() {
  const { data: metrics } = useBackend(() => nidsApi.metrics(), []);
  const { data: importance } = useBackend(() => nidsApi.importance(), []);
  const { data: insights } = useBackend(() => nidsApi.insights(), []);
  const [selected, setSelected] = useState<string>("random_forest");

  return (
    <div className="space-y-6">
      <BackendBanner />

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="glass cyber-border rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-[color:var(--cyber-cyan)]/25 blur-3xl" />
        <div className="flex items-center gap-4 relative">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[color:var(--cyber-cyan)] to-[color:var(--cyber-purple)] flex items-center justify-center">
            <Brain className="h-7 w-7 text-black" />
          </div>
          <div>
            <div className="text-xs tracking-[0.3em] text-muted-foreground">CICIDS2017 · DDOS</div>
            <h2 className="text-2xl md:text-3xl font-bold gradient-text">Model Comparison Lab</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Random Forest vs Decision Tree vs KNN — trained on the Friday-Afternoon-DDoS capture.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Model toggle */}
      <div className="flex gap-2 flex-wrap">
        {Object.keys(MODEL_LABEL).map((k) => (
          <button
            key={k}
            onClick={() => setSelected(k)}
            className={`px-4 py-2 rounded-lg text-xs tracking-widest border transition-all ${
              selected === k
                ? "border-[color:var(--cyber-cyan)] text-glow-cyan bg-[color:var(--cyber-cyan)]/10"
                : "border-white/10 text-muted-foreground hover:bg-white/5"
            }`}
          >
            {MODEL_LABEL[k]}
          </button>
        ))}
      </div>

      {/* Metric grid */}
      {metrics ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {metricCard("Accuracy", metrics[selected].accuracy, "cyan", <Gauge className="h-4 w-4" />)}
            {metricCard("Precision", metrics[selected].precision, "purple", <ListChecks className="h-4 w-4" />)}
            {metricCard("Recall", metrics[selected].recall, "pink", <Gauge className="h-4 w-4" />)}
            {metricCard("F1 Score", metrics[selected].f1, "green", <Gauge className="h-4 w-4" />)}
            {metricCard("ROC-AUC", metrics[selected].roc_auc ?? 0, "amber", <Gauge className="h-4 w-4" />)}
            {metricCard("Detection", metrics[selected].detection_rate, "red", <AlertOctagon className="h-4 w-4" />)}
          </div>

          {/* Comparison chart */}
          <div className="glass cyber-border rounded-xl p-5">
            <h3 className="font-bold tracking-wider mb-1">MODEL COMPARISON · WEIGHTED METRICS</h3>
            <p className="text-xs text-muted-foreground mb-3">Higher is better</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData(metrics)}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
                <XAxis dataKey="metric" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <YAxis domain={[0, 1]} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "oklch(0.16 0.04 270 / 0.95)", border: "1px solid var(--cyber-cyan)", borderRadius: 8 }} />
                <Legend />
                {Object.keys(metrics).map((m) => (
                  <Bar key={m} dataKey={MODEL_LABEL[m]} fill={MODEL_COLORS[m]} radius={[6, 6, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Timing + confusion */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="glass cyber-border rounded-xl p-5">
              <h3 className="font-bold tracking-wider mb-3">TRAINING & PREDICTION TIME</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={Object.entries(metrics).map(([k, v]) => ({
                  model: MODEL_LABEL[k],
                  training: +v.training_time_sec.toFixed(2),
                  prediction: +(v.prediction_time_sec * 1000).toFixed(2),
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
                  <XAxis dataKey="model" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "oklch(0.16 0.04 270 / 0.95)", border: "1px solid var(--cyber-cyan)", borderRadius: 8 }} />
                  <Legend />
                  <Bar dataKey="training" name="Train (s)" fill="var(--cyber-cyan)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="prediction" name="Predict (ms)" fill="var(--cyber-pink)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ConfusionMatrix m={metrics[selected]} />
          </div>
        </>
      ) : (
        <div className="text-sm text-muted-foreground">Waiting for backend metrics…</div>
      )}

      {/* Feature importance */}
      <div className="glass cyber-border rounded-xl p-5">
        <h3 className="font-bold tracking-wider mb-1">FEATURE IMPORTANCE · RANDOM FOREST</h3>
        <p className="text-xs text-muted-foreground mb-3">Top contributors to attack detection</p>
        {importance ? (
          <ResponsiveContainer width="100%" height={Math.max(300, importance.length * 22)}>
            <BarChart data={importance} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
              <XAxis type="number" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
              <YAxis type="category" dataKey="feature" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} width={180} />
              <Tooltip contentStyle={{ background: "oklch(0.16 0.04 270 / 0.95)", border: "1px solid var(--cyber-cyan)", borderRadius: 8 }} />
              <Bar dataKey="importance" fill="var(--cyber-purple)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-sm text-muted-foreground">No importance data yet.</div>
        )}
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(insights || []).map((it, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`glass cyber-border rounded-xl p-5 border-[color:var(--cyber-${
              it.severity === "critical" ? "red" : it.severity === "high" ? "pink" : "cyan"
            })]/40`}>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className={`h-4 w-4 text-[color:var(--cyber-${
                it.severity === "critical" ? "red" : it.severity === "high" ? "pink" : "cyan"
              })]`} />
              <span className="text-xs tracking-widest text-muted-foreground">AI INSIGHT · {it.severity.toUpperCase()}</span>
            </div>
            <div className="font-bold mb-1">{it.title}</div>
            <p className="text-xs text-muted-foreground">{it.detail}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function metricCard(label: string, value: number, accent: string, icon: React.ReactNode) {
  const pct = (value * 100).toFixed(2);
  return (
    <div className={`glass cyber-border rounded-xl p-4`}>
      <div className="flex items-center gap-2 text-[10px] tracking-widest text-muted-foreground mb-1">
        {icon}
        {label}
      </div>
      <div className={`text-2xl font-bold text-glow-${accent}`}>{pct}%</div>
    </div>
  );
}

function comparisonData(metrics: Record<string, ModelMetric>) {
  const keys: (keyof ModelMetric)[] = ["accuracy", "precision", "recall", "f1"];
  return keys.map((k) => {
    const row: Record<string, any> = { metric: String(k).toUpperCase() };
    for (const [m, v] of Object.entries(metrics)) {
      row[MODEL_LABEL[m]] = +(v[k] as number).toFixed(4);
    }
    return row;
  });
}

function ConfusionMatrix({ m }: { m: ModelMetric }) {
  const max = Math.max(...m.confusion_matrix.flat(), 1);
  return (
    <div className="glass cyber-border rounded-xl p-5">
      <h3 className="font-bold tracking-wider mb-3">CONFUSION MATRIX</h3>
      <div className="overflow-x-auto">
        <table className="text-xs">
          <thead>
            <tr>
              <th className="px-2 py-1 text-muted-foreground">actual ↓ / pred →</th>
              {m.classes.map((c) => (
                <th key={c} className="px-2 py-1 text-glow-cyan whitespace-nowrap">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {m.confusion_matrix.map((row, i) => (
              <tr key={i}>
                <td className="px-2 py-1 text-glow-purple whitespace-nowrap">{m.classes[i]}</td>
                {row.map((v, j) => {
                  const intensity = v / max;
                  return (
                    <td key={j} className="px-2 py-1 text-center font-mono"
                      style={{
                        background: `color-mix(in oklab, var(--cyber-cyan) ${Math.round(intensity * 60)}%, transparent)`,
                      }}>
                      {v}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
