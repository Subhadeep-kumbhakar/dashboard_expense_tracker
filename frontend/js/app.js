// Main Application Logic with API Integration
let transactions = [];
let charts = {};
let currentFilter = 'all';
let currentMonth = '';

// Auth check on page load
document.addEventListener('DOMContentLoaded', () => {
  if (!api.isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }

  init();
});

async function init() {
  setupEventListeners();
  await loadUserData();
  await loadTransactions();
  showPage('dashboard');
}

function setupEventListeners() {
  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      showPage(page);
    });
  });

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to logout?')) {
        api.logout();
      }
    });
  }

  // Add transaction button
  const addTxnBtn = document.getElementById('addTxnBtn');
  if (addTxnBtn) {
    addTxnBtn.addEventListener('click', () => openModal());
  }

  // Transaction form submit
  const txnForm = document.getElementById('txnForm');
  if (txnForm) {
    txnForm.addEventListener('submit', handleTransactionSubmit);
  }

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderTransactions();
    });
  });

  // Modal close
  const modalOverlay = document.getElementById('modalOverlay');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  const cancelBtn = document.getElementById('cancelBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeModal);
  }
}

async function loadUserData() {
  try {
    const response = await api.getProfile();
    if (response.success) {
      const userName = document.getElementById('userName');
      if (userName) {
        userName.textContent = response.data.user.name;
      }
    }
  } catch (error) {
    console.error('Error loading user data:', error);
  }
}

async function loadTransactions() {
  try {
    const response = await api.getTransactions();
    if (response.success) {
      transactions = response.data.transactions;
      refreshDashboard();
      renderTransactions();
      refreshAnalytics();
    }
  } catch (error) {
    console.error('Error loading transactions:', error);
    showToast('Failed to load transactions', 'error');
  }
}

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const page = document.getElementById(`page-${name}`);
  const navItem = document.querySelector(`[data-page="${name}"]`);

  if (page) page.classList.add('active');
  if (navItem) navItem.classList.add('active');

  if (name === 'dashboard') refreshDashboard();
  if (name === 'transactions') renderTransactions();
  if (name === 'analytics') refreshAnalytics();
}

function refreshDashboard() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const monthlyTxns = transactions.filter(t => {
    const date = new Date(t.date);
    return date >= startOfMonth && date <= endOfMonth;
  });

  const income = monthlyTxns
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const expenses = monthlyTxns
    .filter(t => t.type === 'expense')
    .reduce((sum, t => sum + parseFloat(t.amount), 0);

  const netBalance = income - expenses;
  const savingsRate = income > 0 ? ((income - expenses) / income * 100) : 0;

  // Update KPIs
  document.getElementById('netBalance').textContent = fmt(netBalance);
  document.getElementById('totalIncome').textContent = fmt(income);
  document.getElementById('totalExpenses').textContent = fmt(expenses);
  document.getElementById('savingsRate').textContent = savingsRate.toFixed(1) + '%';

  // Update charts
  buildDonut();
  buildBarMonthly();
  buildTrend();
  renderRecentTransactions();
}

function renderRecentTransactions() {
  const tbody = document.getElementById('recentTxnBody');
  if (!tbody) return;

  const recent = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  if (recent.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No transactions yet</td></tr>';
    return;
  }

  tbody.innerHTML = recent.map(t => `
    <tr>
      <td>${formatDate(t.date)}</td>
      <td>${escHtml(t.description)}</td>
      <td><span class="tag">${getCatEmoji(t.category)} ${escHtml(t.category)}</span></td>
      <td class="${t.type === 'income' ? 'amount-pos' : 'amount-neg'}">
        ${t.type === 'income' ? '+' : '-'}${fmt(t.amount)}
      </td>
      <td>
        <div class="action-btns">
          <button class="btn btn-sm btn-ghost" onclick="editTransaction(${t.id})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteTransaction(${t.id})">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderTransactions() {
  const tbody = document.getElementById('txnTableBody');
  if (!tbody) return;

  let filtered = transactions;

  if (currentFilter !== 'all') {
    filtered = transactions.filter(t => t.type === currentFilter);
  }

  if (currentMonth) {
    filtered = filtered.filter(t => t.date.startsWith(currentMonth));
  }

  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><div class="emoji">🔍</div>No transactions found</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(t => `
    <tr>
      <td>${formatDate(t.date)}</td>
      <td>${escHtml(t.description)}</td>
      <td><span class="tag">${getCatEmoji(t.category)} ${escHtml(t.category)}</span></td>
      <td class="${t.type === 'income' ? 'amount-pos' : 'amount-neg'}">
        ${t.type === 'income' ? '+' : '-'}${fmt(t.amount)}
      </td>
      <td>${t.notes ? escHtml(t.notes) : '-'}</td>
      <td>
        <div class="action-btns">
          <button class="btn btn-sm btn-ghost" onclick="editTransaction(${t.id})">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="deleteTransaction(${t.id})">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function handleTransactionSubmit(e) {
  e.preventDefault();

  const formData = {
    type: document.getElementById('txnType').value,
    amount: parseFloat(document.getElementById('txnAmount').value),
    date: document.getElementById('txnDate').value,
    description: document.getElementById('txnDesc').value,
    category: document.getElementById('txnCat').value,
    notes: document.getElementById('txnNotes').value
  };

  const txnId = document.getElementById('txnId').value;

  try {
    let response;
    if (txnId) {
      response = await api.updateTransaction(txnId, formData);
      showToast('Transaction updated successfully', 'success');
    } else {
      response = await api.createTransaction(formData);
      showToast('Transaction created successfully', 'success');
    }

    if (response.success) {
      await loadTransactions();
      closeModal();
    }
  } catch (error) {
    console.error('Error saving transaction:', error);
    showToast(error.message || 'Failed to save transaction', 'error');
  }
}

async function editTransaction(id) {
  const transaction = transactions.find(t => t.id === id);
  if (!transaction) return;

  document.getElementById('txnId').value = transaction.id;
  document.getElementById('txnType').value = transaction.type;
  document.getElementById('txnAmount').value = transaction.amount;
  document.getElementById('txnDate').value = transaction.date;
  document.getElementById('txnDesc').value = transaction.description;
  document.getElementById('txnCat').value = transaction.category;
  document.getElementById('txnNotes').value = transaction.notes || '';
  document.getElementById('modalTitle').textContent = 'Edit Transaction';

  openModal();
}

async function deleteTransaction(id) {
  if (!confirm('Are you sure you want to delete this transaction?')) return;

  try {
    const response = await api.deleteTransaction(id);
    if (response.success) {
      showToast('Transaction deleted successfully', 'success');
      await loadTransactions();
    }
  } catch (error) {
    console.error('Error deleting transaction:', error);
    showToast(error.message || 'Failed to delete transaction', 'error');
  }
}

function openModal() {
  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.getElementById('txnForm').reset();
  document.getElementById('txnId').value = '';
  document.getElementById('modalTitle').textContent = 'Add Transaction';
}

// Utility functions
function fmt(val) {
  return '$' + parseFloat(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function escHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function getCatEmoji(cat) {
  const emojis = {
    'Salary': '💰', 'Freelance': '💼', 'Investment': '📈', 'Gift': '🎁',
    'Food': '🍔', 'Transport': '🚗', 'Shopping': '🛍️', 'Bills': '📄',
    'Entertainment': '🎮', 'Healthcare': '🏥', 'Education': '📚',
    'Travel': '✈️', 'Savings': '🏦', 'Other': '📦'
  };
  return emojis[cat] || '📦';
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-size: 14px;
    z-index: 10000;
    animation: slideIn 0.3s;
    background: ${type === 'success' ? '#22c55e' : '#ef4444'};
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Chart functions (placeholder - implement with Chart.js)
function buildDonut() {
  // Implementation with Chart.js
}

function buildBarMonthly() {
  // Implementation with Chart.js
}

function buildTrend() {
  // Implementation with Chart.js
}

function refreshAnalytics() {
  // Implementation
}
