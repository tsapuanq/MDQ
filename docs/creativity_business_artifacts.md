# Creativity And Business Artifacts

These ideas are not extra decoration. They are ways to turn the model into something a bank could actually use.

## Main Idea: Hidden Business Lead Dashboard

The strongest artifact is a small lead dashboard for hidden business-like consumer cards.

The model should not only output `0/1`. It should produce a ranked list:

| Output | Meaning |
| --- | --- |
| `card_number` | candidate card id |
| `business_score` | how business-like the card looks |
| `tier` | outreach priority |
| `top_reason_1..3` | why the card was selected |
| key feature values | online, recurring, foreign merchant, B2B MCC, weekend/evening, spend |

## Dashboard Sections

### 1. Overview

Shows the size of the opportunity.

- total consumer cards scored
- high-confidence candidates
- campaign candidates
- watchlist
- score distribution
- tier distribution

### 2. Lead List

A sortable table of top candidates.

Useful columns:

- card number
- business score
- tier
- main reasons
- estimated business value proxy
- recommended action

### 3. Candidate Profile

When selecting one card, show why it was ranked high.

Profile blocks:

- online ratio
- recurring ratio
- foreign merchant ratio
- B2B MCC ratio
- weekday business hours ratio
- weekend/evening ratio
- log spend features
- top MCC groups
- top merchants for explanation only

### 4. Business Actions

Map model tiers to real actions:

| Tier | Action |
| --- | --- |
| High confidence | relationship manager outreach |
| Campaign candidate | SME card / business account campaign |
| Watchlist | monitor next month |
| Low score | no action |

## Business Value Story

The solution is not only a classifier. It creates an actionable SME lead discovery workflow.

The bank can use it to:

- prioritize consumer cards that behave like micro-businesses
- reduce manual screening
- target SME banking offers better
- support relationship managers with explainable reasons
- test campaigns on high-confidence leads first

## Alternative Artifact: HTML Candidate Report

If a live dashboard is too much, generate a static HTML report:

- score distribution
- tier summary
- top 50 candidates
- explanation table
- feature profile charts

This is easier to share in a final presentation and does not require running a server.

## Presentation Angle

Good wording:

> Instead of stopping at classification metrics, we convert model scores into an actionable lead discovery workflow. The dashboard ranks hidden business-like consumer cards, explains why each card was selected, and maps candidates to outreach tiers.

This supports the creativity and business-depth criterion because it connects ML output to a real banking action.
