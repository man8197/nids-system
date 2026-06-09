/**
 * Sentinel NIDS API client.
 * Talks to the Python FastAPI backend (default http://localhost:8000).
 * If the backend is unreachable, hooks return `null` and components fall back
 * to their existing demo visuals so the UI keeps working during development.
 */
import { useEffect, useRef, useState } from "react";

const API_BASE =
  (import.meta as any).env?.VITE_NIDS_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

export interface ModelMetric {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  roc_auc: number | null;
  confusion_matrix: number[][];
  prediction_time_sec: number;
  training_time_sec: number;
  detection_rate: number;
  classes: string[];
}

export interface DatasetStats {
  total_records: number;
  attack_records: number;
  benign_records: number;
  attack_percentage: number;
  benign_percentage: number;
  label_distribution: Record<string, number>;
  protocol_distribution: Record<string, number>;
  flow_stats: Record<string, { mean: number; min: number; max: number; p95: number } | null>;
  timeline: { t: number; attacks: number; benign: number }[];
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}

export interface Insight {
  severity: "critical" | "high" | "info";
  title: string;
  detail: string;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json();
}

export const nidsApi = {
  base: API_BASE,
  health: () => get<{ status: string; ready: boolean; models_loaded: string[]; datasets?: string[] }>("/api/health"),
  metrics: () => get<Record<string, ModelMetric>>("/api/metrics"),
  stats: () => get<DatasetStats>("/api/dataset/stats"),
  importance: () => get<FeatureImportance[]>("/api/feature-importance"),
  insights: () => get<Insight[]>("/api/insights"),
  reportUrl: (format: "csv" | "excel" | "pdf") => `${API_BASE}/api/reports/${format}`,
  logsExportUrl: () => `${API_BASE}/api/logs/export`,
};

export function useBackend<T>(fn: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    fn()
      .then((d) => alive && (setData(d), setError(null)))
      .catch((e) => alive && setError(e))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data, error, loading };
}

export interface StreamEvent {
  label: string;
  actual: string;
  is_attack: boolean;
  confidence: number | null;
  src_ip: string;
  dst_port: number;
}

export function useLiveStream(max = 40) {
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  useEffect(() => {
    const url = API_BASE.replace(/^http/, "ws") + "/ws/stream";
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;
      ws.onopen = () => setConnected(true);
      ws.onclose = () => setConnected(false);
      ws.onerror = () => setConnected(false);
      ws.onmessage = (m) => {
        try {
          const evt = JSON.parse(m.data);
          if (evt.error) return;
          setEvents((prev) => [evt as StreamEvent, ...prev].slice(0, max));
        } catch {}
      };
      return () => ws.close();
    } catch {
      return;
    }
  }, [max]);
  return { events, connected };
}
