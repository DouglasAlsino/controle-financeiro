// ======= Storage key
const STORAGE_KEY = 'transactions';

// Utility: currency format BRL
const fmt = (v) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
};

// Load existing transactions from localStorage
function loadTransactions(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if(Array.isArray(parsed)) return parsed;
    return [];
  } catch(e){
    console.error('Erro ao parsear localStorage', e);
    return [];
  }
}

// Save transactions
function saveTransactions(arr){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

// State
let transactions = loadTransactions();

// DOM refs
const form = document.getElementById('tx-form');
const dateEl = document.getElementById('date');
const typeEl = document.getElementById('type');
const descEl = document.getElementById('desc');
const catEl = document.getElementById('category');
const valueEl = document.getElementById('value');
const transactionsContainer = document.getElementById('transactions');
const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');
const totalBalanceEl = document.getElementById('total-balance');
const formMsg = document.getElementById('form-msg');
const clearBtn = document.getElementById('clear-btn');
const clearAllBtn = document.getElementById('clear-all');
const exportBtn = document.getElementById('export-json');
const importBtn = document.getElementById('import-json');
const importFile = document.getElementById('import-file');

// Render functions
function updateTotals(){
  const income = transactions.filter(t=>t.type==='income').reduce((s,t)=>s + Number(t.value), 0);
  const expense = transactions.filter(t=>t.type==='expense').reduce((s,t)=>s + Number(t.value), 0);
  const balance = income - expense;
  totalIncomeEl.textContent = fmt(income);
  totalExpenseEl.textContent = fmt(expense);
  totalBalanceEl.textContent = fmt(balance);
}

function renderTransactions(){
  transactionsContainer.innerHTML = '';
  if(transactions.length === 0){
    const p = document.createElement('div');
    p.className = 'muted';
    p.textContent = 'Nenhuma transação encontrada. Adicione uma nova transação no formulário.';
    transactionsContainer.appendChild(p);
    updateTotals();
    return;
  }

  const sorted = [...transactions].sort((a,b)=> new Date(b.date) - new Date(a.date));

  sorted.forEach(tx => {
    const item = document.createElement('div');
    item.className = 'tx-item';

    const left = document.createElement('div');
    left.className = 'tx-left';

    const typeBox = document.createElement('div');
    typeBox.className = 'tx-type ' + (tx.type === 'income' ? 'income' : 'expense');
    typeBox.textContent = tx.type === 'income' ? 'R+' : 'R-';

    const meta = document.createElement('div');
    meta.className = 'tx-meta';
    const d = new Date(tx.date);
    const dateStr = isNaN(d) ? tx.date : d.toLocaleDateString('pt-BR');
    meta.innerHTML = `<div style="font-weight:600">${tx.description}</div><div class="muted" style="margin-top:4px">${dateStr} • ${tx.category}</div>`;

    left.appendChild(typeBox);
    left.appendChild(meta);

    const right = document.createElement('div');
    right.style.display = 'flex';
    right.style.alignItems = 'center';
    right.style.gap = '10px';

    const val = document.createElement('div');
    val.className = 'tx-value';
    val.textContent = fmt(Number(tx.value));

    const actions = document.createElement('div');
    actions.className = 'tx-actions';

    const delBtn = document.createElement('button');
    delBtn.title = 'Excluir';
    delBtn.innerHTML = '🗑';
    delBtn.addEventListener('click', ()=> {
      if(confirm('Confirma exclusão desta transação?')){
        deleteTransaction(tx.id);
      }
    });

    actions.appendChild(delBtn);
    right.appendChild(val);
    right.appendChild(actions);

    item.appendChild(left);
    item.appendChild(right);

    transactionsContainer.appendChild(item);
  });

  updateTotals();
}

// Add transaction
function addTransaction(obj){
  const tx = {
    id: Date.now().toString(),
    date: obj.date,
    type: obj.type,
    description: obj.description,
    category: obj.category,
    value: Number(obj.value).toFixed(2)
  };
  transactions.push(tx);
  saveTransactions(transactions);
  renderTransactions();
}

// Delete
function deleteTransaction(id){
  transactions = transactions.filter(t=>t.id !== id);
  saveTransactions(transactions);
  renderTransactions();
}

// Clear all
function clearAll(){
  if(!confirm('Deseja realmente apagar todas as transações? Essa ação não pode ser desfeita.')) return;
  transactions = [];
  saveTransactions(transactions);
  renderTransactions();
}

// Export JSON
function exportJSON(){
  const dataStr = JSON.stringify(transactions, null, 2);
  const blob = new Blob([dataStr], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'transactions.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Import JSON
function importJSONFile(file){
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if(!Array.isArray(parsed)) throw new Error('Formato inválido');
      const valid = parsed.every(p => p.id && p.date && p.type && p.value !== undefined);
      if(!valid) throw new Error('Estrutura do JSON inválida');
      const map = {};
      transactions.forEach(t=> map[t.id] = t);
      parsed.forEach(p=>{
        if(!map[p.id]) map[p.id] = p;
      });
      transactions = Object.values(map);
      saveTransactions(transactions);
      renderTransactions();
      alert('Importação concluída com sucesso.');
    } catch(err){
      alert('Erro ao importar: ' + err.message);
    }
  };
  reader.readAsText(file);
}

// Form submit handler
form.addEventListener('submit', (e) => {
  e.preventDefault();
  formMsg.textContent = '';
  const date = dateEl.value || new Date().toISOString().slice(0,10);
  const type = typeEl.value;
  const description = descEl.value.trim();
  const category = catEl.value.trim() || 'Outros';
  const value = valueEl.value;

  if(!description || description.length < 1){
    formMsg.textContent = 'Preencha a descrição.';
    return;
  }
  if(!value || Number(value) <= 0){
    formMsg.textContent = 'Informe um valor maior que zero.';
    return;
  }

  addTransaction({ date, type, description, category, value });
  formMsg.textContent = 'Transação adicionada.';
  setTimeout(()=> formMsg.textContent = '', 1500);

  descEl.value = '';
  catEl.value = '';
  valueEl.value = '';
});

// Clear form
clearBtn.addEventListener('click', () => {
  dateEl.value = '';
  typeEl.value = 'income';
  descEl.value = '';
  catEl.value = '';
  valueEl.value = '';
  formMsg.textContent = '';
});

clearAllBtn.addEventListener('click', clearAll);
exportBtn.addEventListener('click', exportJSON);
importBtn.addEventListener('click', () => importFile.click());
importFile.addEventListener('change', (e) => {
  if(e.target.files && e.target.files.length) importJSONFile(e.target.files[0]);
  importFile.value = '';
});

// on load
(function init(){
  dateEl.value = new Date().toISOString().slice(0,10);
  renderTransactions();
})();

/* -----------------------------
   Chart.js integration for Sprint 2
   - computes monthly totals (last 6-12 months present)
   - computes category totals
   - auto-updates on data change
   ----------------------------- */

let monthChart = null;
let categoryChart = null;

// helper: format month label as "MM/YYYY"
function formatMonthLabel(date) {
  const d = new Date(date);
  return `${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

// compute totals per month (returns { labels: [], incomes: [], expenses: [] })
function computeMonthlyTotals(txArray, monthsBack = 6) {
  if(!Array.isArray(txArray)) txArray = [];
  // gather distinct year-month present in data
  const map = {};
  txArray.forEach(t => {
    const d = new Date(t.date);
    if(isNaN(d)) return;
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    if(!map[key]) map[key] = { income:0, expense:0, date: new Date(d.getFullYear(), d.getMonth(), 1) };
    if(t.type === 'income') map[key].income += Number(t.value);
    else map[key].expense += Number(t.value);
  });

  // if no data, return last `monthsBack` months labels with zeros
  const labels = [];
  const incomes = [];
  const expenses = [];

  // build last N months backward from now or from latest tx
  let latest = new Date();
  if(txArray.length){
    const sorted = [...txArray].map(t=>new Date(t.date)).filter(d=>!isNaN(d)).sort((a,b)=>b-a);
    if(sorted.length) latest = sorted[0];
  }
  // go monthsBack-1 .. 0
  for(let i = monthsBack - 1; i >= 0; i--){
    const ref = new Date(latest.getFullYear(), latest.getMonth() - i, 1);
    const key = `${ref.getFullYear()}-${String(ref.getMonth()+1).padStart(2,'0')}`;
    labels.push(`${String(ref.getMonth()+1).padStart(2,'0')}/${ref.getFullYear()}`);
    if(map[key]){
      incomes.push(Number(map[key].income.toFixed(2)));
      expenses.push(Number(map[key].expense.toFixed(2)));
    } else {
      incomes.push(0);
      expenses.push(0);
    }
  }

  return { labels, incomes, expenses };
}

// compute totals per category { labels:[], values:[] }
function computeCategoryTotals(txArray, topN = 10) {
  const cat = {};
  txArray.forEach(t => {
    const c = t.category || 'Outros';
    if(!cat[c]) cat[c] = 0;
    cat[c] += Number(t.value) || 0;
  });
  // convert to array and sort desc
  const arr = Object.keys(cat).map(k=>({ k, v: cat[k] })).sort((a,b)=>b.v - a.v);
  // limit to topN, merge rest as "Outros" if necessary
  const top = arr.slice(0, topN);
  const rest = arr.slice(topN);
  let otherSum = 0;
  rest.forEach(r=> otherSum += r.v);
  const labels = top.map(t=>t.k);
  const values = top.map(t=> Number(t.v.toFixed(2)));
  if(otherSum > 0){
    labels.push('Outros');
    values.push(Number(otherSum.toFixed(2)));
  }
  return { labels, values };
}

// create charts (initial)
function initCharts(){
  // months chart: grouped bar (income vs expense)
  const ctxMonths = document.getElementById('chart-months').getContext('2d');
  monthChart = new Chart(ctxMonths, {
    type: 'bar',
    data: {
      labels: [], // filled later
      datasets: [
        { label: 'Receitas', data: [], backgroundColor: 'rgba(46,125,50,0.8)' },
        { label: 'Despesas', data: [], backgroundColor: 'rgba(198,40,40,0.85)' },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top' },
        tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(ctx.parsed.y)}` } }
      },
      scales: {
        x: { stacked: false },
        y: { beginAtZero: true, ticks: { callback: val => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(val) } }
      }
    }
  });

  // categories chart: doughnut
  const ctxCat = document.getElementById('chart-categories').getContext('2d');
  categoryChart = new Chart(ctxCat, {
    type: 'doughnut',
    data: {
      labels: [],
      datasets: [{ data: [], backgroundColor: [] }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right' },
        tooltip: { callbacks: { label: ctx => `${ctx.label}: ${new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(ctx.parsed)}` } }
      }
    }
  });
}

// generate a palette of colors for categories (reuses or random if needed)
function generateColors(count){
  const base = [
    '#4caf50','#f44336','#2196f3','#ff9800','#9c27b0','#3f51b5','#00bcd4','#8bc34a','#ff5722','#607d8b'
  ];
  const out = [];
  for(let i=0;i<count;i++){
    out.push(base[i % base.length]);
  }
  return out;
}

// update charts with current `transactions`
function updateCharts(){
  if(!monthChart || !categoryChart) return;
  const monthly = computeMonthlyTotals(transactions, 6);
  monthChart.data.labels = monthly.labels;
  monthChart.data.datasets[0].data = monthly.incomes;
  monthChart.data.datasets[1].data = monthly.expenses;
  monthChart.update();

  const cat = computeCategoryTotals(transactions, 8);
  categoryChart.data.labels = cat.labels;
  categoryChart.data.datasets[0].data = cat.values;
  categoryChart.data.datasets[0].backgroundColor = generateColors(cat.labels.length);
  categoryChart.update();
}

/* Hook charts into app lifecycle:
   - initCharts() is called during init()
   - updateCharts() is called after renderTransactions()
*/

// ensure init() calls initCharts(); if init() already exists above, it will run both
if(typeof init === 'function'){
  // we will redefine init wrapper: call original init then initCharts & updateCharts
  const oldInit = init;
  window.init = function(){
    oldInit();
    try { initCharts(); } catch(e) { console.error('Erro initCharts', e); }
    updateCharts();
  };
  // call new init immediately if needed
  if(document.readyState === 'complete' || document.readyState === 'interactive'){
    // re-run init to ensure charts are initialized (but be careful not to duplicate)
    try { window.init(); } catch(e){}
  }
} else {
  // fallback: initialize charts at end of file
  document.addEventListener('DOMContentLoaded', () => {
    try { initCharts(); updateCharts(); } catch(e){ console.error(e); }
  });
}

// small integration: ensure renderTransactions triggers updateCharts after DOM rendering
// If renderTransactions() is defined above, add a safe hook:
(function attachRenderHook(){
  const originalRender = renderTransactions;
  renderTransactions = function(){
    originalRender();
    try { updateCharts(); } catch(e){ /* ignore */ }
  };
})();
