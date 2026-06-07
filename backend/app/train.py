"""Train Random Forest, Decision Tree, and KNN on CICIDS2017."""
from __future__ import annotations

import json
import time
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix,
)
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier

from .pipeline import ARTIFACT_DIR, full_pipeline, LABEL_COL


def _multi_roc(y_true, proba, n_classes):
    if n_classes == 2:
        return float(roc_auc_score(y_true, proba[:, 1]))
    return float(roc_auc_score(y_true, proba, multi_class="ovr", average="weighted"))


def evaluate(model, X_test, y_test, classes):
    t0 = time.time()
    y_pred = model.predict(X_test)
    pred_time = time.time() - t0

    proba = None
    if hasattr(model, "predict_proba"):
        try:
            proba = model.predict_proba(X_test)
        except Exception:
            proba = None

    cm = confusion_matrix(y_test, y_pred).tolist()
    metrics = {
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "precision": float(precision_score(y_test, y_pred, average="weighted", zero_division=0)),
        "recall": float(recall_score(y_test, y_pred, average="weighted", zero_division=0)),
        "f1": float(f1_score(y_test, y_pred, average="weighted", zero_division=0)),
        "roc_auc": _multi_roc(y_test, proba, len(classes)) if proba is not None else None,
        "confusion_matrix": cm,
        "prediction_time_sec": pred_time,
        "detection_rate": float(recall_score(y_test, y_pred, average="macro", zero_division=0)),
        "classes": list(classes),
    }
    return metrics


def dataset_stats(df: pd.DataFrame, le) -> dict:
    label_counts = df[LABEL_COL].value_counts().to_dict()
    total = int(len(df))
    attack_rows = int(sum(v for k, v in label_counts.items() if k.upper() != "BENIGN"))
    benign_rows = total - attack_rows

    proto_col = next((c for c in df.columns if c.lower() == "protocol"), None)
    proto_dist = (
        df[proto_col].value_counts().head(8).to_dict() if proto_col else {}
    )

    def num(col):
        c = next((x for x in df.columns if x.lower() == col.lower()), None)
        if c is None:
            return None
        s = df[c].astype(float)
        return {"mean": float(s.mean()), "min": float(s.min()), "max": float(s.max()), "p95": float(s.quantile(0.95))}

    flow_stats = {
        "flow_duration": num("Flow Duration"),
        "total_fwd_packets": num("Total Fwd Packets"),
        "total_bwd_packets": num("Total Backward Packets"),
        "flow_bytes_per_s": num("Flow Bytes/s"),
        "flow_packets_per_s": num("Flow Packets/s"),
        "avg_packet_size": num("Average Packet Size"),
        "packet_length_mean": num("Packet Length Mean"),
    }

    # Timeline: rolling counts by chunk index (proxy for time)
    chunks = 30
    chunk_size = max(1, total // chunks)
    timeline = []
    for i in range(chunks):
        seg = df.iloc[i * chunk_size : (i + 1) * chunk_size]
        att = int((seg[LABEL_COL].str.upper() != "BENIGN").sum())
        ben = int(len(seg) - att)
        timeline.append({"t": i, "attacks": att, "benign": ben})

    return {
        "total_records": total,
        "attack_records": attack_rows,
        "benign_records": benign_rows,
        "attack_percentage": round(attack_rows / total * 100, 2) if total else 0,
        "benign_percentage": round(benign_rows / total * 100, 2) if total else 0,
        "label_distribution": {str(k): int(v) for k, v in label_counts.items()},
        "protocol_distribution": {str(k): int(v) for k, v in proto_dist.items()},
        "flow_stats": flow_stats,
        "timeline": timeline,
    }


def main():
    print("→ Loading + cleaning dataset...")
    bundle, df = full_pipeline()
    X_train, X_test = bundle["X_train"], bundle["X_test"]
    y_train, y_test = bundle["y_train"], bundle["y_test"]
    le = bundle["label_encoder"]
    classes = le.classes_

    models = {
        "random_forest": RandomForestClassifier(
            n_estimators=120, max_depth=22, n_jobs=-1, random_state=42, class_weight="balanced"
        ),
        "decision_tree": DecisionTreeClassifier(max_depth=22, random_state=42, class_weight="balanced"),
        "knn": KNeighborsClassifier(n_neighbors=5, n_jobs=-1),
    }

    all_metrics = {}
    for name, model in models.items():
        print(f"→ Training {name}...")
        t0 = time.time()
        model.fit(X_train, y_train)
        train_time = time.time() - t0
        m = evaluate(model, X_test, y_test, classes)
        m["training_time_sec"] = train_time
        all_metrics[name] = m
        joblib.dump(model, ARTIFACT_DIR / f"{name}.joblib")
        print(f"   acc={m['accuracy']:.4f}  f1={m['f1']:.4f}  train={train_time:.2f}s")

    # persist preprocessing + metadata
    joblib.dump(bundle["scaler"], ARTIFACT_DIR / "scaler.joblib")
    joblib.dump(le, ARTIFACT_DIR / "label_encoder.joblib")
    (ARTIFACT_DIR / "feature_names.json").write_text(json.dumps(bundle["feature_names"]))
    (ARTIFACT_DIR / "metrics.json").write_text(json.dumps(all_metrics, indent=2))

    # feature importance (Random Forest)
    rf = models["random_forest"]
    importances = sorted(
        zip(bundle["feature_names"], rf.feature_importances_.tolist()),
        key=lambda x: x[1], reverse=True,
    )[:20]
    (ARTIFACT_DIR / "feature_importance.json").write_text(
        json.dumps([{"feature": f, "importance": float(i)} for f, i in importances], indent=2)
    )

    print("→ Computing dataset statistics...")
    stats = dataset_stats(df, le)
    (ARTIFACT_DIR / "dataset_stats.json").write_text(json.dumps(stats, indent=2))

    # Save a slice of the scaled test set for the live-stream endpoint
    np.save(ARTIFACT_DIR / "X_test_sample.npy", X_test[:5000])
    np.save(ARTIFACT_DIR / "y_test_sample.npy", y_test[:5000])

    print("✅ Training complete. Artifacts in", ARTIFACT_DIR)


if __name__ == "__main__":
    main()
