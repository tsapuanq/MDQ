# Feature Plan

The goal is to build one row per card and describe how business-like each card looks.

EDA showed that business behavior is not just one thing. It is a mix of larger payments, more online and recurring payments, stronger work-hour behavior, foreign merchant exposure, and more concentration in work-related MCC groups.

## Modeling Unit

| Item | Decision |
| --- | --- |
| Row | one `card_number` |
| Positive examples | known business cards |
| Consumer cards | unlabeled / mixed group, not perfect negatives |
| Time window | full six-month period |
| Output | card-level feature table |

## Feature Groups

| Group | Features | Why |
| --- | --- | --- |
| Spend size | log total spend, log mean amount, log median amount, log p90 amount, large transaction ratios | business cards spend much more and have larger typical checks; log form is safer for modeling |
| Amount stability | amount std, amount cv | consumer cards had more variable amounts inside the same card |
| Channel and payment | online ratio, recurring ratio, tokenized ratio, recurring-capable merchant ratio | business cards are much more online and recurring-heavy |
| Timing | active days, transactions per active day, amount per active day, weekday business hours, weekend, evening, night | business cards are more work-hours oriented, consumer cards are more evening and weekend-heavy |
| Geography | foreign transaction ratio, foreign merchant ratio | foreign merchant exposure is much higher for business cards |
| Diversity and concentration | unique merchants, unique MCCs, merchant entropy, MCC entropy, merchant HHI, MCC HHI, top merchant share, top MCC share | consumer cards are broader, business cards are more concentrated |
| B2B MCC groups | count-based and amount-based ratios for advertising, software/cloud, business services, office supplies, telecom, logistics, professional services | these groups matched the strongest EDA differences |

## Features To Avoid

| Feature | Reason |
| --- | --- |
| `card_number` | identifier only |
| raw `merchant_id` | high-cardinality id, easy to overfit |
| raw `merchant_name` | high-cardinality text, also affected by artifacts like `MER_000000` |
| raw `mcc_name` | text label, better converted into grouped ratios |
| `active_months` as-is | almost all cards are active during all six months |
| `pos_ratio` together with `online_ratio` | they are mostly complementary, so one of them is enough |
| raw money features when log version exists | heavy-tailed and duplicated, better keep the log-transformed version |
| `weekday_non_business_hours_ratio` | duplicated by weekday business hours and weekend ratios |
| `monthly_spend_growth` | weak and noisy in EDA |
| `large_txn_10000_ratio` | too low a threshold, less useful after stronger amount features |
| `log_max_amount` | noisier than `log_p90_amount` because one extreme transaction can dominate it |

## Leakage Notes

Consumer cards may contain hidden business users, so treating every consumer card as a clean negative class is risky.

MCC group features can be strong. That is useful, but they should be validated carefully during modeling so the model does not become a hard-coded MCC lookup.

Raw merchant names and ids are not used as model features. They can be used for explanation after scoring, but not as direct inputs.

After the first model, feature correlation and feature importance should be checked. Weak or duplicated features should be removed before the final model.
