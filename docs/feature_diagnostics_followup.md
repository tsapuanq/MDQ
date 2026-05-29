# Feature Diagnostics Follow-Up

Feature diagnostics were added in `models/01_baseline_supervised.ipynb`.

The goal is not to delete columns only because one model gives low importance. A feature should be removed only when several checks agree.

## Current Checks

For each feature we check:

- number of unique values
- standard deviation
- business median vs consumer median
- single-feature AUC
- maximum absolute correlation with another feature
- Logistic Regression absolute coefficient
- Random Forest feature importance

The output is saved to:

```text
data/processed/baseline_feature_diagnostics.csv
```

## Current Result

Only one clear drop candidate was found:

```text
txn_count
```

Reason:

- almost no standalone separation
- business and consumer medians are almost the same
- low model importance
- mostly activity volume, not business behavior

## Review Later

These features are not obvious trash, but they are duplicated enough to review after PU learning:

- `merchant_hhi` vs `mcc_hhi`
- `merchant_entropy` vs `mcc_entropy`
- `top_merchant_share` vs `top_mcc_share`
- `top_merchant_amount_share` vs `top_mcc_amount_share`
- `log_avg_amount` vs `log_amount_per_active_day`
- `log_p90_amount` vs large transaction ratios
- count-based MCC ratios vs amount-based MCC ratios

## Decision For Now

Do not aggressively delete features before PU learning.

Use the diagnostics as a review list after:

1. supervised baseline,
2. PU learning,
3. top candidate inspection,
4. feature stability / importance check.

The final feature set should keep features that are stable, interpretable, and useful for ranking hidden business-like consumer cards.
