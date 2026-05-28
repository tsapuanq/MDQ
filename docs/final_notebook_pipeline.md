# Final Notebook Pipeline

The final submission is expected to be one notebook and a presentation.

The current folders `EDA/`, `features/`, and later `models/` are working material. The final notebook should be shorter and cleaner. It should tell one story from data to business action.

## Final Notebook Structure

### 1. Problem Statement

Explain the task in business terms:

- we have known business cards
- we have consumer cards
- some consumer cards may behave like hidden businesses
- the goal is to rank consumer cards by business-likeness

### 2. Data Loading

Load:

- business transactions
- consumer transactions
- merchant reference
- MCC reference

Show only key shapes and date range.

### 3. Data Quality Summary

Keep this short.

Must include:

- no duplicate rows
- no missing values in key fields
- no card overlap between business and consumer
- merchant join coverage
- MCC reference coverage
- `MER_000000 + MCC 7012` artifact decision

### 4. Key EDA Insights

Do not include every EDA plot.

Show only the strongest points:

- business transactions are larger
- business cards are more online-heavy
- business cards have more recurring / recurring-capable behavior
- business cards are more work-hours oriented
- consumer cards are more weekend/evening-heavy
- business cards have much higher foreign merchant exposure
- business cards are more concentrated in B2B MCC groups

Use 4-6 clean plots or tables.

### 5. Feature Engineering

Explain that the model uses one row per card.

Feature groups:

- log spend features
- amount stability
- large transaction ratios
- channel/payment ratios
- timing ratios
- geography ratios
- diversity/concentration
- B2B MCC count and amount ratios

Also mention removed features:

- raw money duplicates when log version exists
- `pos_ratio` because it duplicates `online_ratio`
- `weekday_non_business_hours_ratio` because timing buckets sum to 1
- `active_months` because it is almost constant
- raw `merchant_id` and `merchant_name`

### 6. Modeling Choice

Explain why regular supervised learning is not enough:

- business cards are known positives
- consumer cards are unlabeled, not guaranteed negatives
- hidden businesses may exist inside consumer cards

Use supervised learning as baseline, but PU learning / ranking as the main approach.

### 7. Validation Strategy

Use card-level split.

Recommended:

- hold out part of known business cards
- train on remaining business + consumer background
- evaluate whether held-out business cards are ranked high
- compare against supervised baseline

Metrics:

- confusion matrix for supervised baseline
- ROC-AUC / PR-AUC for baseline comparison
- recall@K or lift@K for held-out positive recovery
- top-N profile sanity checks

### 8. Model Experiments

Show a compact comparison:

| Model | Feature set | Validation idea | Result |
| --- | --- | --- | --- |
| Logistic Regression | behavior only | supervised baseline | baseline |
| Tree model | full feature set | supervised baseline | stronger baseline |
| PU Bagging | full feature set | held-out positive recovery | main ranking |
| Reliable-negative PU | full feature set | held-out positive recovery | comparison |

### 9. Final Scoring

Score all consumer cards.

Output:

- `card_number`
- `business_score`
- `tier`
- top reasons
- key feature values

Tiers should be business-facing:

- high confidence
- campaign candidate
- watchlist
- no action

### 10. Explainability

Explain top candidates with:

- feature importance / SHAP if available
- reason table for each candidate
- comparison to median business and median consumer profile

Use top merchants only for explanation, not as raw model features.

### 11. Business Recommendations

Translate scores into action:

- top candidates for SME outreach
- campaign candidates for digital SME products
- monitor lower-confidence cards
- validate with real customer response data later

### 12. Limitations

Be honest:

- consumer labels are unknown
- PU scores are ranking scores, not proof of business ownership
- external MCC names are used for interpretability
- thresholds should be calibrated with business capacity or future response labels

## What Not To Put In Final Notebook

- every EDA graph
- long `.describe()` outputs
- raw debugging cells
- every intermediate feature decision
- long tables of all MCCs
- messy outputs from old experiments

The final notebook should look like a clean decision record, not a working scratchpad.
