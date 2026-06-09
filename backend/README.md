# Sentinel NIDS — Python ML Backend

Standalone FastAPI + scikit-learn backend for the Sentinel NIDS dashboard.
Trains Random Forest, Decision Tree, and KNN classifiers on CICIDS2017 flow
records (e.g. `Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv` or any
similarly-shaped CSV) and serves metrics + live predictions to the React UI.

## Quick start (VS Code)

```bash
cd backend
python -m venv .venv
# Windows:  .venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate
pip install -r requirements.txt
```

Place one or more CICIDS CSVs in `backend/data/` (a starter `dos.csv` is
already included). Then:

```bash
python -m app.train          # trains all 3 models, writes artifacts/
uvicorn app.main:app --reload --port 8000
```

Open the React dashboard and the banner will switch to **ML BACKEND ONLINE**.

## Upload more datasets from the UI

In **Settings → Dataset Upload** you can drop another CICIDS-format CSV. The
backend will save it into `backend/data/` and automatically retrain all
three models. The dashboard, threat analysis, map, alerts, logs, and reports
all refresh against the new model.

## Endpoints

| Method | Path                       | Purpose                                |
| ------ | -------------------------- | -------------------------------------- |
| GET    | `/api/health`              | Backend + model status                 |
| GET    | `/api/metrics`             | Accuracy/precision/recall/F1/ROC per model |
| GET    | `/api/dataset/stats`       | Label distribution, attack timeline    |
| GET    | `/api/feature-importance`  | Top RF features                        |
| GET    | `/api/insights`            | AI-generated SOC insights              |
| POST   | `/api/predict`             | Single prediction                      |
| POST   | `/api/predict/batch`       | Batch prediction                       |
| POST   | `/api/upload`              | Upload a CSV + retrain                 |
| POST   | `/api/retrain`             | Retrain on current dataset             |
| GET    | `/api/reports/{csv,excel,pdf}` | Download reports                   |
| GET    | `/api/logs/export`         | Stream-sample CSV of recent predictions |
| WS     | `/ws/stream`               | 1Hz live inference stream              |
