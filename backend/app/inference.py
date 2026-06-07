"""Runtime model loading + prediction helpers."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, List

import joblib
import numpy as np

from .pipeline import ARTIFACT_DIR

_state: dict = {}


def is_ready() -> bool:
    return bool(_state.get("models"))


def load_artifacts() -> dict:
    if _state.get("models"):
        return _state
    if not (ARTIFACT_DIR / "metrics.json").exists():
        return _state

    models = {}
    for name in ("random_forest", "decision_tree", "knn"):
        path = ARTIFACT_DIR / f"{name}.joblib"
        if path.exists():
            models[name] = joblib.load(path)

    _state["models"] = models
    _state["scaler"] = joblib.load(ARTIFACT_DIR / "scaler.joblib")
    _state["label_encoder"] = joblib.load(ARTIFACT_DIR / "label_encoder.joblib")
    _state["features"] = json.loads((ARTIFACT_DIR / "feature_names.json").read_text())
    _state["metrics"] = json.loads((ARTIFACT_DIR / "metrics.json").read_text())
    _state["stats"] = json.loads((ARTIFACT_DIR / "dataset_stats.json").read_text())
    _state["importance"] = json.loads((ARTIFACT_DIR / "feature_importance.json").read_text())

    sample_path = ARTIFACT_DIR / "X_test_sample.npy"
    if sample_path.exists():
        _state["X_sample"] = np.load(sample_path)
        _state["y_sample"] = np.load(ARTIFACT_DIR / "y_test_sample.npy")
    return _state


def get_state() -> dict:
    return load_artifacts()


def vectorize(features: Dict[str, float]) -> np.ndarray:
    s = get_state()
    cols = s["features"]
    row = np.array([[float(features.get(c, 0.0)) for c in cols]])
    return s["scaler"].transform(row)


def predict_one(features: Dict[str, float], model_key: str = "random_forest") -> dict:
    s = get_state()
    model = s["models"][model_key]
    X = vectorize(features)
    pred = int(model.predict(X)[0])
    label = str(s["label_encoder"].inverse_transform([pred])[0])

    proba = None
    confidence = None
    if hasattr(model, "predict_proba"):
        p = model.predict_proba(X)[0]
        proba = {str(c): float(v) for c, v in zip(s["label_encoder"].classes_, p)}
        confidence = float(max(p))

    return {
        "model": model_key,
        "label": label,
        "is_attack": label.upper() != "BENIGN",
        "confidence": confidence,
        "probabilities": proba,
    }


def predict_many(rows: List[Dict[str, float]], model_key: str = "random_forest") -> List[dict]:
    return [predict_one(r, model_key) for r in rows]


def sample_stream(model_key: str = "random_forest") -> dict:
    """Return a prediction on a random row from the held-out test set."""
    s = get_state()
    if "X_sample" not in s:
        raise RuntimeError("No sample data available; run training first.")
    idx = int(np.random.randint(0, len(s["X_sample"])))
    X = s["X_sample"][idx : idx + 1]
    model = s["models"][model_key]
    pred = int(model.predict(X)[0])
    actual = int(s["y_sample"][idx])
    label = str(s["label_encoder"].inverse_transform([pred])[0])
    actual_label = str(s["label_encoder"].inverse_transform([actual])[0])
    conf = None
    if hasattr(model, "predict_proba"):
        p = model.predict_proba(X)[0]
        conf = float(max(p))
    return {
        "label": label,
        "actual": actual_label,
        "is_attack": label.upper() != "BENIGN",
        "confidence": conf,
        "src_ip": ".".join(str(np.random.randint(1, 255)) for _ in range(4)),
        "dst_port": int(np.random.choice([80, 443, 22, 8080, 3389, 53])),
    }


def ai_insights() -> List[dict]:
    s = get_state()
    if not s:
        return []
    stats = s["stats"]
    metrics = s["metrics"]
    importance = s["importance"]

    insights = []
    if stats["attack_percentage"] > 30:
        insights.append({
            "severity": "critical",
            "title": "Elevated attack volume detected",
            "detail": f"{stats['attack_percentage']}% of analyzed flows are malicious — well above the 5% baseline. Activate rate-limiting on edge nodes.",
        })
    top_attack = max(
        ((k, v) for k, v in stats["label_distribution"].items() if k.upper() != "BENIGN"),
        key=lambda x: x[1], default=None,
    )
    if top_attack:
        insights.append({
            "severity": "high",
            "title": f"Dominant attack class: {top_attack[0]}",
            "detail": f"{top_attack[1]:,} flows classified as {top_attack[0]}. Deploy targeted signature rules and isolate suspected source ASNs.",
        })
    if importance:
        top_feat = importance[0]["feature"]
        insights.append({
            "severity": "info",
            "title": "AI feature spotlight",
            "detail": f"Random Forest weighted '{top_feat}' as the strongest indicator of malicious traffic — monitor this metric in real time.",
        })
    best_model = max(metrics.items(), key=lambda kv: kv[1]["f1"])[0]
    insights.append({
        "severity": "info",
        "title": "Recommended production model",
        "detail": f"{best_model.replace('_', ' ').title()} leads the comparison with F1 = {metrics[best_model]['f1']:.4f}. Promote to inline mode.",
    })
    return insights
