# EDA Findings

## Dataset

- `business`: 2,997,593 transactions, 25,000 cards.
- `consumer`: 9,832,487 transactions, 80,000 cards.
- `merchant`: 2,165 merchants.
- Missing values were not found in transaction tables or merchant reference.
- Merchant merge by `merchant_id` worked without missing merchant metadata.

## Data Quality Notes

### MER_000000 MCC Conflict

`MER_000000` is `Google Ads` in the merchant reference and has reference MCC `7311`.

In transactions, the same `merchant_id` has two MCC values:

| Segment | MER_000000 rows | MCC 7311 | MCC 7012 | Share of segment |
| --- | ---: | ---: | ---: | ---: |
| Business | 63,450 | 45,749 | 17,701 | 2.1167% |
| Consumer | 87,019 | 43,869 | 43,150 | 0.8850% |

Interpretation:

- `7311` is Advertising Services and fits Google Ads.
- `7012` is Timeshares and does not fit Google Ads.
- Current EDA choice: use transaction MCC as `mcc_final`, while keeping reference MCC for quality checks.
- This conflict should be explicitly mentioned as a data quality anomaly.

## Transaction-Level Findings

### Transaction Amount

Business transactions are much larger than consumer transactions.

| Metric | Business | Consumer |
| --- | ---: | ---: |
| Mean amount | 156,535 KZT | 54,045 KZT |
| Median amount | 77,224 KZT | 11,892 KZT |
| 75th percentile | 196,081 KZT | 39,665 KZT |
| Max | 40,799,297 KZT | 31,971,032 KZT |

Conclusion:

- Business cards have substantially higher transaction amounts.
- Amount is likely one of the strongest separating signals.

### Large Transactions

| Threshold | Business share | Consumer share |
| ---: | ---: | ---: |
| >= 10,000 KZT | 84.70% | 54.01% |
| >= 50,000 KZT | 60.22% | 21.22% |
| >= 100,000 KZT | 43.70% | 11.77% |
| >= 500,000 KZT | 6.40% | 1.70% |

Conclusion:

- Business cards are much more likely to have large transactions.
- `large_txn_ratio` should be a useful feature.

### Time Behavior

Transaction-level split:

| Time bucket | Business | Consumer |
| --- | ---: | ---: |
| Weekday business hours | 64.74% | 39.97% |
| Weekday non-business hours | 22.81% | 25.23% |
| Weekend | 12.45% | 34.80% |

Card-level split:

| Time bucket | Business median | Consumer median | Business mean | Consumer mean |
| --- | ---: | ---: | ---: | ---: |
| Weekday business hours | 64.29% | 39.47% | 63.04% | 40.13% |
| Weekday non-business hours | 23.16% | 25.25% | 24.05% | 25.35% |
| Weekend | 12.41% | 35.02% | 12.91% | 34.52% |

Conclusion:

- Business cards are more active during weekday business hours.
- Consumer cards are much more active on weekends.
- The three-bucket time split is cleaner than overlapping `business_hours_ratio` and `weekend_ratio`.

### Channel

| Channel | Business | Consumer |
| --- | ---: | ---: |
| Online | 84.66% | 46.51% |
| POS | 15.34% | 53.49% |

Conclusion:

- Business transactions are much more online-heavy.
- Consumer transactions are more POS-heavy.

### Recurring Payments

| Metric | Business | Consumer |
| --- | ---: | ---: |
| Actual recurring transaction ratio | 13.34% | 2.72% |
| Recurring-capable merchant ratio | 32.13% | 6.87% |

Conclusion:

- Business cards are much more associated with recurring payments and recurring-capable merchants.
- This supports the idea that business cards are used for subscriptions, ads, software, and operational services.

## Card-Level Findings

### Transactions Per Card

| Metric | Business | Consumer |
| --- | ---: | ---: |
| Mean transactions/card | 120 | 123 |
| Median transactions/card | 119 | 120 |
| 75th percentile | 155 | 156 |
| Max | 242 | 354 |

Conclusion:

- Transaction count per card is not a strong separator.
- Business cards are not necessarily more frequent; the stronger difference is amount and spend composition.

### Total Spend Per Card

| Metric | Business | Consumer |
| --- | ---: | ---: |
| Mean total spend/card | 18,769,162 KZT | 6,642,512 KZT |
| Median total spend/card | 17,714,892 KZT | 2,976,294 KZT |
| 75th percentile | 22,885,893 KZT | 6,259,916 KZT |
| Max | 64,357,034 KZT | 170,159,026 KZT |

Conclusion:

- Business cards have much higher total spend per card.
- This is a strong card-level signal.
- The conclusion should be phrased carefully: total spend depends on both transaction count and amount, but since transaction count is similar, higher transaction amounts are the likely driver.

### Merchant Diversity Per Card

| Metric | Business | Consumer |
| --- | ---: | ---: |
| Mean unique merchants | 17 | 37 |
| Median unique merchants | 16 | 37 |
| Max unique merchants | 49 | 95 |

Conclusion:

- Consumer cards visit many more unique merchants.
- Business cards are more concentrated on fewer merchants.

### MCC Diversity Per Card

| Metric | Business | Consumer |
| --- | ---: | ---: |
| Mean unique MCC | 15 | 32 |
| Median unique MCC | 15 | 32 |
| Max unique MCC | 28 | 64 |

Conclusion:

- Consumer cards span more MCC categories.
- Business cards are more focused on a narrower set of categories.

### Recurring-Capable Merchant Ratio Per Card

| Metric | Business | Consumer |
| --- | ---: | ---: |
| Mean | 33.63% | 7.40% |
| Median | 29.41% | 3.21% |
| 75th percentile | 45.10% | 8.13% |

Conclusion:

- Business cards have a much higher share of transactions at recurring-capable merchants.
- This is a strong behavioral feature.

## MCC Findings

MCC reference was extracted from the Mastercard Quick Reference Booklet and joined to MCC distributions.

Important observed pattern:

- Business cards are overrepresented in work/service categories: IT/software, advertising, subscriptions, business services, logistics, office supplies, accounting, legal services, and telecom.
- Example: MCC `7372` appears in about 8.0% of business transactions and 0.47% of consumer transactions, around 17x more common in business.

Conclusion:

- MCC categories are among the strongest and most interpretable signals.
- For modeling, transaction-level MCC findings should become card-level ratios, for example:
  - `software_ratio`
  - `advertising_ratio`
  - `business_services_ratio`
  - `office_supplies_ratio`
  - `logistics_ratio`
  - `professional_services_ratio`

## Overall Interpretation

Business cards differ from consumer cards mainly by:

- higher transaction amounts;
- much higher total spend per card;
- more weekday business-hours activity;
- less weekend activity;
- more online transactions;
- more recurring and recurring-capable merchant usage;
- more focused merchant and MCC behavior;
- higher concentration in B2B-like MCC categories.

Consumer cards differ by:

- more POS activity;
- more weekend activity;
- broader merchant diversity;
- broader MCC diversity;
- lower transaction amounts and lower total spend per card.

## What To Analyze Next

1. Build final card-level feature table.
   - One row per `card_number`.
   - Use only card-level aggregates for modeling.

2. Add MCC category ratios per card.
   - Use `mcc_final`.
   - Convert top business-like MCC groups into ratios.

3. Add spend composition features.
   - `avg_amount`
   - `median_amount`
   - `total_amount`
   - `large_txn_ratio`
   - `max_amount`

4. Add time composition features.
   - `weekday_business_hours_ratio`
   - `weekday_non_business_hours_ratio`
   - `weekend_ratio`

5. Add channel and recurring features.
   - `online_ratio`
   - `pos_ratio`
   - `is_recurring_ratio`
   - `recurring_capable_ratio`

6. Add diversity features.
   - `unique_merchants`
   - `unique_mcc`
   - `unique_countries`
   - optionally MCC entropy and merchant entropy.

7. Run a simple baseline model first.
   - Logistic regression with scaling.
   - Then LightGBM.
   - Check which features alone have high AUC.

8. Be careful with `MER_000000`.
   - Keep it as a documented anomaly.
   - Compare model behavior with and without this merchant or add a special flag.

9. Validate no direct leakage.
   - Do not use `card_tier` as a feature if it directly identifies business cards.
   - Do not use any column that encodes the target label.

10. Prepare final explanation.
    - The final story should connect EDA hypotheses to model features.
    - Example: "Business cards spend more online during business hours in software/ads/service categories, so we built amount, time, channel, recurring, and MCC ratio features."
