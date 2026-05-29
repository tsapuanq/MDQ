const data = window.DASHBOARD_DATA;

const fmtInt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const fmtPct = new Intl.NumberFormat("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const fmtPctTiny = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 3 });
const fmtScore = new Intl.NumberFormat("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 4 });
const fmtMoney = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

function tierLabel(tier) {
  return tier
    .replace("tier_1_high_confidence", "Tier 1 high confidence")
    .replace("tier_2_campaign_candidate", "Tier 2 campaign")
    .replace("tier_3_watchlist", "Tier 3 watchlist")
    .replace("tier_4_no_action", "Tier 4 no action");
}

function featureLabel(value) {
  return String(value)
    .replaceAll("_", " ")
    .replace("mcc b2b", "B2B MCC")
    .replace("pr auc", "PR-AUC")
    .replace("roc auc", "ROC-AUC");
}

function methodLabel(value) {
  return String(value)
    .replace("custom_bagging_reliable_negative_logreg", "custom PU + reliable negative")
    .replace("pulearn_bagging_lr", "pulearn BaggingPU")
    .replace("pulearn_elkanoto_lr", "pulearn Elkanoto")
    .replace("pulearn_weighted_elkanoto_lr", "pulearn Weighted Elkanoto")
    .replace("pulearn_nnpu", "pulearn NNPU");
}

function bar(containerId, rows, label, value, options = {}) {
  const node = document.getElementById(containerId);
  const values = rows.map((row) => Number(value(row) || 0));
  const max = Math.max(...values, 1);
  const color = options.color || "";

  node.innerHTML = rows.map((row) => {
    const raw = Number(value(row) || 0);
    const width = Math.max(1, (raw / max) * 100);
    return `
      <div class="barRow">
        <span>${label(row)}</span>
        <div class="track"><div class="fill ${color}" style="width:${width}%"></div></div>
        <strong>${options.format ? options.format(raw, row) : fmtInt.format(raw)}</strong>
      </div>
    `;
  }).join("");
}

function renderFeatureEvidence() {
  bar(
    "featureBars",
    data.featureEvidence.slice(0, 10),
    (row) => `${featureLabel(row.feature)} · ${row.direction}`,
    (row) => row.single_feature_auc,
    {
      color: "green",
      format: (value) => fmtScore.format(value),
    },
  );
}

function renderProfile() {
  const keep = new Set([
    "mcc_b2b_total_amount_ratio",
    "foreign_merchant_ratio",
    "recurring_capable_ratio",
    "mcc_b2b_total_ratio",
    "online_ratio",
    "weekend_ratio",
    "evening_ratio",
    "top_merchant_share",
  ]);
  const rows = data.profileSummary
    .filter((row) => keep.has(row.feature))
    .map((row) => ({
      ...row,
      displayValue: ["weekend_ratio", "evening_ratio"].includes(row.feature)
        ? 1 - row.top_100_median
        : row.top_100_median,
      displayName: ["weekend_ratio", "evening_ratio"].includes(row.feature)
        ? `low ${featureLabel(row.feature)}`
        : featureLabel(row.feature),
    }));

  bar(
    "profileBars",
    rows,
    (row) => row.displayName,
    (row) => row.displayValue,
    {
      color: "orange",
      format: (value, row) => `${fmtPct.format(value * 100)}%`,
    },
  );
}

function renderReasons() {
  bar(
    "reasonBars",
    data.reasonCounts,
    (row) => row.reason,
    (row) => row.cards,
    { color: "blue" },
  );
}

function renderModelTables() {
  const modelBody = document.querySelector("#modelTable tbody");
  modelBody.innerHTML = data.modelComparison.slice(0, 6).map((row) => `
    <tr>
      <td>${methodLabel(row.model_name)}</td>
      <td>${featureLabel(row.feature_set)}</td>
      <td>${fmtScore.format(row.val_f1)}</td>
      <td>${fmtScore.format(row.val_pr_auc)}</td>
    </tr>
  `).join("");

  const experimentBody = document.querySelector("#experimentTable tbody");
  experimentBody.innerHTML = data.puExperiments.slice(0, 6).map((row) => `
    <tr>
      <td>${methodLabel(row.method)}</td>
      <td>${featureLabel(row.feature_set)}</td>
      <td>${fmtScore.format(row["test_pr_auc_vs_background"])}</td>
      <td>${fmtPctTiny.format(row["test_precision_at_0.5%"] * 100)}%</td>
    </tr>
  `).join("");
}

function renderTierBars() {
  const tierOrder = [
    "tier_1_high_confidence",
    "tier_2_campaign_candidate",
    "tier_3_watchlist",
    "tier_4_no_action",
  ];
  const tiers = [...data.tiers].sort((a, b) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier));
  bar(
    "tierBars",
    tiers,
    (row) => `${tierLabel(row.tier)} (${fmtPctTiny.format(row.share_of_consumer_cards * 100)}%)`,
    (row) => row.cards,
    { color: "green" },
  );
}

function renderOverlap() {
  bar(
    "overlapBars",
    data.baselinePuOverlap,
    (row) => `Top ${fmtPctTiny.format(row.top_share * 100)}% · PU vs supervised`,
    (row) => row.pu_vs_supervised_overlap_rate,
    {
      color: "red",
      format: (value) => `${fmtPct.format(value * 100)}%`,
    },
  );
}

function renderTopTable() {
  const tbody = document.querySelector("#topTable tbody");
  tbody.innerHTML = data.top10.map((row) => `
    <tr>
      <td>${row.card_number}</td>
      <td>${fmtScore.format(row.business_like_percent)}</td>
      <td>${row.pu_reasons}</td>
      <td>${row.top_merchants}<br><small>Total spend: ${fmtMoney.format(row.total_spend)} KZT</small></td>
      <td>${row.recommended_action}</td>
    </tr>
  `).join("");
}

function renderPortfolioChecks() {
  bar(
    "bankBars",
    data.bank.slice(0, 10),
    (row) => row.bank_name,
    (row) => row.tier_1_high_confidence,
    { color: "orange" },
  );
  bar(
    "cardTierBars",
    data.cardTier,
    (row) => row.card_tier,
    (row) => row.tier_1_high_confidence,
    { color: "red" },
  );
}

function renderRisk() {
  const node = document.getElementById("riskList");
  node.innerHTML = data.risk.map((row) => `
    <article class="risk">
      <strong>${featureLabel(row.risk_type)} · ${row.example}</strong>
      <div>${row.why_it_matters}</div>
      <div>Mitigation: ${row.mitigation}</div>
    </article>
  `).join("");
}

function init() {
  const tier1 = data.tiers.find((row) => row.tier === "tier_1_high_confidence");
  const overlapTop1 = data.baselinePuOverlap.find((row) => Number(row.top_share) === 0.01);

  document.getElementById("tier1Count").textContent = fmtInt.format(tier1.cards);
  document.getElementById("baselineF1").textContent = fmtScore.format(data.baseline.f1);
  document.getElementById("puPrauc").textContent = fmtScore.format(data.puTest.pr_auc_vs_background);
  document.getElementById("puLift").textContent = `${fmtScore.format(data.puTest["lift_at_1.0%"])}x`;
  document.getElementById("overlapTop1").textContent = `${fmtPct.format(overlapTop1.pu_vs_supervised_overlap_rate * 100)}%`;
  document.getElementById("bestPuMethod").textContent = methodLabel(data.bestPuConfig.method);
  document.getElementById("bestPuFeatureSet").textContent = featureLabel(data.bestPuConfig.feature_set);

  renderFeatureEvidence();
  renderProfile();
  renderReasons();
  renderModelTables();
  renderTierBars();
  renderOverlap();
  renderTopTable();
  renderPortfolioChecks();
  renderRisk();
}

init();
