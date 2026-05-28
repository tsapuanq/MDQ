# Feature Engineering

This folder turns the EDA findings into a card-level feature table.

The modeling unit is one `card_number`. Transactions are only used to describe card behavior over the six-month window.

## Files

- `00_feature_plan.md` explains which feature groups are used and why.
- `01_build_features.ipynb` builds business and consumer card-level features.
- `02_feature_checks.ipynb` checks that the final feature table is usable for modeling.

## Output

The build notebook writes:

- `data/processed/business_card_features.parquet`
- `data/processed/consumer_card_features.parquet`
- `data/processed/card_features.parquet`

The final model should use the feature columns, not raw identifiers like `card_number`, `merchant_id`, or `merchant_name`.

Money features are stored in log form when a log version exists, so the table does not keep duplicate raw money columns.
