// =========================
// STORAGE
// =========================
const STORAGE_KEY = "transactions";

function loadTransactions() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Erro ao carregar localStorage", err);
    return [];
  }
}

function saveTransactions(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

let transactions = loadTransactions();

// =========================
// FORMATTER
// =========================
const fmt = (v) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);

// =========================
// DOM ELEMENTS
// =========================
const form = document.getElementById("tx-form");
const dateEl = document.getElementById("date");
const typeEl = document.getElementById("type");
const descEl = document.getElementById("desc");
const catEl = document.getElementById("category");
const valueEl = document.getElementById("value");
const formMsg = document.getElementById("form-msg");

const transactionsContainer = document.getElementById("transactions");

const totalIncomeEl = document.getElementById("total-income");
const totalExpenseEl = document.getElementById("total-expense");
const totalBalanceEl = document.getElementById("total-balance");

const clearBtn = document.getElementById("clear-btn");
const clearAllBtn = document.getElementById("clear-all");
const exportBtn = document.getElementById("export-json");
const importBtn = document.getElementById("import-json");
const importFile = document.getElementById("import-file");

// =========================
// RENDER FUNCTIONS
// =========================
function updateTotals(filtered) {
  const data = filtered || transactions;

  let income = 0;
  let expense = 0;

  data.forEach((t) => {
    const value = Number(t.value) || 0;
    if (t.type === "income") income += value;
    else expense += value;
  });

  totalIncomeEl.textContent = fmt(income);
  totalExpenseEl.textContent = fmt(expense);
  totalBalanceEl.textContent = fmt(income - expense);
}

function renderTransactions() {
  transactionsContainer.innerHTML = "";

  if (transactions.length === 0) {
    const p = document.createElement("div");
    p.className = "muted";
    p.textContent =
      "Nenhuma transação encontrada. Adicione uma nova transação no formulário.";
    transactionsContainer.appendChild(p);
    updateTotals();
    return;
  }

  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  sorted.forEach((tx) => {
    addTxCard(tx);
  });

  updateTotals();
}

function addTxCard(tx) {
  const item = document.createElement("div");
  item.className = "tx-item";

  const left = document.createElement("div");
  left.className = "tx-left";

  const typeBox = document.createElement("div");
  typeBox.className = "tx-type " + (tx.type === "income" ? "income" : "expense");
  typeBox.textContent = tx.type === "income" ? "R+" : "R-";

  const meta = document.createElement("div");
  meta.className = "tx-meta";
  const d = new Date(tx.date);
  const dateStr = isNaN(d) ? tx.date : d.toLocaleDateString("pt-BR");

  meta.innerHTML = `
    <div style="font-weight:600">${tx.description}</div>
    <div class="muted" style="margin-top:4px">${dateStr} • ${tx.category}</div>
  `;

  left.appendChild(typeBox);
  left.appendChild(meta);

  const right = document.createElement("div");
  right.style.display = "flex";
  right.style.alignItems = "center";
  right.style.gap = "10px";

  const val = document.createElement("div");
  val.className = "tx-value";
  val.textContent = fmt(Number(tx.value));

  const actions = document.createElement("div");
  actions.className = "tx-actions";

  const delBtn = document.createElement("button");
  delBtn.innerHTML = "🗑";
  delBtn.title = "Excluir";

  delBtn.addEventListener("click", () => {
    if (confirm("Confirma exclusão?")) {
      deleteTransaction(tx.id);
    }
  });

  actions.appendChild(delBtn);
  right.appendChild(val);
  right.appendChild(actions);

  item.appendChild(left);
  item.appendChild(right);

  transactionsContainer.appendChild(item);
}

// =========================
// CRUD
// =========================
function addTransaction(obj) {
  const tx = {
    id: Date.now().toString(),
    date: obj.date,
    type: obj.type,
    description: obj.description,
    category: obj.category,
    value: Number(obj.value),
  };
  transactions.push(tx);
  saveTransactions(transactions);
  renderTransactions();
}

function deleteTransaction(id) {
  transactions = transactions.filter((t) => t.id !== id);
  saveTransactions(transactions);
  renderTransactions();
}

// =========================
// IMPORT / EXPORT
// =========================
function exportJSON() {
  const dataStr = JSON.stringify(transactions, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "transactions.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importJSONFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!Array.isArray(parsed)) throw new Error("Formato inválido");

      const map = {};
      transactions.forEach((t) => (map[t.id] = t));

      parsed.forEach((p) => {
        if (p.id && !map[p.id]) map[p.id] = p;
      });

      transactions = Object.values(map);
      saveTransactions(transactions);
      renderTransactions();
      alert("Importação concluída!");
    } catch (err) {
      alert("Erro: " + err.message);
    }
  };
  reader.readAsText(file);
}

// =========================
// FILTERS
// =========================
function getAvailableYears(tx) {
  const years = new Set();
  tx.forEach((t) => {
    const d = new Date(t.date);
    if (!isNaN(d)) years.add(d.getFullYear());
  });
  return Array.from(years).sort((a, b) => b - a);
}

function populateYearFilter() {
  const yearSelect = document.getElementById("filter-year");
  yearSelect.innerHTML = `<option value="">Todos</option>`;

  const years = getAvailableYears(transactions);

  years.forEach((y) => {
    const op = document.createElement("option");
    op.value = y;
    op.textContent = y;
    yearSelect.appendChild(op);
  });
}

function applyFilters() {
  const selectedMonth = document.getElementById("filter-month").value;
  const selectedYear = document.getElementById("filter-year").value;

  let filtered = [...transactions];

  if (selectedYear)
    filtered = filtered.filter(
      (t) => new Date(t.date).getFullYear() == selectedYear
    );

  if (selectedMonth)
    filtered = filtered.filter(
      (t) => new Date(t.date).getMonth() + 1 == selectedMonth
    );

  renderFilteredTransactions(filtered);
  updateTotals(filtered);
  updateChartsFiltered(filtered);
}

function renderFilteredTransactions(filtered) {
  const container = document.getElementById("transactions");
  container.innerHTML = "";

  if (!filtered || filtered.length === 0) {
    const p = document.createElement("div");
    p.className = "muted";
    p.textContent = "Nenhuma transação encontrada no período.";
    container.appendChild(p);
    return;
  }

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  sorted.forEach((tx) => addTxCard(tx));
}

// =========================
// CHARTS
// =========================
let monthChart = null;
let categoryChart = null;

function computeMonthlyTotals(txArray, monthsBack = 6) {
  const map = {};

  txArray.forEach((t) => {
    const d = new Date(t.date);
    if (isNaN(d)) return;

    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}`;

    if (!map[key])
      map[key] = {
        income: 0,
        expense: 0,
        date: new Date(d.getFullYear(), d.getMonth(), 1),
      };

    if (t.type === "income") map[key].income += Number(t.value);
    else map[key].expense += Number(t.value);
  });

  const labels = [];
  const incomes = [];
  const expenses = [];

  let latest = new Date();
  if (txArray.length) {
    const sortedDates = txArray
      .map((t) => new Date(t.date))
      .filter((d) => !isNaN(d))
      .sort((a, b) => b - a);

    if (sortedDates.length) latest = sortedDates[0];
  }

  for (let i = monthsBack - 1; i >= 0; i--) {
    const ref = new Date(latest.getFullYear(), latest.getMonth() - i, 1);
    const key = `${ref.getFullYear()}-${String(ref.getMonth() + 1).padStart(
      2,
      "0"
    )}`;

    labels.push(
      `${String(ref.getMonth() + 1).padStart(2, "0")}/${ref.getFullYear()}`
    );

    if (map[key]) {
      incomes.push(map[key].income);
      expenses.push(map[key].expense);
    } else {
      incomes.push(0);
      expenses.push(0);
    }
  }

  return { labels, incomes, expenses };
}

function computeCategoryTotals(txArray, topN = 8) {
  const catMap = {};

  txArray.forEach((t) => {
    const cat = t.category || "Outros";
    catMap[cat] = (catMap[cat] || 0) + Number(t.value);
  });

  const sorted = Object.keys(catMap)
    .map((k) => ({ k, v: catMap[k] }))
    .sort((a, b) => b.v - a.v);

  const top = sorted.slice(0, topN);
  const others = sorted.slice(topN);

  let otherSum = 0;
  others.forEach((o) => (otherSum += o.v));

  const labels = top.map((i) => i.k);
  const values = top.map((i) => i.v);

  if (otherSum > 0) {
    labels.push("Outros");
    values.push(otherSum);
  }

  return { labels, values };
}

function generateColors(count) {
  const base = [
    "#4caf50",
    "#f44336",
    "#2196f3",
    "#ff9800",
    "#9c27b0",
    "#3f51b5",
    "#00bcd4",
    "#8bc34a",
    "#ff5722",
    "#607d8b",
  ];
  const out = [];
  for (let i = 0; i < count; i++) out.push(base[i % base.length]);
  return out;
}

function initCharts() {
  const ctxMonths = document
    .getElementById("chart-months")
    .getContext("2d");

  monthChart = new Chart(ctxMonths, {
    type: "bar",
    data: {
      labels: [],
      datasets: [
        { label: "Receitas", data: [], backgroundColor: "rgba(46,125,50,.8)" },
        { label: "Despesas", data: [], backgroundColor: "rgba(198,40,40,.8)" },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });

  const ctxCat = document
    .getElementById("chart-categories")
    .getContext("2d");

  categoryChart = new Chart(ctxCat, {
    type: "doughnut",
    data: {
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: [],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "right" },
      },
    },
  });
}

function updateCharts() {
  if (!monthChart || !categoryChart) return;

  const m = computeMonthlyTotals(transactions, 6);

  monthChart.data.labels = m.labels;
  monthChart.data.datasets[0].data = m.incomes;
  monthChart.data.datasets[1].data = m.expenses;
  monthChart.update();

  const c = computeCategoryTotals(transactions, 8);
  categoryChart.data.labels = c.labels;
  categoryChart.data.datasets[0].data = c.values;
  categoryChart.data.datasets[0].backgroundColor = generateColors(
    c.labels.length
  );
  categoryChart.update();
}

function updateChartsFiltered(filtered) {
  if (!monthChart || !categoryChart) return;

  const m = computeMonthlyTotals(filtered, 6);

  monthChart.data.labels = m.labels;
  monthChart.data.datasets[0].data = m.incomes;
  monthChart.data.datasets[1].data = m.expenses;
  monthChart.update();

  const c = computeCategoryTotals(filtered, 8);
  categoryChart.data.labels = c.labels;
  categoryChart.data.datasets[0].data = c.values;
  categoryChart.data.datasets[0].backgroundColor = generateColors(
    c.labels.length
  );
  categoryChart.update();
}

// =========================
// INIT
// =========================
function init() {
  dateEl.value = new Date().toISOString().slice(0, 10);

  renderTransactions();
  populateYearFilter();
  updateCharts();

  document
    .getElementById("filter-month")
    .addEventListener("change", applyFilters);

  document
    .getElementById("filter-year")
    .addEventListener("change", applyFilters);

  document.getElementById("clear-filters").addEventListener("click", () => {
    document.getElementById("filter-month").value = "";
    document.getElementById("filter-year").value = "";
    renderTransactions();
    updateTotals();
    updateCharts();
  });
}

// =========================
// FORM EVENTS
// =========================
form.addEventListener("submit", (e) => {
  e.preventDefault();
  formMsg.textContent = "";

  const date = dateEl.value || new Date().toISOString().slice(0, 10);
  const type = typeEl.value;
  const desc = descEl.value.trim();
  const cat = catEl.value.trim() || "Outros";
  const val = valueEl.value;

  if (!desc) {
    formMsg.textContent = "Preencha a descrição.";
    return;
  }
  if (!val || Number(val) <= 0) {
    formMsg.textContent = "Informe um valor maior que zero.";
    return;
  }

  addTransaction({
    date,
    type,
    description: desc,
    category: cat,
    value: val,
  });

  formMsg.textContent = "Transação adicionada!";
  setTimeout(() => (formMsg.textContent = ""), 1500);

  descEl.value = "";
  catEl.value = "";
  valueEl.value = "";
});

clearBtn.addEventListener("click", () => {
  dateEl.value = "";
  typeEl.value = "income";
  descEl.value = "";
  catEl.value = "";
  valueEl.value = "";
  formMsg.textContent = "";
});

clearAllBtn.addEventListener("click", () => {
  if (confirm("Deseja realmente apagar tudo?")) {
    transactions = [];
    saveTransactions(transactions);
    renderTransactions();
    updateCharts();
  }
});

exportBtn.addEventListener("click", exportJSON);
importBtn.addEventListener("click", () => importFile.click());
importFile.addEventListener("change", (e) => {
  if (e.target.files.length) importJSONFile(e.target.files[0]);
  importFile.value = "";
});

// =========================
// ON PAGE LOAD
// =========================
document.addEventListener("DOMContentLoaded", () => {
  init();
  initCharts();
  updateCharts();
});

// =========================
// RENDER HOOK FOR CHARTS
// =========================
(function attachRenderHook() {
  const original = renderTransactions;
  renderTransactions = function () {
    original();
    updateCharts();
  };
})();
