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
