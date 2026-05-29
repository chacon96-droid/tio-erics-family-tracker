const DATA_URL = "./data/leaderboard.json";
const WEIGHTS = {
  messages: 1,
  calls: 4,
  facetime: 5
};

const state = {
  records: [],
  netWorth: 1000000,
  lookback: "all"
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const percent = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1
});

const leaderboard = document.querySelector("#leaderboard");
const template = document.querySelector("#person-row-template");
const totalInteractions = document.querySelector("#total-interactions");
const netWorthInput = document.querySelector("#net-worth");
const lookbackInput = document.querySelector("#lookback");

function parseMoney(value) {
  const cleaned = String(value).replace(/[^\d.]/g, "");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function scoreRecord(record) {
  return (
    (record.messages || 0) * WEIGHTS.messages +
    (record.calls || 0) * WEIGHTS.calls +
    (record.facetime || 0) * WEIGHTS.facetime
  );
}

function isInsideLookback(record) {
  if (state.lookback === "all" || !record.lastInteraction) return true;
  const days = Number.parseInt(state.lookback, 10);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return new Date(record.lastInteraction) >= cutoff;
}

function render() {
  const filtered = state.records.filter(isInsideLookback);
  const ranked = filtered
    .map((record) => ({ ...record, score: scoreRecord(record) }))
    .filter((record) => record.score > 0)
    .sort((a, b) => b.score - a.score);

  const totalScore = ranked.reduce((sum, record) => sum + record.score, 0);
  const totalTouches = ranked.reduce(
    (sum, record) => sum + (record.messages || 0) + (record.calls || 0) + (record.facetime || 0),
    0
  );

  leaderboard.replaceChildren();
  totalInteractions.textContent = `${totalTouches.toLocaleString()} touches`;

  if (!ranked.length) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "No family interaction data has been imported yet.";
    leaderboard.append(empty);
    return;
  }

  ranked.forEach((record, index) => {
    const share = totalScore > 0 ? record.score / totalScore : 0;
    const row = template.content.firstElementChild.cloneNode(true);
    row.querySelector(".rank").textContent = index + 1;
    row.querySelector(".person-name").textContent = record.name;
    row.querySelector(".allocation").textContent = `${percent.format(share)} · ${money.format(state.netWorth * share)}`;
    row.querySelector(".bar span").style.width = `${Math.max(2, share * 100)}%`;
    row.querySelector(".person-meta").textContent =
      `${record.relationship || "Family"} · ${record.messages || 0} messages · ${record.calls || 0} calls · ${record.facetime || 0} FaceTimes`;
    leaderboard.append(row);
  });
}

async function loadData() {
  try {
    const response = await fetch(`${DATA_URL}?t=${Date.now()}`);
    if (!response.ok) throw new Error("Missing data");
    const data = await response.json();
    state.records = Array.isArray(data.people) ? data.people : [];
  } catch {
    state.records = [];
  }
  render();
}

netWorthInput.addEventListener("input", () => {
  state.netWorth = parseMoney(netWorthInput.value);
  render();
});

netWorthInput.addEventListener("blur", () => {
  netWorthInput.value = state.netWorth ? String(Math.round(state.netWorth)) : "";
});

lookbackInput.addEventListener("change", () => {
  state.lookback = lookbackInput.value;
  render();
});

document.querySelector("#refresh-button").addEventListener("click", loadData);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

loadData();
