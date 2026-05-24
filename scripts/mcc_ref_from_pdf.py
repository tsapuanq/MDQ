import re
import pandas as pd
import pdfplumber
from pathlib import Path

pdf_path = Path("/Users/sapuantalaspay/vs_projects/data/data/raw/mastercard-quick-reference-booklet-merchant.pdf")
output_path = Path("/Users/sapuantalaspay/vs_projects/data/data/raw/mcc.csv")


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
                "page": page_num
            })

mcc_dict_df = pd.DataFrame(rows)

# убираем пустые/битые названия
mcc_dict_df = mcc_dict_df[
    mcc_dict_df["mcc_name"].notna()
    & (mcc_dict_df["mcc_name"].str.len() > 0)
].copy()

# если один MCC встретился несколько раз, оставляем самый длинный вариант названия
# обычно он информативнее, чем короткая строка из оглавления
mcc_dict_df["name_len"] = mcc_dict_df["mcc_name"].str.len()

mcc_dict_df = (
    mcc_dict_df
    .sort_values(["mcc", "name_len"], ascending=[True, False])
    .drop_duplicates(subset=["mcc"], keep="first")
    .drop(columns=["name_len"])
    .sort_values("mcc")
    .reset_index(drop=True)
)

# сохраняем без лишнего Unnamed: 0
mcc_dict_df.to_csv(output_path, index=False)

print(f"Saved MCC dictionary to: {output_path}")
print(f"Rows: {len(mcc_dict_df)}")
print(f"Unique MCC: {mcc_dict_df['mcc'].nunique()}")

mcc_dict_df.head(20)