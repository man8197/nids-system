"""FastAPI entrypoint."""
from __future__ import annotations

import asyncio
import json
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel

from . import inference, reports

app = FastAPI(title="Sentinel NIDS API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    features: Dict[str, float]
    model: Optional[str] = "random_forest"


class BatchRequest(BaseModel):
    rows: List[Dict[str, float]]
    model: Optional[str] = "random_forest"


def _ensure_ready():
    state = inference.get_state()
    if not state:
        raise HTTPException(503, "Models not trained yet. Run `python -m app.train` first.")
    return state


@app.get("/api/health")
def health():
    state = inference.get_state()
    return {
        "status": "ok",
        "models_loaded": list(state.get("models", {}).keys()),
        "ready": inference.is_ready(),
    }


@app.get("/api/metrics")
def metrics():
    return _ensure_ready()["metrics"]


@app.get("/api/dataset/stats")
def dataset_stats():
    return _ensure_ready()["stats"]


@app.get("/api/feature-importance")
def feature_importance():
    return _ensure_ready()["importance"]


@app.get("/api/insights")
def insights():
    _ensure_ready()
    return inference.ai_insights()


@app.post("/api/predict")
def predict(req: PredictRequest):
    _ensure_ready()
    try:
        return inference.predict_one(req.features, req.model or "random_forest")
    except KeyError:
        raise HTTPException(400, f"Unknown model: {req.model}")


@app.post("/api/predict/batch")
def predict_batch(req: BatchRequest):
    _ensure_ready()
    return {"predictions": inference.predict_many(req.rows, req.model or "random_forest")}


@app.get("/api/reports/csv")
def report_csv():
    _ensure_ready()
    return Response(reports.csv_report(), media_type="text/csv",
                    headers={"Content-Disposition": "attachment; filename=nids_report.csv"})


@app.get("/api/reports/excel")
def report_excel():
    _ensure_ready()
    return Response(reports.excel_report(),
                    media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    headers={"Content-Disposition": "attachment; filename=nids_report.xlsx"})


@app.get("/api/reports/pdf")
def report_pdf():
    _ensure_ready()
    return Response(reports.pdf_report(), media_type="application/pdf",
                    headers={"Content-Disposition": "attachment; filename=nids_report.pdf"})


@app.websocket("/ws/stream")
async def ws_stream(ws: WebSocket):
    await ws.accept()
    try:
        if not inference.is_ready():
            await ws.send_json({"error": "Models not trained"})
            await ws.close()
            return
        while True:
            evt = inference.sample_stream("random_forest")
            await ws.send_json(evt)
            await asyncio.sleep(1.0)
    except WebSocketDisconnect:
        return


@app.on_event("startup")
def _startup():
    inference.load_artifacts()
