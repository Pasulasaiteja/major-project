/**
 * manager-portal.js — Bank Branch Manager Dashboard
 * Fraud alerts view, investigation tickets management, status update modal.
 */

window.ManagerPortalPage = {
  protected: false,
  _activeTab: 'alerts',
  _ticketFilter: 'all',
  _alerts: [],
  _tickets: [],

  render: async () => {
    // Auth gate
    const token = localStorage.getItem('fs_manager_token');
    if (!token) { setTimeout(() => Router.navigate('/manager-login'), 0); return document.createElement('div'); }

    const info = JSON.parse(localStorage.getItem('fs_manager_info') || '{}');
    const bankName = info.bank_name || 'Bank Node';
    const mgrName = info.name || 'Manager';

    const div = document.createElement('div');
    div.className = "min-h-screen bg-surface flex flex-col page-enter";
    div.innerHTML = `
      <!-- Sticky Header -->
      <header class="sticky top-0 z-50 bg-inverse-surface border-b border-white/10 shadow-lg">
        <div class="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between">
          <div class="flex items-center gap-3 min-w-0">
            <span class="material-symbols-outlined text-inverse-primary text-[28px]">shield</span>
            <div class="min-w-0">
              <div class="font-display-lg text-[16px] md:text-[18px] font-bold text-white tracking-tight leading-none">FEDERATED SENTINEL</div>
              <div class="font-body-sm text-[11px] text-white/50 mt-0.5 truncate">Manager Portal — ${bankName}</div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span class="text-[9px] font-bold uppercase tracking-wider text-amber-300">Restricted</span>
            </span>
            <div class="text-right hidden sm:block">
              <div class="text-[12px] text-white/80 font-semibold font-body-sm">${mgrName}</div>
              <div class="text-[10px] text-white/40 font-label-mono-sm">${info.manager_id || ''}</div>
            </div>
            <button onclick="window.ManagerPortalPage._logout()"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-[12px] font-semibold transition-all cursor-pointer border border-white/10">
              <span class="material-symbols-outlined text-[16px]">logout</span>
              <span class="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div class="max-w-7xl mx-auto w-full px-4 md:px-8 py-6 flex-1 flex flex-col">
        <!-- Stats Row -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6" id="mgrStatsRow">
          <div class="bg-surface-container-lowest rounded-2xl border border-error/20 p-5 flex items-start justify-between shadow-sm">
            <div>
              <div id="statAlerts" class="font-display-lg text-[40px] font-bold text-error leading-none">—</div>
              <div class="font-label-mono-sm text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mt-1">Flagged Alerts</div>
            </div>
            <span class="material-symbols-outlined text-error/30 text-[32px]">warning</span>
          </div>
          <div class="bg-surface-container-lowest rounded-2xl border border-amber-500/20 p-5 flex items-start justify-between shadow-sm">
            <div>
              <div id="statOpenTickets" class="font-display-lg text-[40px] font-bold text-amber-700 leading-none">—</div>
              <div class="font-label-mono-sm text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mt-1">Open Tickets</div>
            </div>
            <span class="material-symbols-outlined text-amber-500/30 text-[32px]">confirmation_number</span>
          </div>
          <div class="bg-surface-container-lowest rounded-2xl border border-emerald-500/20 p-5 flex items-start justify-between shadow-sm">
            <div>
              <div id="statResolved" class="font-display-lg text-[40px] font-bold text-emerald-700 leading-none">—</div>
              <div class="font-label-mono-sm text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mt-1">Resolved</div>
            </div>
            <span class="material-symbols-outlined text-emerald-500/30 text-[32px]">check_circle</span>
          </div>
        </div>

        <!-- Tab Bar -->
        <div class="flex items-center gap-2 mb-5 border-b border-outline-variant/30 pb-3">
          <button id="tabAlerts" onclick="window.ManagerPortalPage._switchTab('alerts')"
            class="px-4 py-2 rounded-full text-[13px] font-semibold transition-all cursor-pointer bg-primary text-on-primary shadow-sm flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px]">warning</span> Fraud Alerts
          </button>
          <button id="tabTickets" onclick="window.ManagerPortalPage._switchTab('tickets')"
            class="px-4 py-2 rounded-full text-[13px] font-semibold transition-all cursor-pointer bg-surface-container text-on-surface-variant hover:bg-surface-container-high flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px]">confirmation_number</span> Investigation Tickets
          </button>
        </div>

        <!-- Content Panel -->
        <div id="mgrContent" class="flex-1"></div>

        <!-- Toast -->
        <div id="mgrToast" class="hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999] px-5 py-3 rounded-xl bg-inverse-surface text-white text-[13px] font-semibold shadow-2xl flex items-center gap-2 transition-all">
          <span class="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          <span id="mgrToastMsg">Done</span>
        </div>
      </div>

      <!-- Status Update Modal -->
      <div id="statusModal" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.65); backdrop-filter:blur(6px); z-index:999999; align-items:center; justify-content:center; padding:1.25rem; box-sizing:border-box;"
        onclick="if(event.target===this) window.ManagerPortalPage._closeStatusModal()">
        <div style="background:#fff; border-radius:1.25rem; padding:0; max-width:540px; width:100%; border:1px solid #e2e8f0; box-shadow:0 25px 50px -12px rgba(0,0,0,0.35); overflow:hidden;">
          <div class="bg-inverse-surface px-6 py-4 flex items-center justify-between">
            <div>
              <h3 class="font-headline-sm text-[16px] font-bold text-white">Update Ticket Status</h3>
              <p id="modalSubtitle" class="font-body-sm text-[12px] text-white/50 mt-0.5">Ticket: — | Current: —</p>
            </div>
            <button onclick="window.ManagerPortalPage._closeStatusModal()" class="text-white/60 hover:text-white cursor-pointer p-1">
              <span class="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>
          <div class="px-6 py-5 space-y-3" id="statusOptions"></div>
          <div class="px-6 pb-2">
            <label class="block font-label-mono-sm text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1.5">Manager Note (shown to client)</label>
            <textarea id="managerNoteInput" rows="3" placeholder="Add a message for the client..."
              class="w-full px-4 py-3 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface font-body-sm text-[13px] focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition-all resize-none"></textarea>
          </div>
          <div class="px-6 py-4 flex items-center justify-end gap-3 border-t border-outline-variant/20">
            <button onclick="window.ManagerPortalPage._closeStatusModal()"
              class="px-5 py-2.5 rounded-xl border border-outline-variant/50 text-on-surface-variant font-headline-sm text-[13px] font-semibold hover:bg-surface-container transition-all cursor-pointer">Cancel</button>
            <button id="submitStatusBtn" onclick="window.ManagerPortalPage._submitStatusUpdate()"
              class="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-headline-sm text-[13px] font-bold flex items-center gap-1.5 hover:bg-primary/90 transition-all shadow-sm cursor-pointer">
              Update Status <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    `;
    return div;
  },

  afterRender: async () => {
    await window.ManagerPortalPage._loadData();
    window.ManagerPortalPage._renderContent();
  },

  // ── Data Loading ────────────────────────────────────────────────────
  async _loadData() {
    const token = localStorage.getItem('fs_manager_token') || '';
    const info = JSON.parse(localStorage.getItem('fs_manager_info') || '{}');
    const hdrs = { 'X-Manager-Token': token };

    // Load alerts
    try {
      const resp = await fetch('http://127.0.0.1:8001/manager/fraud-alerts', { headers: hdrs });
      if (resp.ok) { this._alerts = await resp.json(); }
      else { this._alerts = this._demoAlerts(); }
    } catch (e) { this._alerts = this._demoAlerts(); }

    // Load tickets (try API then localStorage fallback)
    try {
      const resp = await fetch('http://127.0.0.1:8001/manager/tickets', { headers: hdrs });
      if (resp.ok) { this._tickets = await resp.json(); }
      else { this._tickets = this._localTickets(info.bank_name); }
    } catch (e) { this._tickets = this._localTickets(info.bank_name); }

    this._updateStats();
  },

  _updateStats() {
    const blockedAlerts = this._alerts.filter(a => a.status !== 'resolved').length;
    const openTickets = this._tickets.filter(t => t.status === 'open' || t.status === 'investigating').length;
    const resolved = this._tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

    const el1 = document.getElementById('statAlerts');
    const el2 = document.getElementById('statOpenTickets');
    const el3 = document.getElementById('statResolved');
    if (el1) el1.textContent = String(blockedAlerts);
    if (el2) el2.textContent = String(openTickets);
    if (el3) el3.textContent = String(resolved);
  },

  // ── Tab Switching ───────────────────────────────────────────────────
  _switchTab(tab) {
    this._activeTab = tab;
    const tabAlerts = document.getElementById('tabAlerts');
    const tabTickets = document.getElementById('tabTickets');
    const activeClass = 'px-4 py-2 rounded-full text-[13px] font-semibold transition-all cursor-pointer bg-primary text-on-primary shadow-sm flex items-center gap-1.5';
    const inactiveClass = 'px-4 py-2 rounded-full text-[13px] font-semibold transition-all cursor-pointer bg-surface-container text-on-surface-variant hover:bg-surface-container-high flex items-center gap-1.5';
    if (tabAlerts) tabAlerts.className = tab === 'alerts' ? activeClass : inactiveClass;
    if (tabTickets) tabTickets.className = tab === 'tickets' ? activeClass : inactiveClass;
    this._renderContent();
  },

  _renderContent() {
    const container = document.getElementById('mgrContent');
    if (!container) return;
    if (this._activeTab === 'alerts') { this._renderAlerts(container); }
    else { this._renderTickets(container); }
  },

  // ── Alerts Tab ──────────────────────────────────────────────────────
  _renderAlerts(container) {
    const alerts = this._alerts;
    if (!alerts.length) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-20 text-center bg-surface-container-lowest rounded-[24px] border border-outline-variant/30 p-8 shadow-sm">
          <span class="material-symbols-outlined text-[44px] text-emerald-500/40 mb-3">verified_user</span>
          <h3 class="font-headline-sm text-[18px] text-on-surface font-semibold mb-1">No Active Alerts</h3>
          <p class="font-body-sm text-on-surface-variant text-[13px]">All transactions are clear for this bank node.</p>
        </div>`;
      return;
    }

    container.innerHTML = `
      <div class="bg-surface-container-lowest rounded-[20px] border border-outline-variant/30 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-surface-container-high/50 border-b border-outline-variant/30">
                <th class="px-4 py-3 font-label-mono-sm text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Alert ID</th>
                <th class="px-4 py-3 font-label-mono-sm text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Transaction</th>
                <th class="px-4 py-3 font-label-mono-sm text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Customer</th>
                <th class="px-4 py-3 font-label-mono-sm text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Risk Score</th>
                <th class="px-4 py-3 font-label-mono-sm text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Status</th>
                <th class="px-4 py-3 font-label-mono-sm text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">AI Explanation</th>
                <th class="px-4 py-3 font-label-mono-sm text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Time</th>
                <th class="px-4 py-3 font-label-mono-sm text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Action</th>
              </tr>
            </thead>
            <tbody id="alertsTableBody"></tbody>
          </table>
        </div>
      </div>`;

    const tbody = document.getElementById('alertsTableBody');
    if (!tbody) return;

    tbody.innerHTML = alerts.map((a, idx) => {
      const masked = this._maskPhone(a.user_phone);
      const score = (a.risk_score || 0);
      const pct = Math.round(score * 100);
      const barColor = score > 0.85 ? 'bg-error' : score > 0.6 ? 'bg-amber-500' : 'bg-emerald-500';
      const isResolved = a.status === 'resolved';
      const statusBadge = isResolved
        ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-800 border border-emerald-500/30">Resolved</span>'
        : a.status === 'pending_review'
          ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-800 border border-amber-500/30">Pending</span>'
          : '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-error/10 text-error border border-error/20">Blocked</span>';
      
      const amountStr = a.amount ? `₹${Number(a.amount).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '';
      const entityStr = a.entity || 'Flagged Transaction';
      const channelStr = a.channel || '';

      return `
        <tr class="border-b border-outline-variant/15 hover:bg-surface-container-low/50 transition-colors" id="alert-row-${idx}">
          <td class="px-4 py-3.5 font-label-mono-md text-[12px] text-primary font-bold whitespace-nowrap">${a.alert_id || '—'}</td>
          <td class="px-4 py-3.5 min-w-[200px]">
            <div class="font-label-mono-md text-[12px] text-on-surface font-bold">${a.transaction_id || '—'}</div>
            <div class="font-body-sm text-[12px] text-on-surface font-semibold mt-0.5">${entityStr}</div>
            <div class="font-label-mono-sm text-[10px] text-on-surface-variant mt-0.5 flex items-center gap-1.5 flex-wrap">
              ${channelStr ? `<span class="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-medium">${channelStr}</span>` : ''}
              ${amountStr ? `<span class="font-bold text-error">${amountStr}</span>` : ''}
            </div>
          </td>
          <td class="px-4 py-3.5 whitespace-nowrap">
            <div class="font-body-sm text-[12px] font-semibold text-on-surface">${masked}</div>
            ${a.user_name ? `<div class="font-label-mono-sm text-[10px] text-on-surface-variant mt-0.5">${a.user_name}</div>` : ''}
          </td>
          <td class="px-4 py-3.5 whitespace-nowrap">
            <div class="flex items-center gap-2">
              <div class="w-16 h-2 rounded-full bg-surface-container-high overflow-hidden">
                <div class="${barColor} h-full rounded-full transition-all" style="width:${pct}%"></div>
              </div>
              <span class="font-label-mono-sm text-[11px] text-on-surface font-bold">${score.toFixed(2)}</span>
            </div>
          </td>
          <td class="px-4 py-3.5 whitespace-nowrap">${statusBadge}</td>
          <td class="px-4 py-3.5 font-body-sm text-[11px] text-on-surface-variant max-w-[260px]">
            <p class="leading-relaxed line-clamp-2" title="${(a.explanation_text || '').replace(/"/g, '&quot;')}">${a.explanation_text || 'Flagged by federated edge model.'}</p>
          </td>
          <td class="px-4 py-3.5 font-label-mono-sm text-[11px] text-on-surface-variant whitespace-nowrap">${a.timestamp || '—'}</td>
          <td class="px-4 py-3.5 whitespace-nowrap">
            ${isResolved ? '<span class="text-emerald-600 font-label-mono-sm text-[11px] font-bold">✓ Done</span>' :
              `<button onclick="window.ManagerPortalPage._resolveAlert('${a.alert_id}','${a.transaction_id}',${idx})"
                class="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 text-[11px] font-bold hover:bg-emerald-500/20 transition-all cursor-pointer">Resolve</button>`}
          </td>
        </tr>`;
    }).join('');
  },

  async _resolveAlert(alertId, txId, idx) {
    // Try API resolve
    try { await fetch(`http://127.0.0.1:8000/alerts/${txId}/resolve`, { method: 'PATCH' }); } catch (e) { /* silent */ }
    try { await fetch(`http://127.0.0.1:8001/alerts/${txId}/resolve`, { method: 'PATCH' }); } catch (e) { /* silent */ }

    // Update local state
    if (this._alerts[idx]) this._alerts[idx].status = 'resolved';
    this._updateStats();
    this._renderContent();
    this._showToast(`Alert ${alertId} resolved. Account unfrozen.`);
  },

  // ── Tickets Tab ─────────────────────────────────────────────────────
  _renderTickets(container) {
    const tickets = this._tickets;

    // Filter tabs
    const counts = {
      all: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      investigating: tickets.filter(t => t.status === 'investigating').length,
      branch_visit: tickets.filter(t => t.status === 'branch_visit' || t.status === 'not_closed').length,
      resolved: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
    };

    const filterLabels = { all: 'All', open: 'Under Review', investigating: 'Investigating', branch_visit: 'Branch Visit', resolved: 'Resolved' };
    const filtersHTML = Object.keys(filterLabels).map(key => {
      const isActive = this._ticketFilter === key;
      const cls = isActive
        ? 'px-3 py-1.5 rounded-full text-[11px] font-semibold bg-primary text-on-primary shadow-sm cursor-pointer transition-all'
        : 'px-3 py-1.5 rounded-full text-[11px] font-semibold bg-surface-container text-on-surface-variant hover:bg-surface-container-high cursor-pointer transition-all';
      return `<button class="${cls}" onclick="window.ManagerPortalPage._ticketFilter='${key}'; window.ManagerPortalPage._renderContent();">${filterLabels[key]} (${counts[key]})</button>`;
    }).join('');

    // Filter tickets
    let filtered = tickets;
    const f = this._ticketFilter;
    if (f === 'open') filtered = tickets.filter(t => t.status === 'open');
    else if (f === 'investigating') filtered = tickets.filter(t => t.status === 'investigating');
    else if (f === 'branch_visit') filtered = tickets.filter(t => t.status === 'branch_visit' || t.status === 'not_closed');
    else if (f === 'resolved') filtered = tickets.filter(t => t.status === 'resolved' || t.status === 'closed');

    let cardsHTML = '';
    if (!filtered.length) {
      cardsHTML = `
        <div class="flex flex-col items-center justify-center py-16 text-center bg-surface-container-lowest rounded-[24px] border border-outline-variant/30 p-8 shadow-sm">
          <span class="material-symbols-outlined text-[44px] text-on-surface-variant/30 mb-3">inbox</span>
          <h3 class="font-headline-sm text-[18px] text-on-surface font-semibold mb-1">No Tickets</h3>
          <p class="font-body-sm text-on-surface-variant text-[13px]">No investigation tickets match this filter.</p>
        </div>`;
    } else {
      cardsHTML = filtered.map(t => this._renderTicketCard(t)).join('');
    }

    container.innerHTML = `
      <div class="flex items-center gap-1.5 mb-4 overflow-x-auto py-1 scrollbar-none">${filtersHTML}</div>
      <div class="space-y-5">${cardsHTML}</div>`;
  },

  _renderTicketCard(t) {
    const sc = this._statusConfig(t.status);
    const masked = this._maskPhone(t.user_phone);
    const tid = t.ticket_id || t.id || '—';
    const timeline = t.timeline || [];

    const timelineHTML = timeline.map((step, idx) => {
      const isLatest = idx === 0;
      const dotColor = isLatest ? sc.dot : 'bg-outline-variant';
      return `
        <div class="flex gap-3 items-start">
          <div class="flex flex-col items-center shrink-0">
            <div class="w-2.5 h-2.5 rounded-full ${dotColor} mt-1.5"></div>
            ${idx < timeline.length - 1 ? '<div class="w-px h-10 bg-outline-variant/40 my-1"></div>' : ''}
          </div>
          <div class="pb-2 flex-1">
            <div class="flex items-center gap-2">
              <span class="font-headline-sm text-[12px] font-bold text-on-surface">${step.event || ''}</span>
              ${isLatest ? `<span class="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase font-mono ${sc.bg} ${sc.color}">LATEST</span>` : ''}
            </div>
            <div class="font-body-sm text-[11px] text-on-surface-variant/80 mt-0.5">${step.note || ''}</div>
            <div class="font-label-mono-sm text-[10px] text-on-surface-variant/50 mt-0.5 font-mono">${this._formatDate(step.timestamp)}</div>
          </div>
        </div>`;
    }).join('');

    const managerNoteHTML = t.manager_note ? `
      <div class="mt-3 bg-primary/5 border border-primary/15 rounded-xl p-3">
        <span class="block font-label-mono-sm text-[10px] uppercase tracking-wider text-primary font-bold mb-1">Manager Note</span>
        <p class="font-body-sm text-[12px] text-on-surface leading-relaxed">${t.manager_note}</p>
      </div>` : '';

    return `
      <div class="bg-surface-container-lowest rounded-[20px] border ${sc.border} shadow-sm overflow-hidden hover:shadow-md transition-all">
        <div class="p-5 border-b border-outline-variant/15">
          <div class="flex items-start justify-between gap-3 flex-wrap">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-2xl ${sc.bg} ${sc.color} flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-[22px]">${sc.icon}</span>
              </div>
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-label-mono-md text-[14px] font-bold text-on-surface font-mono tracking-wide">${tid}</span>
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${sc.badgeColor}">
                    <span class="w-1.5 h-1.5 rounded-full ${sc.dot}"></span> ${sc.label}
                  </span>
                  ${t.urgency === 'high' || t.urgency === 'critical' ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 border border-amber-200 text-amber-800">High Priority</span>' : ''}
                </div>
                <div class="font-body-sm text-[11px] text-on-surface-variant mt-0.5 flex items-center gap-1.5">
                  <span>${masked}</span><span>·</span>
                  <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[13px]">account_balance</span>${t.bank_name || ''}</span>
                  <span>·</span><span>${this._timeAgo(t.created_at)}</span>
                </div>
              </div>
            </div>
            <button onclick="window.ManagerPortalPage._openStatusModal('${tid}','${t.status}','${(t.status_label||'').replace(/'/g,"\\'")}')"
              class="inline-flex items-center gap-1.5 text-[12px] font-semibold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/25 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm shrink-0">
              <span class="material-symbols-outlined text-[16px]">edit_note</span> Update Status
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            <div class="bg-surface-container-lowest border border-outline-variant/25 p-3 rounded-xl">
              <span class="block font-label-mono-sm text-[10px] uppercase tracking-wider text-on-surface-variant/70 mb-0.5 font-bold">Dispute Reason</span>
              <span class="font-body-sm text-[12px] text-on-surface font-semibold">${t.reason_label || t.reason || '—'}</span>
            </div>
            <div class="bg-surface-container-lowest border border-outline-variant/25 p-3 rounded-xl">
              <span class="block font-label-mono-sm text-[10px] uppercase tracking-wider text-on-surface-variant/70 mb-0.5 font-bold">Transaction ID</span>
              <span class="font-body-sm text-[12px] text-on-surface font-mono font-medium">${t.tx_id ? '#' + t.tx_id : 'General'}</span>
            </div>
            <div class="bg-surface-container-lowest border border-outline-variant/25 p-3 rounded-xl">
              <span class="block font-label-mono-sm text-[10px] uppercase tracking-wider text-on-surface-variant/70 mb-0.5 font-bold">Customer</span>
              <span class="font-body-sm text-[12px] text-on-surface font-medium">${t.user_name || masked}</span>
            </div>
          </div>

          ${t.comments ? `<div class="mt-3 bg-surface-container/50 border border-outline-variant/25 rounded-xl p-3"><span class="block font-label-mono-sm text-[10px] uppercase tracking-wider text-on-surface-variant mb-0.5 font-semibold">User Notes</span><p class="font-body-sm text-[12px] text-on-surface leading-relaxed">${t.comments}</p></div>` : ''}
          ${managerNoteHTML}
        </div>

        ${timeline.length ? `
        <div class="p-5 bg-surface-container-lowest">
          <div class="flex items-center gap-1.5 mb-3 border-b border-outline-variant/15 pb-2">
            <span class="material-symbols-outlined text-primary text-[16px]">show_chart</span>
            <span class="font-label-mono-sm text-[10px] uppercase tracking-wider text-on-surface font-bold">Investigation Audit Trail</span>
          </div>
          <div class="pl-1">${timelineHTML}</div>
        </div>` : ''}
      </div>`;
  },

  // ── Status Modal ────────────────────────────────────────────────────
  _modalTicketId: null,
  _modalSelectedStatus: null,

  _openStatusModal(ticketId, currentStatus, currentLabel) {
    this._modalTicketId = ticketId;
    this._modalSelectedStatus = null;
    const modal = document.getElementById('statusModal');
    const subtitle = document.getElementById('modalSubtitle');
    const noteInput = document.getElementById('managerNoteInput');
    if (subtitle) subtitle.textContent = `Ticket: ${ticketId} | Current: ${currentLabel || currentStatus}`;
    if (noteInput) noteInput.value = '';

    const optionsContainer = document.getElementById('statusOptions');
    if (!optionsContainer) return;

    const options = [
      { status: 'open', icon: 'hourglass_top', label: 'Still Under Review — Taking More Time', note: 'Your case is still being reviewed. Expected resolution: 2-3 business days.', color: 'amber' },
      { status: 'investigating', icon: 'manage_search', label: 'Investigating — Assigned to Specialist', note: 'Your case has been escalated to a Senior Fraud Analyst for detailed review.', color: 'primary' },
      { status: 'branch_visit', icon: 'account_balance', label: 'Branch Visit Required', note: 'To protect your account, we need to verify your identity in person. Please visit your registered home branch with a valid Government Photo ID.', color: 'orange' },
      { status: 'resolved', icon: 'check_circle', label: 'Resolved — Account Unfrozen', note: 'Your case has been resolved. The temporary hold has been lifted. Any withheld funds will credit to your account within 24 hours.', color: 'emerald' },
    ];

    optionsContainer.innerHTML = options.map(opt => `
      <button class="w-full p-3.5 rounded-xl border border-outline-variant/30 hover:border-${opt.color === 'primary' ? 'primary' : opt.color + '-500'}/50 hover:bg-${opt.color === 'primary' ? 'primary' : opt.color + '-500'}/5 text-left transition-all cursor-pointer flex items-center gap-3 status-option"
        data-status="${opt.status}" data-note="${opt.note.replace(/"/g, '&quot;')}"
        onclick="window.ManagerPortalPage._selectStatus(this, '${opt.status}')">
        <span class="w-9 h-9 rounded-xl bg-${opt.color === 'primary' ? 'primary' : opt.color + '-500'}/10 text-${opt.color === 'primary' ? 'primary' : opt.color + '-700'} flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-[20px]">${opt.icon}</span>
        </span>
        <div class="flex-1 min-w-0">
          <div class="font-headline-sm text-[13px] font-bold text-on-surface">${opt.label}</div>
          <div class="font-body-sm text-[11px] text-on-surface-variant mt-0.5 truncate">${opt.note}</div>
        </div>
        <span class="material-symbols-outlined text-[18px] text-on-surface-variant/40">radio_button_unchecked</span>
      </button>
    `).join('');

    if (modal) { modal.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
  },

  _selectStatus(el, status) {
    this._modalSelectedStatus = status;
    // Highlight selected
    document.querySelectorAll('.status-option').forEach(btn => {
      btn.classList.remove('ring-2', 'ring-primary/40', 'bg-primary/5');
      const icon = btn.querySelector('.material-symbols-outlined:last-child');
      if (icon) icon.textContent = 'radio_button_unchecked';
    });
    el.classList.add('ring-2', 'ring-primary/40', 'bg-primary/5');
    const icon = el.querySelector('.material-symbols-outlined:last-child');
    if (icon) icon.textContent = 'radio_button_checked';
    // Pre-fill note
    const noteInput = document.getElementById('managerNoteInput');
    if (noteInput && el.dataset.note) noteInput.value = el.dataset.note.replace(/&quot;/g, '"');
  },

  _closeStatusModal() {
    const modal = document.getElementById('statusModal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
    this._modalTicketId = null;
    this._modalSelectedStatus = null;
  },

  async _submitStatusUpdate() {
    const ticketId = this._modalTicketId;
    const newStatus = this._modalSelectedStatus;
    if (!ticketId || !newStatus) return;

    const managerNote = document.getElementById('managerNoteInput')?.value || '';
    const token = localStorage.getItem('fs_manager_token') || '';

    const STATUS_LABELS = { open: 'Under Review', investigating: 'Investigating', branch_visit: 'Branch Visit Required', resolved: 'Resolved & Closed', closed: 'Resolved & Closed' };
    const TIMELINE_EVENTS = { open: 'Still Under Review — Processing Continues', investigating: 'Case Assigned to Senior Fraud Analyst', branch_visit: 'In-Person Branch Verification Required', resolved: 'Case Resolved — Account Unfrozen' };

    const statusLabel = STATUS_LABELS[newStatus] || newStatus;
    const timelineEvent = TIMELINE_EVENTS[newStatus] || newStatus;
    const nowIso = new Date().toISOString();

    // 1. Try API
    try {
      await fetch(`http://127.0.0.1:8001/manager/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-Manager-Token': token },
        body: JSON.stringify({
          new_status: newStatus,
          manager_note: managerNote,
          timeline_event: timelineEvent,
          timeline_note: managerNote
        })
      });
    } catch (e) { /* silent */ }

    // 2. Always update localStorage fs_tickets (shared with client)
    try {
      const all = JSON.parse(localStorage.getItem('fs_tickets') || '[]');
      const idx = all.findIndex(t => t.id === ticketId || t.ticket_id === ticketId);
      if (idx !== -1) {
        all[idx].status = newStatus;
        all[idx].statusLabel = statusLabel;
        all[idx].status_label = statusLabel;
        all[idx].manager_note = managerNote;
        all[idx].updatedAt = nowIso;
        all[idx].updated_at = nowIso;
        if (!Array.isArray(all[idx].timeline)) all[idx].timeline = [];
        all[idx].timeline.unshift({ event: timelineEvent, note: managerNote, timestamp: nowIso });
        localStorage.setItem('fs_tickets', JSON.stringify(all));
      }
    } catch (e) { /* silent */ }

    // 3. Also update internal state
    const tIdx = this._tickets.findIndex(t => (t.ticket_id || t.id) === ticketId);
    if (tIdx !== -1) {
      this._tickets[tIdx].status = newStatus;
      this._tickets[tIdx].status_label = statusLabel;
      this._tickets[tIdx].manager_note = managerNote;
      this._tickets[tIdx].updated_at = nowIso;
      if (!Array.isArray(this._tickets[tIdx].timeline)) this._tickets[tIdx].timeline = [];
      this._tickets[tIdx].timeline.unshift({ event: timelineEvent, note: managerNote, timestamp: nowIso });
    }

    // 4. If resolved, resolve linked alert
    if (newStatus === 'resolved' || newStatus === 'closed') {
      const ticket = this._tickets.find(t => (t.ticket_id || t.id) === ticketId);
      if (ticket && ticket.tx_id) {
        try { await fetch(`http://127.0.0.1:8001/alerts/${ticket.tx_id}/resolve`, { method: 'PATCH' }); } catch (e) {}
      }
    }

    this._closeStatusModal();
    this._updateStats();
    this._renderContent();
    this._showToast(`Ticket ${ticketId} updated to "${statusLabel}".`);
  },

  // ── Helpers ─────────────────────────────────────────────────────────
  _maskPhone(phone) {
    if (!phone || phone.length < 6) return phone || '—';
    return phone.substring(0, 2) + '****' + phone.substring(phone.length - 4);
  },

  _formatDate(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
        ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch { return iso || ''; }
  },

  _timeAgo(iso) {
    try {
      const s = Math.floor((Date.now() - new Date(iso)) / 1000);
      if (s < 60) return 'Just now';
      if (s < 3600) return `${Math.floor(s / 60)}m ago`;
      if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
      return `${Math.floor(s / 86400)}d ago`;
    } catch { return ''; }
  },

  _statusConfig(status) {
    const configs = {
      open: { color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', icon: 'hourglass_top', label: 'Under Review', dot: 'bg-primary', badgeColor: 'bg-primary/15 text-primary border border-primary/20' },
      investigating: { color: 'text-amber-700', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: 'manage_search', label: 'Investigating', dot: 'bg-amber-500', badgeColor: 'bg-amber-500/15 text-amber-800 border border-amber-500/30' },
      branch_visit: { color: 'text-orange-700', bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: 'account_balance', label: 'Branch Visit', dot: 'bg-orange-500', badgeColor: 'bg-orange-500/15 text-orange-800 border border-orange-500/30' },
      not_closed: { color: 'text-orange-700', bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: 'account_balance', label: 'Branch Visit', dot: 'bg-orange-500', badgeColor: 'bg-orange-500/15 text-orange-800 border border-orange-500/30' },
      resolved: { color: 'text-emerald-700', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: 'check_circle', label: 'Resolved', dot: 'bg-emerald-500', badgeColor: 'bg-emerald-500/15 text-emerald-800 border border-emerald-500/30' },
      closed: { color: 'text-emerald-700', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: 'check_circle', label: 'Resolved', dot: 'bg-emerald-500', badgeColor: 'bg-emerald-500/15 text-emerald-800 border border-emerald-500/30' },
    };
    return configs[status] || configs.open;
  },

  _showToast(msg) {
    const toast = document.getElementById('mgrToast');
    const msgEl = document.getElementById('mgrToastMsg');
    if (toast && msgEl) {
      msgEl.textContent = msg;
      toast.classList.remove('hidden');
      setTimeout(() => toast.classList.add('hidden'), 4000);
    }
  },

  _logout() {
    localStorage.removeItem('fs_manager_token');
    localStorage.removeItem('fs_manager_info');
    Router.navigate('/manager-login');
  },

  // ── Offline Fallbacks ───────────────────────────────────────────────
  _demoAlerts() {
    return [
      { alert_id: 'ALT-SWIFT01', transaction_id: 'TXN-SWIFT01', user_phone: '9988776655', user_name: 'Rajesh Sharma', entity: 'Global Apex Remittance Offshore Wire', channel: 'SWIFT Wire Transfer', amount: 185000.0, risk_score: 0.9780, status: 'blocked', explanation_text: 'Cross-border high-value wire anomaly targeting an unregistered offshore beneficiary with unusual layering characteristics.', timestamp: 'Today, 03:12 PM', bank_name: 'Nagaland Regional Bank' },
      { alert_id: 'ALT-AFEE16', transaction_id: 'TXN-AFEE16', user_phone: '9874561230', user_name: 'User 1230', entity: 'ATM Cash Withdrawal — Kolasib Kiosk', channel: 'Domestic ATM Debit', amount: 95246.76, risk_score: 0.9650, status: 'blocked', explanation_text: 'Off-hours ATM withdrawal of ₹95,246.76 in Kolasib, Mizoram. Extreme amount spike and cross-state geolocation mismatch.', timestamp: 'Today, 11:17 PM', bank_name: 'Nagaland Regional Bank' },
      { alert_id: 'ALT-79739E', transaction_id: 'TXN-79739E', user_phone: '9874561230', user_name: 'User 1230', entity: 'Manali Luxury Merchant Clearing', channel: 'POS Debit Terminal', amount: 95869.68, risk_score: 0.9520, status: 'blocked', explanation_text: 'Unverified POS charge of ₹95,869.68 in Manali, Himachal Pradesh. High-value retail spike and multi-state velocity anomaly.', timestamp: 'Today, 06:34 AM', bank_name: 'Nagaland Regional Bank' },
      { alert_id: 'ALT-EB0CCF', transaction_id: 'TXN-EB0CCF', user_phone: '9988776655', user_name: 'Rajesh Sharma', entity: 'Late-Night ATM Cash Withdrawal — Dimapur Central', channel: 'Domestic ATM Debit', amount: 25000.0, risk_score: 0.9420, status: 'blocked', explanation_text: 'Late-night domestic ATM withdrawal of ₹25,000.00 at 02:41 AM. Suspicious off-hours skimmer pattern flagged by federated edge model.', timestamp: 'Today, 02:41 AM', bank_name: 'Nagaland Regional Bank' },
      { alert_id: 'ALT-UPI092', transaction_id: 'TXN-UPI092', user_phone: '9876543210', user_name: 'Saiteja Pasula (Demo)', entity: 'FastCrypto Pay Direct Gateway Surge', channel: 'UPI Instant Debit', amount: 49999.0, risk_score: 0.9310, status: 'blocked', explanation_text: 'Rapid burst UPI debit of ₹49,999.00 into high-risk merchant gateway triggered edge heuristic guardrails.', timestamp: 'Today, 01:15 AM', bank_name: 'Nagaland Regional Bank' },
      { alert_id: 'ALT-CNP441', transaction_id: 'TXN-CNP441', user_phone: '9999999999', user_name: 'Demo Account', entity: 'Luxury Horology Zurich CNP', channel: 'International Online CNP', amount: 72400.0, risk_score: 0.9150, status: 'blocked', explanation_text: 'Card-Not-Present cross-border transaction of ₹72,400.00 flagged due to international merchant code without travel notification.', timestamp: 'Yesterday, 09:44 PM', bank_name: 'Nagaland Regional Bank' },
      { alert_id: 'ALT-POS882', transaction_id: 'TXN-POS882', user_phone: '9876543210', user_name: 'Saiteja Pasula (Demo)', entity: 'Highway Fuel Station Terminal Duplicate', channel: 'POS Terminal Swipe', amount: 8500.0, risk_score: 0.8920, status: 'blocked', explanation_text: 'Hardware skimming flag: Magnetic stripe fallback transaction executed within 3 minutes of a chip-and-PIN authorization 180 km away.', timestamp: 'Yesterday, 04:20 PM', bank_name: 'Nagaland Regional Bank' },
    ];
  },

  _localTickets(bankName) {
    try {
      const all = JSON.parse(localStorage.getItem('fs_tickets') || '[]');
      // Map client-side keys to portal keys
      return all.map(t => ({
        ticket_id: t.id || t.ticket_id,
        user_phone: t.phone || t.user_phone,
        user_name: t.userName || t.user_name,
        bank_id: t.bank_id || 'bank_1',
        bank_name: t.bank || t.bank_name || bankName || 'Nagaland Regional Bank',
        tx_id: t.txId || t.tx_id,
        reason: t.reason,
        reason_label: t.reasonLabel || t.reason_label,
        comments: t.comments,
        urgency: t.urgency || 'high',
        status: t.status || 'open',
        status_label: t.statusLabel || t.status_label || 'Under Review',
        manager_note: t.manager_note || null,
        created_at: t.createdAt || t.created_at,
        updated_at: t.updatedAt || t.updated_at,
        timeline: t.timeline || [],
      }));
    } catch (e) { return []; }
  }
};
