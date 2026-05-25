from __future__ import annotations

from pathlib import Path

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[1]
RAW_DIR = PROJECT_ROOT / "data" / "raw"

BUSINESS_CARDS_FILE = "business_cards_MDQ.parquet"
CONSUMER_CARDS_FILE = "consumer_cards_MDQ.parquet"
MERCHANTS_FILE = "merchants_reference.parquet"
MCC_FILE = "mcc.csv"


def load_data(raw_dir: str | Path = RAW_DIR) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """Load the raw project datasets.

    Returns:
        business, consumer, merchants, mcc
    """
    raw_path = Path(raw_dir)

    business = pd.read_parquet(raw_path / BUSINESS_CARDS_FILE, engine="fastparquet")
    consumer = pd.read_parquet(raw_path / CONSUMER_CARDS_FILE, engine="fastparquet")
    merchants = pd.read_parquet(raw_path / MERCHANTS_FILE, engine="fastparquet")
    mcc = pd.read_csv(raw_path / MCC_FILE)

    return business, consumer, merchants, mcc


__all__ = ["PROJECT_ROOT", "RAW_DIR", "load_data"]
