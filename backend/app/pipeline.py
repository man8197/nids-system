"""Data preprocessing pipeline for the CICIDS2017 dataset."""
from __future__ import annotations

import os
from pathlib import Path
from typing import Tuple

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
ARTIFACT_DIR = Path(__file__).resolve().parent.parent / "artifacts"
ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)

DEFAULT_CSV = "Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv"
LABEL_COL = "Label"


def find_dataset() -> Path:
    target = DATA_DIR / DEFAULT_CSV
    if target.exists():
        return target
    # fallback: any CSV in data/
    csvs = list(DATA_DIR.glob("*.csv"))
    if not csvs:
        raise FileNotFoundError(
            f"No dataset found. Place {DEFAULT_CSV} in {DATA_DIR}."
        )
    return csvs[0]


def load_raw(path: Path | None = None) -> pd.DataFrame:
    path = path or find_dataset()
    df = pd.read_csv(path, low_memory=False)
    df.columns = [c.strip() for c in df.columns]
    return df


def clean(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    # normalize label column name (CICIDS sometimes ships ' Label')
    label_candidates = [c for c in df.columns if c.lower().strip() == "label"]
    if not label_candidates:
        raise ValueError("Label column not found in dataset")
    df.rename(columns={label_candidates[0]: LABEL_COL}, inplace=True)

    # replace inf and drop NaN
    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    df.dropna(inplace=True)

    # remove duplicates
    df.drop_duplicates(inplace=True)

    # drop non-numeric flow id / ip / timestamp style cols if present
    drop_cols = [c for c in df.columns if c.lower() in {
        "flow id", "source ip", "src ip", "destination ip", "dst ip",
        "timestamp", "fwd header length.1",
    }]
    df.drop(columns=drop_cols, inplace=True, errors="ignore")

    # cast object -> numeric where possible
    for c in df.columns:
        if c == LABEL_COL:
            continue
        if df[c].dtype == object:
            df[c] = pd.to_numeric(df[c], errors="coerce")
    df.dropna(inplace=True)
    return df


def outlier_clip(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    num = df.select_dtypes(include=[np.number]).columns
    q1 = df[num].quantile(0.01)
    q99 = df[num].quantile(0.99)
    df[num] = df[num].clip(lower=q1, upper=q99, axis=1)
    return df


def split_and_scale(df: pd.DataFrame, test_size: float = 0.25, sample: int | None = 120_000):
    if sample and len(df) > sample:
        df = df.sample(sample, random_state=42)

    y_raw = df[LABEL_COL].astype(str).str.strip()
    X = df.drop(columns=[LABEL_COL]).select_dtypes(include=[np.number])

    le = LabelEncoder()
    y = le.fit_transform(y_raw)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s = scaler.transform(X_test)

    return {
        "X_train": X_train_s,
        "X_test": X_test_s,
        "y_train": y_train,
        "y_test": y_test,
        "scaler": scaler,
        "label_encoder": le,
        "feature_names": list(X.columns),
        "raw_test_labels": y_raw.iloc[y_test.shape[0] * -1 :]
            if False else None,  # not used
    }


def full_pipeline() -> Tuple[dict, pd.DataFrame]:
    df = load_raw()
    df = clean(df)
    df = outlier_clip(df)
    bundle = split_and_scale(df)
    return bundle, df
