# Sentinel NIDS — Python ML Backend

FastAPI + scikit-learn backend for the Sentinel AI-Powered Network Intrusion Detection System. Trains Random Forest, Decision Tree, and KNN on the CICIDS2017 dataset and exposes REST + WebSocket APIs the React dashboard consumes.

## 1. Prerequisites
- Python 3.10 or newer
- VS Code with the Python extension
- ~2 GB free disk space (the CSV is ~225 MB)

## 2. Setup (run in VS Code terminal)
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS / Linux:
source .venv/bin/activate

pip install -r requirements.txt
```

## 3. Add the dataset
Download **`Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv`** from the CICIDS2017 dataset
(https://www.unb.ca/cic/datasets/ids-2017.html) and place it here:

```
backend/data/Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv
```

## 4. Train the models
```bash
python -m app.train
```
Outputs go to `backend/artifacts/`:
- `random_forest.joblib`, `decision_tree.joblib`, `knn.joblib`
- `scaler.joblib`, `label_encoder.joblib`, `feature_names.json`
- `metrics.json` — per-model accuracy, precision, recall, F1, ROC-AUC, confusion matrix, training/prediction time, detection rate
- `dataset_stats.json` — protocol distribution, attack categories, traffic trends, flow stats
- `feature_importance.json` — Random Forest top features

## 5. Run the API
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Docs at http://localhost:8000/docs.

## 6. Endpoints
- `GET  /api/health` — backend + model status
- `GET  /api/metrics` — full model comparison (RF / DT / KNN)
- `GET  /api/dataset/stats` — protocol, attack, traffic statistics
- `GET  /api/feature-importance` — top 20 RF features
- `GET  /api/insights` — AI-generated security observations
- `POST /api/predict` — body: `{ "features": { ... } }` or `{ "model": "rf|dt|knn", "features": {...} }`
- `POST /api/predict/batch` — body: `{ "rows": [ {...}, {...} ] }`
- `GET  /api/reports/csv` · `GET /api/reports/excel` · `GET /api/reports/pdf`
- `WS   /ws/stream` — live inference stream (1 prediction/sec sampled from the test set)

## 7. Connect the frontend
The React app reads `VITE_NIDS_API_URL` (default `http://localhost:8000`). Create
`.env.local` at the project root if you want to override:
```
VITE_NIDS_API_URL=http://localhost:8000
```

When the backend is unreachable the dashboard falls back to demo values so you can develop the UI independently.
