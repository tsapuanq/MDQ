# Model Plan

The modeling target is hidden business-like behavior inside consumer cards.

Known business cards are reliable positives. Consumer cards are used as negatives only for the supervised baseline, but in the real problem they are unlabeled because some of them may be hidden business users.

## Baseline

The first model is a supervised benchmark:

```text
business = 1
consumer = 0
```

This baseline is useful for:

- train/validation/test discipline
- confusion matrix and standard metrics
- model comparison
- feature importance
- a reference probability for comparison with PU scores
- multi-method sanity checks before PU:
  supervised probability, consumer anomaly score, and distance to the business centroid

It should not be treated as the final solution.

## Split

Use one stable card-level split:

| Split | Share |
| --- | ---: |
| train | 60% |
| validation | 20% |
| test | 20% |

The split is stratified by `label`.

## Baseline Models

Compare:

- Logistic Regression
- Random Forest

Compare two feature sets:

- behavior features without detailed MCC groups
- full feature set with B2B MCC group ratios

Validation is used to choose the best model and threshold. Test is used once for the final baseline metrics.

## Metrics

Baseline metrics:

- ROC-AUC
- PR-AUC
- precision
- recall
- F1
- confusion matrix

Baseline sanity checks:

- top consumer candidates by supervised probability
- top consumer candidates by baseline ensemble score
- overlap between supervised / anomaly / distance methods
- overlap between baseline ensemble top cards and final PU top cards

If the supervised baseline looks too strong, that is not enough to stop. Consumer cards are not guaranteed clean negatives, so PU learning is still needed.

## PU Experiments

Run PU experiments after the baseline and the first PU notebook.

Compare feature sets:

- `behavior`
- `b2b_core`
- `full_no_online`
- `full`

Compare custom PU parameters:

- `negative_ratio`: 0.5, 1.0, 2.0
- `reliable_negative_quantile`: 0.2, 0.3, 0.4

Compare `pulearn` package methods:

- `BaggingPuClassifier`
- `ElkanotoPuClassifier`
- `WeightedElkanotoPuClassifier`
- `NNPUClassifier`

Selection logic:

- prefer high top-k precision and lift, especially top 0.1% and top 0.5%
- check PR-AUC and ROC-AUC on held-out business recovery
- prefer `full_no_online` over `full` when metrics are equal, because it reduces shortcut risk
- inspect top-candidate profile before calling the model final

The winning experiment is still a ranking model, not a calibrated probability model.
