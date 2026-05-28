# ML And PU Learning Experiment Plan

The main modeling issue is label uncertainty.

Known business cards are reliable positive examples. Consumer cards are not reliable negatives because some of them may be hidden business users.

So the final approach should not rely only on a standard supervised classifier.

## Modeling Objective

The goal is not just binary classification.

The useful output is a ranked list of consumer cards:

```text
consumer card -> business-likeness score -> outreach tier -> explanation
```

## Feature Sets

Use several feature sets instead of one blind list.

### Feature Set A: Behavioral

Core behavior without detailed MCC group features.

Includes:

- log spend features
- amount stability
- large transaction ratios
- online / recurring / tokenized ratios
- timing ratios
- foreign merchant / transaction ratios
- diversity and concentration features

### Feature Set B: Behavioral + B2B MCC Count Ratios

Adds count-based MCC group ratios:

- advertising
- software/cloud
- business services
- office supplies
- telecom
- logistics
- professional services
- total B2B MCC ratio

### Feature Set C: Behavioral + B2B Count And Amount Ratios

Adds amount-based MCC group ratios too.

This set may be strongest, but also needs the most careful leakage / overfit checks.

## Baseline Models

### 1. Logistic Regression

Purpose:

- simple baseline
- interpretable coefficients
- sanity check for feature direction

Needs scaling.

### 2. Tree-Based Supervised Baseline

Options:

- Random Forest
- HistGradientBoosting
- CatBoost / LightGBM if allowed

Purpose:

- stronger supervised baseline
- feature importance
- compare with PU results

Important note:

This baseline treats consumer as negative, which is not fully correct. It is only a reference point.

## Main PU Approaches

### 1. PU Bagging

This is the main practical PU model.

Idea:

- business cards are positives
- consumer cards are unlabeled
- repeatedly sample consumer cards as temporary negatives
- train many classifiers
- average scores

Why it fits:

- does not assume all consumer cards are true negatives
- gives a stable ranking
- handles non-linear behavior if the base model is tree-based

### 2. Reliable Negative PU

Two-step approach.

Step 1:

- train an initial model
- identify consumer cards with very low business-like score
- treat them as reliable negatives

Step 2:

- train final model on known business positives vs reliable negatives
- score all consumer cards

Why it fits:

- easy to explain
- creates cleaner negative set
- useful comparison to bagging PU

### 3. Spy Validation

Use this for validation and threshold selection.

Idea:

- hide part of known business cards inside the unlabeled pool
- train the model without their labels
- check whether the hidden business cards are ranked high

Useful metrics:

- recall@K
- lift@K
- rank percentile of hidden positives

## Validation Design

Split at card level.

Recommended:

```text
business_train
business_valid
consumer_train / consumer_background
consumer_valid / consumer_scoring_pool
```

The model should not see `business_valid` during training.

Evaluation should ask:

- are held-out business cards ranked above consumer background?
- are top consumer candidates business-like by feature profile?
- are results stable across random splits?

## Metrics

For supervised baseline:

- confusion matrix
- ROC-AUC
- PR-AUC
- precision
- recall
- F1

For PU / ranking:

- held-out positive recall@K
- lift@K
- average rank percentile of held-out positives
- score distribution
- top-N stability

## Feature Selection After First Model

After the first modeling pass:

1. Check feature correlations.
2. Check model feature importance.
3. Check permutation importance or SHAP if available.
4. Remove weak or duplicated features.
5. Compare Feature Sets A/B/C.

Examples of possible duplicate checks:

- highly correlated amount features
- highly correlated HHI and top-share features
- count-based MCC ratios vs amount-based MCC ratios
- timing ratios that reconstruct each other

## Final Score

Best final approach:

```text
final_score = rank ensemble of PU bagging + reliable-negative PU + supervised baseline score
```

Use rank percentiles instead of raw probabilities if calibrations differ between models.

## Final Output

Consumer scoring table:

| Column | Meaning |
| --- | --- |
| `card_number` | consumer card id |
| `business_score` | final business-likeness score |
| `score_rank` | rank among consumer cards |
| `tier` | outreach priority |
| `top_reason_1..3` | explanation |
| key feature values | profile support |

## Model Choice Explanation

Good final wording:

> A supervised model is used as a baseline, but the main approach is Positive-Unlabeled learning. Business cards are reliable positives, while consumer cards are unlabeled and may contain hidden business users. PU learning fits this setting because it ranks consumer cards by similarity to known business behavior without assuming that every consumer card is a true negative.

This directly supports the model-choice criterion and the creativity/depth criterion.
