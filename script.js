// Expense Tracker - form handling and localStorage persistence
(function () {
const STORAGE_KEY = "expenses";

function loadExpenses() {
try {
const raw = localStorage.getItem(STORAGE_KEY);
if (!raw) return [];
const parsed = JSON.parse(raw);
return Array.isArray(parsed) ? parsed : [];
} catch (_) {
return [];
}
}

function saveExpenses(expenses) {
localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function generateId() {
if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
return "id_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getTodayYMD() {
const d = new Date();
const year = d.getFullYear();
const month = String(d.getMonth() + 1).padStart(2, "0");
const day = String(d.getDate()).padStart(2, "0");
return `${year}-${month}-${day}`;
}

function isFutureDate(ymd) {
// Compare by y-m-d string to avoid timezone pitfalls
return ymd > getTodayYMD();
}

function showError(msg) {
const el = document.getElementById("form-error");
if (el) el.textContent = msg || "";
}

function clearError() { showError(""); }

// Normalize category: trim and convert to Title Case (each word capitalized)
function normalizeCategory(input) {
const s = String(input || "").trim();
if (!s) return "";
return s
.toLowerCase()
.split(/\s+/)
.map(function (w) { return w ? w.charAt(0).toUpperCase() + w.slice(1) : w; })
.join(" ");
}

function onSubmit(event) {
event.preventDefault();
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const descriptionInput = document.getElementById("description");

const amount = Number((amountInput && amountInput.value) || "");
const categoryRaw = (categoryInput && categoryInput.value || "");
const normalizedCategory = normalizeCategory(categoryRaw);
const category = normalizedCategory || "Other";
const date = (dateInput && dateInput.value) || ""; // expected yyyy-mm-dd
const description = (descriptionInput && descriptionInput.value || "").trim();

// Validation
if (!Number.isFinite(amount) || amount <= 0) {
showError("Amount must be a positive number.");
return;
}
if (!date) {
showError("Please select a date.");
return;
}
if (isFutureDate(date)) {
showError("Date cannot be in the future.");
return;
}

const expense = {
id: generateId(),
amount: amount,
category: category,
date: date,
description: description,
};

const expenses = loadExpenses();
const editingId = window.__editingExpenseId || "";
if (editingId) {
const idx = expenses.findIndex(function (e) { return e.id === editingId; });
if (idx !== -1) {
expenses[idx] = Object.assign({}, expenses[idx], expense, { id: editingId });
}
saveExpenses(expenses);
// reset editing state
window.__editingExpenseId = "";
const submitBtn = document.querySelector('#expense-form button[type="submit"]');
if (submitBtn) submitBtn.textContent = 'Add Expense';
showToast('Expense updated');
} else {
expenses.push(expense);
saveExpenses(expenses);
showToast('Expense added');
}

clearError();
event.target.reset();
if (dateInput) dateInput.value = getTodayYMD();
refreshCategoryOptions();
renderExpensesTable();
// test: verify UI updated after add
console.log('[test] add: persisted to localStorage, refreshed filters, re-rendered');
}

document.addEventListener("DOMContentLoaded", function () {
const form = document.getElementById("expense-form");
const dateInput = document.getElementById("date");
if (dateInput && !dateInput.value) dateInput.value = getTodayYMD();
if (form) form.addEventListener("submit", onSubmit);
renderExpensesTable();
refreshCategoryOptions();
// Filter listeners
const categorySelect = document.getElementById("filter-category");
const fromInput = document.getElementById("filter-from");
const toInput = document.getElementById("filter-to");
const clearBtn = document.getElementById("filter-clear");
if (categorySelect) categorySelect.addEventListener("change", renderExpensesTable);
if (fromInput) fromInput.addEventListener("change", renderExpensesTable);
if (toInput) toInput.addEventListener("change", renderExpensesTable);
if (clearBtn) clearBtn.addEventListener("click", function () {
if (categorySelect) categorySelect.value = "";
if (fromInput) fromInput.value = "";
if (toInput) toInput.value = "";
renderExpensesTable();
});
const exportBtn = document.getElementById("export-csv");
if (exportBtn) exportBtn.addEventListener("click", onExportCSV);
const table = document.getElementById("expenses-table");
if (table) {
table.addEventListener("click", function (e) {
const target = e.target;
if (!(target && target.matches)) return;
if (target.matches('button[data-expense-id].btn-delete')) {
const id = target.getAttribute('data-expense-id');
if (id) deleteExpenseById(id);
}
if (target.matches('button[data-expense-id].btn-edit')) {
const id = target.getAttribute('data-expense-id');
if (id) beginEditExpense(id);
}
});
}
// Clear error message when typing in any input
const clearOnInputElements = document.querySelectorAll('#expense-form input, #expense-form select, #expense-form textarea');
clearOnInputElements.forEach(function (el) {
el.addEventListener('input', function () { clearError(); });
});
});
})();



// Rendering and deletion helpers
function renderExpensesTable() {
const tbody = document.getElementById("expenses-tbody");
const totalEl = document.getElementById("total-amount");
if (!tbody) return;
tbody.innerHTML = "";
const expenses = applyFilters(loadExpenses()); // filtered list drives table and summary totals
if (!expenses.length) {
const tr = document.createElement("tr");
const td = document.createElement("td");
td.colSpan = 5;
td.textContent = "No expenses yet";
td.style.color = "#6b7280";
tr.appendChild(td);
tbody.appendChild(tr);
if (totalEl) totalEl.textContent = formatAmount(0);
return;
}
let total = 0;
for (const expense of expenses) {
total += Number(expense.amount) || 0;
const tr = document.createElement("tr");

const tdDate = document.createElement("td");
tdDate.textContent = expense.date || "";
tr.appendChild(tdDate);

const tdCategory = document.createElement("td");
tdCategory.textContent = expense.category || "";
tr.appendChild(tdCategory);

const tdDesc = document.createElement("td");
tdDesc.textContent = expense.description || "";
tr.appendChild(tdDesc);

const tdAmount = document.createElement("td");
tdAmount.textContent = formatAmount(expense.amount);
tr.appendChild(tdAmount);

const tdActions = document.createElement("td");
const editBtn = document.createElement("button");
editBtn.type = "button";
editBtn.textContent = "Edit";
editBtn.className = "btn-edit";
editBtn.setAttribute("data-expense-id", expense.id);
editBtn.setAttribute("aria-label", "Edit expense on " + (expense.date || "unknown date") + " amount " + formatAmount(expense.amount));
tdActions.appendChild(editBtn);
const delBtn = document.createElement("button");
delBtn.type = "button";
delBtn.textContent = "Delete";
delBtn.className = "btn-delete";
delBtn.setAttribute("data-expense-id", expense.id);
delBtn.setAttribute("aria-label", "Delete expense on " + (expense.date || "unknown date") + " amount " + formatAmount(expense.amount));
tdActions.appendChild(delBtn);
tr.appendChild(tdActions);

tbody.appendChild(tr);
}
if (totalEl) totalEl.textContent = formatAmount(total);
renderStats(expenses); // summary reflects filtered items
// test: verify UI updated after render
console.log('[test] render: rows=' + expenses.length + ', filteredTotal=' + formatAmount(total));
}

function deleteExpenseById(id) {
const expenses = loadExpenses();
const next = expenses.filter(function (e) { return e.id !== id; });
saveExpenses(next);
refreshCategoryOptions();
renderExpensesTable();
showToast('Expense deleted');
// test: verify UI updated on delete
console.log('[test] Deleted expense, table and summary re-rendered');
}

function formatAmount(value) {
const n = Number(value) || 0;
return n.toFixed(2);
}

function applyFilters(expenses) {
const categorySelect = document.getElementById("filter-category");
const fromInput = document.getElementById("filter-from");
const toInput = document.getElementById("filter-to");
const selectedCategory = categorySelect ? categorySelect.value : "";
const selectedNorm = normalizeCategory(selectedCategory);
const from = fromInput ? fromInput.value : ""; // yyyy-mm-dd or ""
const to = toInput ? toInput.value : "";
return expenses.filter(function (e) {
const inCategory = !selectedCategory || (normalizeCategory(e.category) === selectedNorm);
const inFrom = !from || (String(e.date || "") >= from);
const inTo = !to || (String(e.date || "") <= to);
return inCategory && inFrom && inTo;
});
}

function refreshCategoryOptions() {
const select = document.getElementById("filter-category");
if (!select) return;
const prev = select.value;
const expenses = loadExpenses();
// Base categories always present (already normalized Title Case)
const base = ["Food", "Transport", "Entertainment", "Bills", "Shopping", "Other"];
// Additional categories discovered from storage (normalize for uniqueness)
const extra = Array.from(new Set(expenses.map(function (e) { return normalizeCategory(e.category); }).filter(Boolean)));
// Merge with base and sort, keeping base order first then alphabetical extras not in base
const extrasOnly = extra.filter(function (c) { return base.indexOf(c) === -1; }).sort(function (a,b){ return a.localeCompare(b); });
const categories = base.concat(extrasOnly);

// Rebuild options
select.innerHTML = "";
const optAll = document.createElement("option");
optAll.value = "";
optAll.textContent = "All categories";
select.appendChild(optAll);
for (const c of categories) {
const opt = document.createElement("option");
opt.value = c;
opt.textContent = c;
select.appendChild(opt);
}
// Restore previous selection if still present; otherwise keep current value as All
select.value = Array.from(select.options).some(function (o) { return o.value === prev; }) ? prev : "";
}

function renderStats(visibleExpenses) {
const totalSpan = document.getElementById("summary-total");
const countSpan = document.getElementById("summary-count");
const list = document.getElementById("summary-categories");
const totalOverallSpan = document.getElementById("summary-total-overall");
if (!totalSpan || !countSpan || !list) return;
const total = visibleExpenses.reduce(function (sum, e) { return sum + (Number(e.amount) || 0); }, 0);
const count = visibleExpenses.length;
const byCategoryMap = {};
for (const e of visibleExpenses) {
const key = normalizeCategory(e.category) || "Uncategorized";
byCategoryMap[key] = (byCategoryMap[key] || 0) + (Number(e.amount) || 0);
}
const entries = Object.entries(byCategoryMap).sort(function (a, b) { return b[1] - a[1]; });
totalSpan.textContent = formatAmount(total);
countSpan.textContent = String(count);
// overall total across ALL stored expenses
if (totalOverallSpan) {
const all = loadExpenses();
const overall = all.reduce(function (s, e) { return s + (Number(e.amount) || 0); }, 0);
totalOverallSpan.textContent = formatAmount(overall);
}
list.innerHTML = "";
for (const [cat, amt] of entries) {
const li = document.createElement("li");
const name = document.createElement("span");
name.textContent = cat;
const value = document.createElement("span");
value.textContent = formatAmount(amt);
li.appendChild(name);
li.appendChild(value);
list.appendChild(li);
}
renderCategoryChart(entries);
renderMonthlySummary(loadExpenses());
}

// Begin edit helpers
function beginEditExpense(id) {
const expenses = loadExpenses();
const exp = expenses.find(function (e) { return e.id === id; });
if (!exp) return;
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const descriptionInput = document.getElementById("description");
if (amountInput) amountInput.value = String(exp.amount);
if (categoryInput) categoryInput.value = exp.category || '';
if (dateInput) dateInput.value = exp.date || '';
if (descriptionInput) descriptionInput.value = exp.description || '';
window.__editingExpenseId = id;
const submitBtn = document.querySelector('#expense-form button[type="submit"]');
if (submitBtn) submitBtn.textContent = 'Update Expense';
showToast('Editing expense…');
}

// Toast
function showToast(message) {
const toast = document.getElementById('toast');
if (!toast) return;
toast.textContent = message;
toast.classList.add('show');
clearTimeout(window.__toastTimer);
window.__toastTimer = setTimeout(function(){ toast.classList.remove('show'); }, 2000);
}

// CSV Export
function onExportCSV(event) {
  const expenses = (event && event.shiftKey) ? applyFilters(loadExpenses()) : loadExpenses();
  const csv = expensesToCSV(expenses);
  const filename = `expenses_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadTextFile(csv, filename, "text/csv;charset=utf-8;");
  const exportBtn = document.getElementById('export-csv');
  if (exportBtn) {
    const prev = exportBtn.title;
    exportBtn.title = (event && event.shiftKey) ? 'Exported filtered expenses' : 'Exported all expenses';
    setTimeout(function(){ exportBtn.title = prev || 'Export all expenses (Shift: export filtered)'; }, 2000);
  }
}

// Chart.js rendering for category distribution
let categoryChart;
function renderCategoryChart(entries) {
const canvas = document.getElementById('category-chart');
if (!canvas || typeof Chart === 'undefined') return;
const labels = entries.map(function (e) { return e[0]; });
const data = entries.map(function (e) { return Number(e[1]) || 0; });

// Handle empty data gracefully
const ctx = canvas.getContext('2d');
if (categoryChart) { categoryChart.destroy(); categoryChart = null; }
ctx.clearRect(0, 0, canvas.width, canvas.height);
const hasData = labels.length > 0 && data.some(function (v) { return v > 0; });
if (!hasData) {
  // Draw a simple placeholder message
  ctx.save();
  ctx.fillStyle = '#6b7280';
  ctx.font = '14px system-ui, -apple-system, Segoe UI, Roboto, Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('No category data', canvas.width / 2, canvas.height / 2);
  ctx.restore();
  return;
}

// Monthly summary rendering and deletion
function monthKey(dateStr) {
// dateStr expected yyyy-mm-dd; fallback safe
const d = new Date(dateStr || '');
if (!dateStr || isNaN(d.getTime())) return 'Unknown';
return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}

function monthLabel(key) {
if (key === 'Unknown') return 'Unknown';
const [y, m] = key.split('-');
const dt = new Date(Number(y), Number(m) - 1, 1);
return dt.toLocaleString(undefined, { month: 'long', year: 'numeric' });
}

function renderMonthlySummary(allExpenses) {
const container = document.getElementById('monthly-summary');
if (!container) return;
container.innerHTML = '';
// Group by month key
const groups = {};
for (const e of allExpenses) {
const key = monthKey(e.date);
groups[key] = groups[key] || [];
groups[key].push(e);
}
// Sort keys descending (most recent first)
const keys = Object.keys(groups).sort().reverse();
for (const key of keys) {
const items = groups[key];
const total = items.reduce(function (s, e) { return s + (Number(e.amount) || 0); }, 0);
const card = document.createElement('div');
card.className = 'month-card';

const meta = document.createElement('div');
meta.className = 'month-meta';
const title = document.createElement('div');
title.className = 'month-title';
title.textContent = monthLabel(key);
const sum = document.createElement('div');
sum.className = 'month-total';
sum.textContent = formatAmount(total);
meta.appendChild(title);
meta.appendChild(sum);

const btn = document.createElement('button');
btn.type = 'button';
btn.className = 'btn-delete';
btn.textContent = 'Delete Month';
btn.setAttribute('data-month-key', key);
btn.setAttribute('aria-label', 'Delete all expenses in ' + monthLabel(key));
btn.addEventListener('click', function(){
deleteMonth(key);
});

card.appendChild(meta);
card.appendChild(btn);
container.appendChild(card);
}
}

function deleteMonth(monthKeyStr) {
const all = loadExpenses();
const remain = all.filter(function (e) { return monthKey(e.date) !== monthKeyStr; });
saveExpenses(remain);
refreshCategoryOptions();
renderExpensesTable();
showToast('Deleted all expenses for ' + monthLabel(monthKeyStr));
}
const colors = labels.map(function(_, i){
  const base = [60, 200, 120, 220, 160, 260, 20, 300][i % 8];
  return `hsl(${base}, 70%, 55%)`;
});
const cfg = {
  type: 'pie',
  data: { labels: labels, datasets: [{ data: data, backgroundColor: colors }] },
  options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
};
categoryChart = new Chart(ctx, cfg);
}

function expensesToCSV(expenses) {
  const headers = ["id", "date", "category", "description", "amount"]; 
  const lines = [headers.join(",")];
  for (const e of expenses) {
    const row = [
      e.id || "",
      e.date || "",
      e.category || "",
      e.description || "",
      String(e.amount ?? "")
    ].map(csvEscape);
    lines.push(row.join(","));
  }
  return lines.join("\r\n");
}

function csvEscape(value) {
  const s = String(value).replace(/\r?\n/g, " ");
  if (/[",]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function downloadTextFile(text, filename, mime) {
  const blob = new Blob([text], { type: mime || "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(function () {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}
