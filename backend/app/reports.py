"""Report generators (CSV, Excel, PDF)."""
from __future__ import annotations

import io
import csv
from datetime import datetime

import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

from .inference import get_state


def _summary_rows():
    s = get_state()
    stats = s["stats"]
    metrics = s["metrics"]
    rows = [
        ["Generated", datetime.utcnow().isoformat()],
        ["Total records", stats["total_records"]],
        ["Attack records", stats["attack_records"]],
        ["Benign records", stats["benign_records"]],
        ["Attack %", stats["attack_percentage"]],
        ["Benign %", stats["benign_percentage"]],
    ]
    for name, m in metrics.items():
        rows.append([f"{name} accuracy", round(m["accuracy"], 4)])
        rows.append([f"{name} f1", round(m["f1"], 4)])
    return rows


def csv_report() -> bytes:
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["Metric", "Value"])
    for r in _summary_rows():
        w.writerow(r)
    w.writerow([])
    w.writerow(["Label", "Count"])
    for k, v in get_state()["stats"]["label_distribution"].items():
        w.writerow([k, v])
    return buf.getvalue().encode("utf-8")


def excel_report() -> bytes:
    s = get_state()
    buf = io.BytesIO()
    with pd.ExcelWriter(buf, engine="openpyxl") as xl:
        pd.DataFrame(_summary_rows(), columns=["Metric", "Value"]).to_excel(xl, sheet_name="Summary", index=False)
        pd.DataFrame(
            list(s["stats"]["label_distribution"].items()), columns=["Label", "Count"]
        ).to_excel(xl, sheet_name="Labels", index=False)
        pd.DataFrame(s["importance"]).to_excel(xl, sheet_name="Feature Importance", index=False)
        rows = []
        for name, m in s["metrics"].items():
            rows.append({
                "model": name,
                "accuracy": m["accuracy"], "precision": m["precision"],
                "recall": m["recall"], "f1": m["f1"], "roc_auc": m["roc_auc"],
                "training_time_sec": m["training_time_sec"],
                "prediction_time_sec": m["prediction_time_sec"],
            })
        pd.DataFrame(rows).to_excel(xl, sheet_name="Models", index=False)
    return buf.getvalue()


def pdf_report() -> bytes:
    s = get_state()
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4)
    styles = getSampleStyleSheet()
    story = [
        Paragraph("Sentinel NIDS — Security Report", styles["Title"]),
        Paragraph(f"Generated {datetime.utcnow().isoformat()} UTC", styles["Normal"]),
        Spacer(1, 12),
        Paragraph("Executive Summary", styles["Heading2"]),
    ]
    data = [["Metric", "Value"]] + [[str(a), str(b)] for a, b in _summary_rows()]
    t = Table(data, hAlign="LEFT")
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
    ]))
    story += [t, Spacer(1, 16), Paragraph("Model Comparison", styles["Heading2"])]
    mdata = [["Model", "Accuracy", "Precision", "Recall", "F1", "ROC-AUC"]]
    for name, m in s["metrics"].items():
        mdata.append([
            name, f"{m['accuracy']:.4f}", f"{m['precision']:.4f}",
            f"{m['recall']:.4f}", f"{m['f1']:.4f}",
            f"{m['roc_auc']:.4f}" if m["roc_auc"] is not None else "—",
        ])
    mt = Table(mdata, hAlign="LEFT")
    mt.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e293b")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
    ]))
    story.append(mt)
    story.append(Spacer(1, 16))
    story.append(Paragraph("Recommendations", styles["Heading2"]))
    story.append(Paragraph(
        "Promote Random Forest to inline production mode. Enforce rate limits on the top "
        "source ASNs identified above and monitor the leading feature signals reported by "
        "the AI engine.", styles["Normal"]))
    doc.build(story)
    return buf.getvalue()
