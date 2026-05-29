# Models

This folder contains the working ML experiments.

The final submission can later reuse the clean parts in one final notebook.

## Input

- `data/processed/card_features.parquet`

One row is one card.

## Current Flow

- `00_model_plan.md`: short modeling plan.
- `01_baseline_supervised.ipynb`: supervised benchmark with `business=1` and `consumer=0`.
- `02_pu_learning.ipynb`: PU-learning ranking with business cards as positives and consumer cards as unlabeled background.
- `03_pu_experiments.ipynb`: PU feature/model/hyperparameter experiments, including `pulearn` package methods.

## Baseline Output

The baseline notebook writes:

- `data/processed/card_features_with_split.parquet`
- `data/processed/baseline_scores.parquet`
- `data/processed/baseline_consumer_scores.parquet`
- `data/processed/baseline_model_comparison.csv`
- `data/processed/baseline_test_metrics.csv`

The baseline probability is kept as `supervised_business_prob`.

This is not the final business score. It is a reference score for later comparison with PU learning.

## PU Output

The PU notebook writes:

- `data/processed/pu_scores.parquet`
- `data/processed/pu_consumer_scores.parquet`
- `data/processed/pu_top_candidates.csv`
- `data/processed/pu_validation_metrics.csv`
- `data/processed/pu_tier_summary.csv`
- `data/processed/pu_top_candidate_transaction_profiles.csv`

The main consumer ranking columns are:

- `pu_business_score`
- `business_like_percent`
- `tier`
- `pu_reasons`

`business_like_percent` is a consumer percentile score, not a calibrated probability of owning a business.

## PU Experiment Output

The experiment notebook writes:

- `data/processed/pu_custom_experiment_results.csv`
- `data/processed/pu_pulearn_experiment_results.csv`
- `data/processed/pu_experiment_leaderboard.csv`
- `data/processed/pu_best_config.json`
- `data/processed/pu_best_experiment_scores.parquet`
- `data/processed/pu_best_experiment_consumer_scores.csv`
- `data/processed/pu_best_experiment_top_candidates.csv`
- `data/processed/pu_best_experiment_profile_summary.csv`

The experiment compares custom PU bagging/reliable-negative logic with `pulearn` methods:

- `BaggingPuClassifier`
- `ElkanotoPuClassifier`
- `WeightedElkanotoPuClassifier`
- `NNPUClassifier`

The final choice should not be based on AUC alone. Use top-k precision/lift, feature-set robustness, and whether top candidates have a clear business-like profile.
