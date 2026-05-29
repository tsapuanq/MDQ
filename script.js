const data = window.DASHBOARD_DATA;

const fmtInt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const fmtPct = new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 });
const fmtScore = new Intl.NumberFormat("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 4 });

function tierLabel(tier) {
  return tier
    .replace("tier_1_high_confidence", "Tier 1 high confidence")
    .replace("tier_2_campaign_candidate", "Tier 2 campaign")
    .replace("tier_3_watchlist", "Tier 3 watchlist")
    .replace("tier_4_no_action", "Tier 4 no action");
}

function bar(containerId, rows, labelKey, valueKey, options = {}) {
  const node = document.getElementById(containerId);
  const max = Math.max(...rows.map((row) => Number(row[valueKey] || 0)), 1);
  const color = options.color || "";
  node.innerHTML = rows.map((row) => {
    const value = Number(row[valueKey] || 0);
    const width = Math.max(1, (value / max) * 100);
    const label = options.label ? options.label(row) : row[labelKey];
    return `
      <div class="barRow">
        <span>${label}</span>
        <div class="track"><div class="fill ${color}" style="width:${width}%"></div></div>
        <strong>${fmtInt.format(value)}</strong>
      </div>
    `;
  }).join("");
}

function renderTopTable() {
  const tbody = document.querySelector("#topTable tbody");
  tbody.innerHTML = data.top10.map((row) => `
    <tr>
      <td>${row.card_number}</td>
      <td>${fmtScore.format(row.business_like_percent)}</td>
      <td>${row.pu_reasons}</td>
      <td>${row.top_merchants}</td>
      <td>${row.recommended_action}</td>
    </tr>
  `).join("");
}

function renderRisk() {
  const node = document.getElementById("riskList");
  node.innerHTML = data.risk.map((row) => `
    <article class="risk">
      <strong>${row.risk_type}: ${row.example}</strong>
      <div>${row.why_it_matters}</div>
      <div>Mitigation: ${row.mitigation}</div>
    </article>
  `).join("");
}

function init() {
  const tier1 = data.tiers.find((row) => row.tier === "tier_1_high_confidence");
  document.getElementById("tier1Count").textContent = fmtInt.format(tier1.cards);
  document.getElementById("baselineF1").textContent = fmtScore.format(data.baseline.f1);
  document.getElementById("puLift").textContent = `${fmtScore.format(data.puTest["lift_at_1.0%"])}x`;

  const tierOrder = [
    "tier_1_high_confidence",
    "tier_2_campaign_candidate",
    "tier_3_watchlist",
    "tier_4_no_action",
  ];
  const tiers = [...data.tiers].sort((a, b) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier));
  bar("tierBars", tiers, "tier", "cards", {
    color: "green",
    label: (row) => `${tierLabel(row.tier)} (${fmtPct.format(row.share_of_consumer_cards * 100)}%)`,
  });

  bar("bankBars", data.bank.slice(0, 10), "bank_name", "tier_1_high_confidence", { color: "orange" });
  bar("cardTierBars", data.cardTier, "card_tier", "tier_1_high_confidence", { color: "red" });

  renderTopTable();
  renderRisk();
}

init();
