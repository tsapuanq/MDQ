import re
import pandas as pd
import pdfplumber
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
pdf_path = PROJECT_ROOT / "data" / "external" / "mastercard-quick-reference-booklet-merchant.pdf"
output_path = PROJECT_ROOT / "data" / "clean" / "mcc.csv"
business_path = PROJECT_ROOT / "data" / "raw" / "business_cards_MDQ.parquet"
consumer_path = PROJECT_ROOT / "data" / "raw" / "consumer_cards_MDQ.parquet"

MCC_RANGES = [
    (3000, 3350, "Airlines, Air Carriers"),
    (3351, 3500, "Car Rental Agencies"),
    (3501, 3999, "Lodging: Hotels, Motels, Resorts"),
]


def clean_mcc_name(name: str) -> str:
    """
    Cleans MCC name extracted from Mastercard PDF.
    Removes dotted leaders, trailing page numbers, excessive spaces.
    """
    name = str(name)

    # убираем точки из оглавления типа:
    # Advertising Services........................................173
    name = re.sub(r"\.{3,}\s*\d*$", "", name)

    # убираем просто номер страницы в конце, если он остался
    # например: "Advertising Services 173"
    name = re.sub(r"\s+\d{1,4}$", "", name)

    # убираем лишние пробелы
    name = re.sub(r"\s+", " ", name).strip()

    return name


rows = []

for start, end, name in MCC_RANGES:
    for mcc in range(start, end + 1):
        rows.append({
            "mcc": mcc,
            "mcc_name": name,
            "page": None,
            "source": "manual_range",
        })

with pdfplumber.open(pdf_path) as pdf:
    for page_num, page in enumerate(pdf.pages, start=1):
        text = page.extract_text() or ""

        # ловим строки формата:
        # MCC 7372: Computer Programming, Data Processing...
        matches = re.findall(r"\bMCC\s+(\d{4}):\s+(.+)", text)

        for mcc, name in matches:
            clean_name = clean_mcc_name(name)

            rows.append({
                "mcc": int(mcc),
                "mcc_name": clean_name,
                "page": page_num,
                "source": "pdf_exact",
            })

mcc_dict_df = pd.DataFrame(rows)

# убираем пустые/битые названия
mcc_dict_df = mcc_dict_df[
    mcc_dict_df["mcc_name"].notna()
    & (mcc_dict_df["mcc_name"].str.len() > 0)
].copy()

mcc_dict_df["name_len"] = mcc_dict_df["mcc_name"].str.len()

mcc_dict_df = (
    mcc_dict_df
    .assign(source_priority=lambda df: df["source"].map({"pdf_exact": 0, "manual_range": 1}).fillna(9))
    .sort_values(["mcc", "source_priority", "name_len"], ascending=[True, True, False])
    .drop_duplicates(subset=["mcc"], keep="first")
    .drop(columns=["name_len", "source_priority"])
    .sort_values("mcc")
    .reset_index(drop=True)
)

data_mcc = pd.concat([
    pd.read_parquet(business_path, columns=["mcc"], engine="fastparquet")["mcc"],
    pd.read_parquet(consumer_path, columns=["mcc"], engine="fastparquet")["mcc"],
]).astype(str).str.zfill(4)

known_mcc = set(mcc_dict_df["mcc"].astype(str).str.zfill(4))
missing_mcc = sorted(set(data_mcc) - known_mcc)

if missing_mcc:
    other_rows = pd.DataFrame({
        "mcc": [int(code) for code in missing_mcc],
        "mcc_name": [f"Other MCC {code}" for code in missing_mcc],
        "page": None,
        "source": "other_from_data",
    })
    mcc_dict_df = (
        pd.concat([mcc_dict_df, other_rows], ignore_index=True)
        .sort_values("mcc")
        .reset_index(drop=True)
    )

# сохраняем без лишнего Unnamed: 0
mcc_dict_df.to_csv(output_path, index=False)

print(f"Saved MCC dictionary to: {output_path}")
print(f"Rows: {len(mcc_dict_df)}")
print(f"Unique MCC: {mcc_dict_df['mcc'].nunique()}")
print(f"Other MCC from data: {len(missing_mcc)}")

mcc_dict_df.head(20)
