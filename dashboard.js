const STORAGE_KEY = 'owndays_registrations';
const VISITS_KEY = 'owndays_visits';

const STORE_LABELS = {
  centralramindra: 'Central Ramindra',
  fashionisland: 'Fashion Island',
  centralworld: 'CentralWorld',
  megabangna: 'Mega Bangna',
  centralplazawestgest: 'CentralPlaza Westgate',
};

// State
let allRegistrations = [];
let filtered = [];
let sortCol = 'registered_at';
let sortDir = 'desc';

// Call functions
document.addEventListener('DOMContentLoaded', () => {
  trackVisit();
  loadData();
  bindFilters();
  bindExport();
  bindSort();
});

// Visit tracking
function trackVisit() {
  let count = parseInt(localStorage.getItem(VISITS_KEY) || '0', 10);
  document.getElementById('visitCountVal').textContent = count.toLocaleString();
}

// Load data
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    allRegistrations = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(allRegistrations)) allRegistrations = [];
  } catch {
    allRegistrations = [];
  }
  applyFilters();
}

// Filters
function bindFilters() {
  ['filterStore', 'filterDateFrom', 'filterDateTo', 'filterSearch'].forEach(id => {
    document.getElementById(id).addEventListener('input', applyFilters);
  });
  document.getElementById('clearFilters').addEventListener('click', () => {
    document.getElementById('filterStore').value    = '';
    document.getElementById('filterDateFrom').value = '';
    document.getElementById('filterDateTo').value   = '';
    document.getElementById('filterSearch').value   = '';
    applyFilters();
  });
}

function applyFilters() {
  const store    = document.getElementById('filterStore').value;
  const dateFrom = document.getElementById('filterDateFrom').value;
  const dateTo   = document.getElementById('filterDateTo').value;
  const search   = document.getElementById('filterSearch').value.trim().toLowerCase();

  filtered = allRegistrations.filter(r => {
    if (store    && r.store !== store)                    return false;
    if (dateFrom && r.preferred_date < dateFrom)          return false;
    if (dateTo   && r.preferred_date > dateTo)            return false;
    if (search) {
      const haystack = [r.name, r.email, r.phone].join(' ').toLowerCase();
      if (!haystack.includes(search))                     return false;
    }
    return true;
  });

  renderAll();
}

// Render all
function renderAll() {
  renderStats();
  renderStoreChart();
  renderDateChart();
  renderTable();
}

// Status cards
function renderStats() {
  const total = allRegistrations.length;

  // This week (Mon–Sun)
  const now   = new Date();
  const day   = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  monday.setHours(0,0,0,0);
  const weekCount = allRegistrations.filter(r => new Date(r.registered_at) >= monday).length;

  // Most popular store
  const storeCounts = countBy(allRegistrations, 'store');
  const topStoreKey = Object.keys(storeCounts).sort((a,b) => storeCounts[b]-storeCounts[a])[0];
  const topStore    = topStoreKey ? STORE_LABELS[topStoreKey] || topStoreKey : '—';

  // Upcoming appointments in next 7 days
  const today7  = new Date(); today7.setHours(0,0,0,0);
  const in7     = new Date(today7); in7.setDate(today7.getDate() + 7);
  const upcomingCount = allRegistrations.filter(r => {
    const d = new Date(r.preferred_date);
    return d >= today7 && d <= in7;
  }).length;

  setText('statTotal', total);
  setText('statWeek', weekCount);
  setText('statTopStore', total ? topStore : '—');
  setText('statUpcoming', upcomingCount);
}

// By store
function renderStoreChart() {
  const counts = countBy(filtered, 'store');
  const max    = Math.max(...Object.values(counts), 1);
  const el     = document.getElementById('storeChart');
  el.innerHTML = '';

  if (filtered.length === 0) {
    el.innerHTML = '<p style="color:var(--grey-text);font-size:.85rem">No data</p>';
    return;
  }

  // Sort by count desc
  Object.keys(STORE_LABELS)
    .sort((a, b) => (counts[b] || 0) - (counts[a] || 0))
    .forEach(key => {
      const count = counts[key] || 0;
      const pct   = (count / max * 100).toFixed(1);
      const row   = document.createElement('div');
      row.className = 'bar-row';
      row.innerHTML =
        `<span class="bar-row__label" title="${escHtml(STORE_LABELS[key])}">${escHtml(STORE_LABELS[key])}</span>
         <div class="bar-row__track"><div class="bar-row__fill" style="width:${pct}%"></div></div>
         <span class="bar-row__count">${count}</span>`;
      el.appendChild(row);
    });
}

// By date
function renderDateChart() {
  const counts = countBy(filtered, 'preferred_date');
  const el     = document.getElementById('dateChart');
  el.innerHTML = '';

  if (filtered.length === 0) {
    el.innerHTML = '<p style="color:var(--grey-text);font-size:.85rem">No data</p>';
    return;
  }

  const sortedDates = Object.keys(counts).sort();
  const max         = Math.max(...Object.values(counts), 1);

  sortedDates.forEach(date => {
    const count = counts[date];
    const pct   = (count / max * 100).toFixed(1);
    const label = formatDate(date);
    const row   = document.createElement('div');
    row.className = 'bar-row';
    row.innerHTML =
      `<span class="bar-row__label">${escHtml(label)}</span>
       <div class="bar-row__track"><div class="bar-row__fill bar-row__fill--navy" style="width:${pct}%"></div></div>
       <span class="bar-row__count">${count}</span>`;
    el.appendChild(row);
  });
}

// Table
function renderTable() {
  const sorted = [...filtered].sort((a, b) => {
    const va = (a[sortCol] || '').toString().toLowerCase();
    const vb = (b[sortCol] || '').toString().toLowerCase();
    if (va < vb) return sortDir === 'asc' ? -1 :  1;
    if (va > vb) return sortDir === 'asc' ?  1 : -1;
    return 0;
  });

  const tbody = document.getElementById('regTableBody');
  const empty = document.getElementById('tableEmpty');
  tbody.innerHTML = '';

  setText('tableCount', `${sorted.length} registration${sorted.length !== 1 ? 's' : ''}`);

  if (sorted.length === 0) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  sorted.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML =
      `<td>${escHtml(r.name)}</td>
       <td class="muted">${escHtml(r.email)}</td>
       <td class="muted">${escHtml(r.phone)}</td>
       <td><span class="store-badge">${escHtml(STORE_LABELS[r.store] || r.store)}</span></td>
       <td>${escHtml(formatDate(r.preferred_date))}</td>
       <td class="muted">${escHtml(formatDateTime(r.registered_at))}</td>`;
    tbody.appendChild(tr);
  });
}

// Sort
function bindSort() {
  document.querySelectorAll('.reg-table thead th[data-col]').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      if (sortCol === col) {
        sortDir = sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        sortCol = col;
        sortDir = 'asc';
      }
      // Update header classes
      document.querySelectorAll('.reg-table thead th').forEach(t => {
        t.classList.remove('sorted-asc', 'sorted-desc');
      });
      th.classList.add(sortDir === 'asc' ? 'sorted-asc' : 'sorted-desc');
      renderTable();
    });
  });
}

// Export
function bindExport() {
  document.getElementById('exportBtn').addEventListener('click', exportCSV);
}

function exportCSV() {
  if (filtered.length === 0) { alert('No data to export.'); return; }

  const headers = ['ID', 'Name', 'Email', 'Phone', 'Store', 'Preferred Date', 'Registered At'];
  const rows    = filtered.map(r => [
    r.id,
    r.name,
    r.email,
    r.phone,
    STORE_LABELS[r.store] || r.store,
    r.preferred_date,
    r.registered_at,
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `owndays_registrations_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function countBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key] || 'unknown';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB') + ' ' +
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}
