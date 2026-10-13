/**
 * ticket-status.js — View My Fraud Investigation Tickets
 * Shows submitted fraud investigation tickets with real-time status badges,
 * filter tabs, step-by-step audit timeline, branch visit routing for unclosed tickets,
 * reliable ticket deletion, and demo advance status controls.
 */

window.TicketStatusPage = {
  protected: true,
  _activeFilter: 'all',
  _ticketToDelete: null,

  render: async () => {
    // Clean up any previously attached modals from document.body to prevent duplicate elements
    document.querySelectorAll('.app-modal').forEach(el => el.remove());

    const div = document.createElement('div');
    div.className = "min-h-screen bg-surface flex flex-col p-4 md:p-8 relative page-enter";
    div.innerHTML = `
      <div class="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/8 via-surface to-surface -z-10"></div>

      <div class="w-full max-w-4xl mx-auto flex-1 flex flex-col pt-4 md:pt-8">
        <!-- Top Navigation & Header -->
        <div class="flex items-center justify-between gap-4 mb-6">
          <div class="flex items-center gap-3 min-w-0">
            <button onclick="Router.navigate('/dashboard')" 
              class="w-10 h-10 rounded-full border border-outline-variant/40 bg-surface-container-lowest hover:bg-surface-container flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-sm" 
              title="Return to Dashboard">
              <span class="material-symbols-outlined text-on-surface-variant text-[20px]">arrow_back</span>
            </button>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <h1 class="font-display-lg text-[26px] md:text-[30px] font-bold text-on-surface tracking-tight leading-none">Investigation Tickets</h1>
                <span id="ticketCountBadge" class="hidden px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold font-mono">0</span>
              </div>
              <p class="font-body-sm text-on-surface-variant mt-1 text-[13px]">Track disputes and privacy-preserving federated fraud reviews</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="Router.navigate('/raise-ticket')"
              class="shrink-0 inline-flex items-center gap-2 text-[13px] font-semibold bg-primary text-on-primary px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-all shadow-[0_4px_12px_rgba(84,63,213,0.25)] hover:shadow-[0_6px_16px_rgba(84,63,213,0.35)] hover:-translate-y-0.5 cursor-pointer">
              <span class="material-symbols-outlined text-[18px]">add_circle</span>
              <span class="hidden sm:inline">Raise New Ticket</span>
              <span class="sm:hidden">New</span>
            </button>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="flex items-center justify-between gap-3 mb-6 border-b border-outline-variant/30 pb-3 flex-wrap">
          <div class="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none" id="filterTabs">
            <button data-filter="all" class="filter-tab px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all cursor-pointer bg-primary text-on-primary shadow-sm">
              All Tickets <span id="count-all" class="ml-1 opacity-80">(0)</span>
            </button>
            <button data-filter="open" class="filter-tab px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all cursor-pointer bg-surface-container text-on-surface-variant hover:bg-surface-container-high">
              Under Review <span id="count-open" class="ml-1 opacity-80">(0)</span>
            </button>
            <button data-filter="investigating" class="filter-tab px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all cursor-pointer bg-surface-container text-on-surface-variant hover:bg-surface-container-high">
              Investigating <span id="count-investigating" class="ml-1 opacity-80">(0)</span>
            </button>
            <button data-filter="not_closed" class="filter-tab px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all cursor-pointer bg-surface-container text-on-surface-variant hover:bg-surface-container-high">
              Branch Visit Required <span id="count-not-closed" class="ml-1 opacity-80">(0)</span>
            </button>
            <button data-filter="resolved" class="filter-tab px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all cursor-pointer bg-surface-container text-on-surface-variant hover:bg-surface-container-high">
              Closed / Resolved <span id="count-resolved" class="ml-1 opacity-80">(0)</span>
            </button>
          </div>

          <div class="flex items-center gap-2 text-on-surface-variant text-[12px]">
            <span class="material-symbols-outlined text-[16px] text-emerald-600">verified_user</span>
            <span class="font-medium">Federated AI Audit Active</span>
          </div>
        </div>

        <!-- Toast Notification Area -->
        <div id="statusToast" class="hidden mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-[13px] font-medium flex items-center justify-between transition-all">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
            <span id="toastMsg">Action completed successfully.</span>
          </div>
          <button onclick="document.getElementById('statusToast').classList.add('hidden')" class="text-emerald-800/60 hover:text-emerald-800">
            <span class="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        <!-- Tickets List Container -->
        <div id="tickets-container" class="space-y-5 flex-1">
          <div class="flex flex-col items-center justify-center py-20 text-center" id="tickets-loading">
            <span class="material-symbols-outlined text-[44px] text-primary/40 mb-3 animate-spin">progress_activity</span>
            <p class="font-body-md text-on-surface-variant text-[14px]">Fetching ticket records...</p>
          </div>
        </div>

        <!-- Security / Information Footer -->
        <div class="mt-12 py-5 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-on-surface-variant font-label-mono-sm text-[11px]">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[15px] text-primary">shield</span>
            <span>Bank Grade Cryptographic Hold Verification &bull; Model FL-14</span>
          </div>
          <div class="flex items-center gap-4">
            <button onclick="window.TicketStatusPage._seedDemoData()" class="text-primary hover:underline cursor-pointer">
              Add Sample Demo Ticket
            </button>
            <span>&bull;</span>
            <a href="/dashboard" data-path="/dashboard" class="text-on-surface hover:underline">Return to Dashboard</a>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div id="deleteModal" class="app-modal" onclick="if(event.target === this) window.TicketStatusPage._closeDeleteModal()" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.65); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px); z-index:999999; align-items:center; justify-content:center; padding:1.25rem; box-sizing:border-box;">
        <div style="background:#ffffff; border-radius:1.25rem; padding:1.75rem; max-width:420px; width:100%; border:1px solid #e2e8f0; box-shadow:0 25px 50px -12px rgba(0,0,0,0.35); text-align:center;">
          <div style="width:52px; height:52px; border-radius:50%; background:rgba(220,38,38,0.12); color:#dc2626; display:flex; align-items:center; justify-content:center; margin:0 auto 14px;">
            <span class="material-symbols-outlined" style="font-size:28px;">delete_forever</span>
          </div>
          <h3 style="font-size:18px; font-weight:700; color:#0f172a; margin-bottom:8px; font-family:'Comfortaa', sans-serif;">Delete Investigation Ticket?</h3>
          <p id="deleteModalText" style="font-size:13px; color:#475569; line-height:1.5; margin-bottom:22px; font-family:'Comfortaa', sans-serif;">
            Are you sure you want to permanently delete this dispute ticket? This action cannot be undone.
          </p>
          <div style="display:flex; gap:10px;">
            <button id="cancelDeleteBtn" type="button" onclick="window.TicketStatusPage._closeDeleteModal()" 
              style="flex:1; padding:11px 0; border-radius:12px; border:1px solid #cbd5e1; background:#f8fafc; color:#334155; font-size:13px; font-weight:600; cursor:pointer; font-family:'Comfortaa', sans-serif; transition:all 0.15s;">
              Cancel
            </button>
            <button id="confirmDeleteBtn" type="button" onclick="window.TicketStatusPage._confirmDelete()" 
              style="flex:1; padding:11px 0; border-radius:12px; border:none; background:#dc2626; color:#ffffff; font-size:13px; font-weight:600; cursor:pointer; font-family:'Comfortaa', sans-serif; box-shadow:0 4px 12px rgba(220,38,38,0.3); transition:all 0.15s;">
              Yes, Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Advance Status Modal (Flow Picker) -->
      <div id="advanceModal" class="app-modal" onclick="if(event.target === this) window.TicketStatusPage._closeAdvanceModal()" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.65); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px); z-index:999999; align-items:center; justify-content:center; padding:1.25rem; box-sizing:border-box;">
        <div style="background:#ffffff; border-radius:1.25rem; padding:1.75rem; max-width:460px; width:100%; border:1px solid #e2e8f0; box-shadow:0 25px 50px -12px rgba(0,0,0,0.35);">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[22px]">fast_forward</span>
              <h3 class="font-headline-sm text-[17px] font-bold text-on-surface">Advance Investigation Flow</h3>
            </div>
            <button type="button" onclick="window.TicketStatusPage._closeAdvanceModal()" class="text-on-surface-variant hover:text-on-surface cursor-pointer p-1 rounded-lg">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <p class="font-body-sm text-[13px] text-on-surface-variant mb-4" id="advanceModalSubtitle">
            Select the next stage for this dispute:
          </p>
          <div class="space-y-2.5" id="advanceOptionsContainer">
            <!-- Populated dynamically -->
          </div>
        </div>
      </div>
    `;
    return div;
  },

  afterRender: async () => {
    const phone = localStorage.getItem('fs_active_phone') || '';
    
    // Ensure initial demo tickets exist if empty and not explicitly cleared before
    window.TicketStatusPage._ensureDemoSeeded(phone);

    // Mount modals directly to document.body so they are never constrained or clipped by container elements
    ['deleteModal', 'advanceModal'].forEach(id => {
      const modal = document.getElementById(id);
      if (modal && modal.parentElement !== document.body) {
        document.body.appendChild(modal);
      }
    });

    // Close modals on Escape key
    window.onkeydown = (e) => {
      if (e.key === 'Escape') {
        window.TicketStatusPage._closeDeleteModal();
        window.TicketStatusPage._closeAdvanceModal();
      }
    };

    // Setup filter listeners
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        window.TicketStatusPage._activeFilter = tab.getAttribute('data-filter');
        filterTabs.forEach(t => {
          t.className = "filter-tab px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all cursor-pointer bg-surface-container text-on-surface-variant hover:bg-surface-container-high";
        });
        tab.className = "filter-tab px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all cursor-pointer bg-primary text-on-primary shadow-sm";
        window.TicketStatusPage._renderList();
      });
    });

    // Initial render
    setTimeout(() => {
      window.TicketStatusPage._renderList();
    }, 200);
  },

  _ensureDemoSeeded(phone) {
    try {
      // Check if user has already initialized or deleted
      const seeded = localStorage.getItem('fs_tickets_seeded');
      if (seeded === 'true') return; // Do not resurrect tickets if user cleared them

      let all = JSON.parse(localStorage.getItem('fs_tickets') || '[]');
      if (!Array.isArray(all) || all.length === 0) {
        const defaultPhone = phone || '9988776655';
        const now = new Date();
        const twoDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString();
        const oneHourAgo = new Date(Date.now() - 1000 * 60 * 60).toISOString();

        const demoTickets = [
          {
            id: 'TKT-MV4W700E-2WS',
            phone: defaultPhone,
            userName: defaultPhone === '9988776655' ? 'Rajesh Sharma' : 'User ' + defaultPhone.slice(-4),
            bank: 'Nagaland Regional Bank',
            txId: 'TXN-CBE3AC',
            reason: 'stolen_card',
            reasonLabel: 'Card / credentials stolen',
            comments: 'Card lost during travel. Unknown POS authorization attempted.',
            urgency: 'high',
            urgencyLabel: 'High Priority',
            contactPref: 'sms',
            status: 'open',
            statusLabel: 'Under Review',
            createdAt: twoDaysAgo,
            updatedAt: oneHourAgo,
            timeline: [
              {
                event: 'Ticket submitted',
                timestamp: twoDaysAgo,
                note: 'Your investigation request has been received and queued.'
              }
            ]
          }
        ];
        localStorage.setItem('fs_tickets', JSON.stringify(demoTickets));
        localStorage.setItem('fs_tickets_seeded', 'true');
      }
    } catch (e) {
      console.error('Demo seeding failed:', e);
    }
  },

  _seedDemoData() {
    const phone = localStorage.getItem('fs_active_phone') || '9988776655';
    const accs = JSON.parse(localStorage.getItem('fs_accounts') || '{}');
    const user = accs[phone] || {};
    const now = new Date().toISOString();
    const id = 'TKT-' + Date.now().toString(36).toUpperCase().slice(-6) + '-' + Math.floor(10 + Math.random() * 90);

    const newTicket = {
      id,
      phone,
      userName: user.name || 'User ' + phone.slice(-4),
      bank: user.bankDisplayName || user.bank || 'Nagaland Regional Bank',
      txId: 'TXN-' + Math.floor(100000 + Math.random() * 900000),
      reason: 'unrecognized_merchant',
      reasonLabel: "Don't recognize merchant",
      comments: 'Suspicious overseas transaction flagged by on-device model.',
      urgency: 'high',
      urgencyLabel: 'High Priority',
      contactPref: 'sms',
      status: 'open',
      statusLabel: 'Under Review',
      createdAt: now,
      updatedAt: now,
      timeline: [
        {
          event: 'Ticket submitted',
          timestamp: now,
          note: 'Your investigation request has been received and queued.'
        }
      ]
    };

    const existing = JSON.parse(localStorage.getItem('fs_tickets') || '[]');
    existing.unshift(newTicket);
    localStorage.setItem('fs_tickets', JSON.stringify(existing));
    localStorage.setItem('fs_tickets_seeded', 'true');

    window.TicketStatusPage._showToast(`Sample ticket ${id} created.`);
    window.TicketStatusPage._renderList();
  },

  _renderList() {
    const container = document.getElementById('tickets-container');
    if (!container) return;

    const phone = localStorage.getItem('fs_active_phone') || '';
    let all = [];
    try {
      all = JSON.parse(localStorage.getItem('fs_tickets') || '[]');
    } catch (e) {
      all = [];
    }

    // Filter by user phone
    const userTickets = all.filter(t => !t.phone || t.phone === phone);

    // Update count badges
    const countAll = userTickets.length;
    const countOpen = userTickets.filter(t => t.status === 'open').length;
    const countInv = userTickets.filter(t => t.status === 'investigating').length;
    const countNotClosed = userTickets.filter(t => t.status === 'branch_visit' || t.status === 'not_closed').length;
    const countRes = userTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

    const cAllEl = document.getElementById('count-all');
    const cOpenEl = document.getElementById('count-open');
    const cInvEl = document.getElementById('count-investigating');
    const cNotClosedEl = document.getElementById('count-not-closed');
    const cResEl = document.getElementById('count-resolved');
    const badgeEl = document.getElementById('ticketCountBadge');

    if (cAllEl) cAllEl.textContent = `(${countAll})`;
    if (cOpenEl) cOpenEl.textContent = `(${countOpen})`;
    if (cInvEl) cInvEl.textContent = `(${countInv})`;
    if (cNotClosedEl) cNotClosedEl.textContent = `(${countNotClosed})`;
    if (cResEl) cResEl.textContent = `(${countRes})`;

    if (badgeEl) {
      badgeEl.textContent = `${countAll}`;
      badgeEl.classList.remove('hidden');
    }

    // Filter by active tab
    const filter = window.TicketStatusPage._activeFilter;
    let filtered = userTickets;
    if (filter === 'open') {
      filtered = userTickets.filter(t => t.status === 'open');
    } else if (filter === 'investigating') {
      filtered = userTickets.filter(t => t.status === 'investigating');
    } else if (filter === 'not_closed') {
      filtered = userTickets.filter(t => t.status === 'branch_visit' || t.status === 'not_closed');
    } else if (filter === 'resolved') {
      filtered = userTickets.filter(t => t.status === 'resolved' || t.status === 'closed');
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-20 text-center bg-surface-container-lowest rounded-[24px] border border-outline-variant/30 p-8 shadow-sm">
          <div class="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-4 text-on-surface-variant/40">
            <span class="material-symbols-outlined text-[36px]">inbox</span>
          </div>
          <h3 class="font-headline-sm text-[18px] text-on-surface font-semibold mb-1">
            ${filter === 'all' ? 'No Investigation Tickets' : `No ${filter.replace('_', ' ')} tickets`}
          </h3>
          <p class="font-body-sm text-on-surface-variant max-w-sm mb-6 text-[13px]">
            ${filter === 'all' 
              ? 'You have no active dispute tickets. When suspicious transactions are flagged, you can raise an investigation here.' 
              : `There are currently no tickets matching this filter.`}
          </p>
          <div class="flex items-center gap-3 flex-wrap justify-center">
            <button onclick="Router.navigate('/raise-ticket')"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-headline-sm text-[13px] hover:bg-primary/90 transition-all shadow-sm cursor-pointer">
              <span class="material-symbols-outlined text-[17px]">add</span>
              Raise Ticket
            </button>
            <button onclick="window.TicketStatusPage._seedDemoData()"
              class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-outline-variant/60 text-on-surface hover:bg-surface-container font-headline-sm text-[13px] transition-colors cursor-pointer">
              <span class="material-symbols-outlined text-[17px]">science</span>
              Add Demo Ticket
            </button>
          </div>
        </div>
      `;
      return;
    }

    const statusConfig = {
      open: {
        color: 'text-primary',
        bg: 'bg-primary/10',
        border: 'border-primary/20',
        icon: 'hourglass_top',
        label: 'Under Review',
        dot: 'bg-primary',
        badgeColor: 'bg-primary/15 text-primary border border-primary/20'
      },
      investigating: {
        color: 'text-amber-700',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        icon: 'manage_search',
        label: 'Investigating',
        dot: 'bg-amber-500',
        badgeColor: 'bg-amber-500/15 text-amber-800 border border-amber-500/30'
      },
      branch_visit: {
        color: 'text-orange-700',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/30',
        icon: 'account_balance',
        label: 'Branch Visit Required',
        dot: 'bg-orange-500',
        badgeColor: 'bg-orange-500/15 text-orange-800 border border-orange-500/30'
      },
      not_closed: {
        color: 'text-orange-700',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/30',
        icon: 'account_balance',
        label: 'Branch Visit Required',
        dot: 'bg-orange-500',
        badgeColor: 'bg-orange-500/15 text-orange-800 border border-orange-500/30'
      },
      resolved: {
        color: 'text-emerald-700',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        icon: 'check_circle',
        label: 'Resolved & Closed',
        dot: 'bg-emerald-500',
        badgeColor: 'bg-emerald-500/15 text-emerald-800 border border-emerald-500/30'
      },
      closed: {
        color: 'text-emerald-700',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        icon: 'check_circle',
        label: 'Resolved & Closed',
        dot: 'bg-emerald-500',
        badgeColor: 'bg-emerald-500/15 text-emerald-800 border border-emerald-500/30'
      }
    };

    const urgencyConfig = {
      normal: { color: 'text-on-surface-variant', bg: 'bg-surface-container', label: 'Normal' },
      high: { color: 'text-amber-800', bg: 'bg-amber-50 border border-amber-200', label: 'High Priority' },
      critical: { color: 'text-error', bg: 'bg-error-container', label: 'Critical Priority' }
    };

    function formatDate(iso) {
      try {
        const d = new Date(iso);
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
          ' • ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      } catch { return iso; }
    }

    function timeAgo(iso) {
      try {
        const seconds = Math.floor((Date.now() - new Date(iso)) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
      } catch { return ''; }
    }

    container.innerHTML = filtered.map(ticket => {
      const sc = statusConfig[ticket.status] || statusConfig.open;
      const uc = urgencyConfig[ticket.urgency] || urgencyConfig.high;
      const timeline = ticket.timeline || [];
      const isNotClosed = (ticket.status === 'branch_visit' || ticket.status === 'not_closed');
      const isClosed = (ticket.status === 'resolved' || ticket.status === 'closed');

      const timelineItems = timeline.map((step, idx) => {
        const isLatest = (idx === 0);
        const dotColor = isLatest ? sc.dot : 'bg-outline-variant';
        return `
          <div class="flex gap-3.5 items-start relative">
            <div class="flex flex-col items-center shrink-0">
              <div class="w-2.5 h-2.5 rounded-full ${dotColor} mt-1.5"></div>
              ${idx < timeline.length - 1 ? '<div class="w-px h-12 bg-outline-variant/40 my-1"></div>' : ''}
            </div>
            <div class="pb-3 text-left flex-1">
              <div class="flex items-center gap-2">
                <span class="font-headline-sm text-[13px] font-bold text-on-surface">${step.event}</span>
                ${isLatest ? `<span class="px-1.5 py-0.2 rounded text-[9px] font-bold tracking-wider uppercase font-mono ${sc.bg} ${sc.color}">LATEST</span>` : ''}
              </div>
              <div class="font-body-sm text-[12px] text-on-surface-variant/90 mt-0.5 leading-relaxed">${step.note || ''}</div>
              <div class="font-label-mono-sm text-[10px] text-on-surface-variant/60 mt-1 font-mono">${formatDate(step.timestamp)}</div>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="bg-surface-container-lowest rounded-[22px] border ${sc.border} shadow-sm overflow-hidden transition-all hover:shadow-md" id="card-${ticket.id}">
          <!-- Card Header & Metadata -->
          <div class="p-5 md:p-6 border-b border-outline-variant/20 bg-surface-container-low/30">
            <div class="flex items-start justify-between gap-4 flex-wrap">
              <div class="flex items-center gap-3.5 min-w-0">
                <div class="w-12 h-12 rounded-2xl ${sc.bg} ${sc.color} flex items-center justify-center shrink-0 shadow-inner">
                  <span class="material-symbols-outlined text-[24px]">${sc.icon}</span>
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-label-mono-md text-[14px] font-bold text-on-surface font-mono tracking-wide">${ticket.id}</span>
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${sc.badgeColor}">
                      <span class="w-1.5 h-1.5 rounded-full ${sc.dot}"></span>
                      ${sc.label}
                    </span>
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${uc.bg} ${uc.color}">
                      ${uc.label}
                    </span>
                  </div>
                  <div class="font-body-sm text-[12px] text-on-surface-variant flex items-center gap-2 mt-1">
                    <span>${timeAgo(ticket.createdAt)}</span>
                    <span>&bull;</span>
                    <span class="flex items-center gap-1 font-medium">
                      <span class="material-symbols-outlined text-[13px]">account_balance</span>
                      ${ticket.bank || 'Bank Partner'}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Top Right Controls: Advance Status & Delete -->
              <div class="flex items-center gap-2">
                <button onclick="window.TicketStatusPage._openAdvanceModal('${ticket.id}')"
                  class="inline-flex items-center gap-1.5 text-[12px] font-semibold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/25 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm"
                  title="Simulate progression of this ticket">
                  <span class="material-symbols-outlined text-[16px]">fast_forward</span>
                  Advance Status
                </button>
                <button onclick="window.TicketStatusPage._openDeleteModal('${ticket.id}')"
                  class="inline-flex items-center gap-1.5 text-[12px] font-semibold text-error/70 bg-error/5 hover:bg-error/10 border border-error/20 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                  title="Delete this ticket">
                  <span class="material-symbols-outlined text-[16px]">delete</span>
                  <span>Delete</span>
                </button>
              </div>
            </div>

            <!-- Details Grid: Dispute Reason, Tx ID, Notification Method -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <div class="bg-surface-container-lowest border border-outline-variant/30 p-3.5 rounded-2xl">
                <span class="block font-label-mono-sm text-[10px] uppercase tracking-wider text-on-surface-variant/70 mb-1 font-bold">Dispute Reason</span>
                <span class="font-body-sm text-[13px] text-on-surface font-semibold">${ticket.reasonLabel || ticket.reason}</span>
              </div>
              <div class="bg-surface-container-lowest border border-outline-variant/30 p-3.5 rounded-2xl">
                <span class="block font-label-mono-sm text-[10px] uppercase tracking-wider text-on-surface-variant/70 mb-1 font-bold">Transaction ID</span>
                <span class="font-body-sm text-[13px] text-on-surface font-mono font-medium">${ticket.txId ? '#' + ticket.txId : 'General Inquiry'}</span>
              </div>
              <div class="bg-surface-container-lowest border border-outline-variant/30 p-3.5 rounded-2xl">
                <span class="block font-label-mono-sm text-[10px] uppercase tracking-wider text-on-surface-variant/70 mb-1 font-bold">Notification Method</span>
                <span class="font-body-sm text-[13px] text-on-surface capitalize font-medium flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[15px] text-primary">${ticket.contactPref === 'email' ? 'mail' : ticket.contactPref === 'none' ? 'do_not_disturb' : 'chat'}</span>
                  ${ticket.contactPref === 'sms' ? 'Sms' : (ticket.contactPref || 'Sms')}
                </span>
              </div>
            </div>

            ${ticket.comments ? `
            <div class="mt-3 bg-surface-container/60 border border-outline-variant/30 rounded-xl p-3">
              <span class="block font-label-mono-sm text-[10px] uppercase tracking-wider text-on-surface-variant mb-1 font-semibold">User Notes</span>
              <p class="font-body-sm text-[12px] text-on-surface leading-relaxed">${ticket.comments}</p>
            </div>
            ` : ''}

            <!-- Special Action Banner for Unclosed / Branch Visit Tickets -->
            ${isNotClosed ? `
            <div class="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-[20px]">account_balance</span>
                </div>
                <div>
                  <h4 class="font-headline-sm text-[13px] font-bold text-amber-900">In-Person Bank Branch Verification Required</h4>
                  <p class="font-body-sm text-[12px] text-amber-800/90 mt-0.5">
                    This safeguard cannot be cleared online. Please visit your designated home branch with your Government ID.
                  </p>
                </div>
              </div>
              <button onclick="Router.navigate('/branch-verification?ticket=${ticket.id}')"
                class="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-headline-sm text-[12px] font-semibold transition-all shadow-sm cursor-pointer">
                <span>View Home Branch Details</span>
                <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
            ` : ''}
          </div>

          <!-- Investigation Audit Trail Section -->
          <div class="p-5 md:p-6 bg-surface-container-lowest">
            <div class="flex items-center justify-between mb-4 border-b border-outline-variant/15 pb-2.5">
              <span class="font-label-mono-sm text-[11px] uppercase tracking-wider text-on-surface font-bold flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[17px] text-primary">show_chart</span>
                INVESTIGATION AUDIT TRAIL
              </span>
              <span class="font-label-mono-sm text-[10px] text-on-surface-variant/70 font-mono">
                Updated: ${formatDate(ticket.updatedAt || ticket.createdAt)}
              </span>
            </div>
            <div class="space-y-0 pl-1">
              ${timelineItems}
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  // --- Deletion Flow (Reliable & Clean) ---
  _openDeleteModal(ticketId) {
    window.TicketStatusPage._ticketToDelete = ticketId;
    let modal = document.getElementById('deleteModal');
    if (!modal) {
      if (confirm(`Are you sure you want to permanently delete ticket ${ticketId}?`)) {
        window.TicketStatusPage._ticketToDelete = ticketId;
        window.TicketStatusPage._confirmDelete();
      }
      return;
    }
    // Guarantee modal is a child of document.body for true viewport positioning
    if (modal.parentElement !== document.body) {
      document.body.appendChild(modal);
    }
    const text = document.getElementById('deleteModalText');
    if (text) text.textContent = `Are you sure you want to permanently delete ticket ${ticketId}? This action cannot be undone.`;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  },

  _closeDeleteModal() {
    window.TicketStatusPage._ticketToDelete = null;
    const modal = document.getElementById('deleteModal');
    if (modal) {
      modal.style.display = 'none';
    }
    document.body.style.overflow = '';
  },

  _confirmDelete() {
    const ticketId = window.TicketStatusPage._ticketToDelete;
    if (!ticketId) return;

    let all = JSON.parse(localStorage.getItem('fs_tickets') || '[]');
    all = all.filter(t => t.id !== ticketId);
    localStorage.setItem('fs_tickets', JSON.stringify(all));
    localStorage.setItem('fs_tickets_seeded', 'true'); // Prevents auto-reseeding

    window.TicketStatusPage._closeDeleteModal();
    window.TicketStatusPage._showToast(`Ticket ${ticketId} was deleted successfully.`);
    window.TicketStatusPage._renderList();
  },

  // --- Advance Status Modal & Progression ---
  _openAdvanceModal(ticketId) {
    const all = JSON.parse(localStorage.getItem('fs_tickets') || '[]');
    const ticket = all.find(t => t.id === ticketId);
    if (!ticket) return;

    const modal = document.getElementById('advanceModal');
    const container = document.getElementById('advanceOptionsContainer');
    const subtitle = document.getElementById('advanceModalSubtitle');
    if (!modal || !container) return;

    subtitle.innerHTML = `Current Stage: <strong class="text-on-surface">${ticket.statusLabel || ticket.status}</strong> for <code>${ticket.id}</code>`;

    let optionsHTML = '';

    if (ticket.status === 'open') {
      optionsHTML = `
        <button onclick="window.TicketStatusPage._applyStatusChange('${ticket.id}', 'investigating')"
          class="w-full p-3.5 rounded-xl border border-outline-variant/30 hover:border-amber-500/50 hover:bg-amber-500/5 text-left transition-all cursor-pointer flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <span class="material-symbols-outlined text-[18px]">manage_search</span>
            </span>
            <div>
              <div class="font-headline-sm text-[13px] font-bold text-on-surface">Stage 2: Investigation in Progress</div>
              <div class="font-body-sm text-[11px] text-on-surface-variant">Assigns case to senior fraud risk specialist for behavioral analysis.</div>
            </div>
          </div>
          <span class="material-symbols-outlined text-[18px] text-on-surface-variant">arrow_forward</span>
        </button>
      `;
    } else if (ticket.status === 'investigating') {
      optionsHTML = `
        <button onclick="window.TicketStatusPage._applyStatusChange('${ticket.id}', 'resolved')"
          class="w-full p-3.5 rounded-xl border border-outline-variant/30 hover:border-emerald-500/50 hover:bg-emerald-500/5 text-left transition-all cursor-pointer flex items-center justify-between mb-2">
          <div class="flex items-center gap-3">
            <span class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
              <span class="material-symbols-outlined text-[18px]">check_circle</span>
            </span>
            <div>
              <div class="font-headline-sm text-[13px] font-bold text-emerald-800">Stage 3A: Ticket Closed (Resolved & Reversed)</div>
              <div class="font-body-sm text-[11px] text-on-surface-variant">Fraud confirmed, hold released, and funds scheduled for full return.</div>
            </div>
          </div>
          <span class="material-symbols-outlined text-[18px] text-emerald-700">task_alt</span>
        </button>

        <button onclick="window.TicketStatusPage._applyStatusChange('${ticket.id}', 'not_closed')"
          class="w-full p-3.5 rounded-xl border border-outline-variant/30 hover:border-orange-500/50 hover:bg-orange-500/5 text-left transition-all cursor-pointer flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-700 flex items-center justify-center">
              <span class="material-symbols-outlined text-[18px]">account_balance</span>
            </span>
            <div>
              <div class="font-headline-sm text-[13px] font-bold text-orange-800">Stage 3B: Ticket Not Closed (Visit Bank Branch)</div>
              <div class="font-body-sm text-[11px] text-on-surface-variant">Requires customer in-person branch verification with Photo ID to clear safeguard.</div>
            </div>
          </div>
          <span class="material-symbols-outlined text-[18px] text-orange-700">arrow_forward</span>
        </button>
      `;
    } else {
      // Already closed or branch visit - provide reset option for demo convenience
      optionsHTML = `
        <div class="text-[12px] text-on-surface-variant mb-2 p-3 bg-surface-container rounded-xl">
          This ticket has already reached its final evaluation stage. You can reset it to "Ticket Submitted" to demonstrate the flow again.
        </div>
        <button onclick="window.TicketStatusPage._applyStatusChange('${ticket.id}', 'open')"
          class="w-full p-3 rounded-xl border border-outline-variant/40 hover:bg-surface-container text-left transition-all cursor-pointer flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <span class="material-symbols-outlined text-primary text-[18px]">restart_alt</span>
            <span class="font-headline-sm text-[13px] font-semibold text-on-surface">Reset Flow to "Ticket Submitted"</span>
          </div>
        </button>
      `;
    }

    container.innerHTML = optionsHTML;
    if (modal.parentElement !== document.body) {
      document.body.appendChild(modal);
    }
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  },

  _closeAdvanceModal() {
    const modal = document.getElementById('advanceModal');
    if (modal) {
      modal.style.display = 'none';
    }
    document.body.style.overflow = '';
  },

  _applyStatusChange(ticketId, newStatus) {
    const all = JSON.parse(localStorage.getItem('fs_tickets') || '[]');
    const idx = all.findIndex(t => t.id === ticketId);
    if (idx === -1) return;

    const ticket = all[idx];
    const now = new Date().toISOString();

    if (newStatus === 'investigating') {
      ticket.status = 'investigating';
      ticket.statusLabel = 'Investigating';
      ticket.updatedAt = now;
      ticket.timeline.unshift({
        event: 'Investigation in Progress',
        timestamp: now,
        note: 'Assigned to Senior Risk Analyst. Cross-referencing encrypted federated behavioral cluster #7.'
      });
      window.TicketStatusPage._showToast('Status advanced to "Investigation in Progress".');
    } else if (newStatus === 'resolved') {
      ticket.status = 'resolved';
      ticket.statusLabel = 'Resolved & Closed';
      ticket.updatedAt = now;
      ticket.timeline.unshift({
        event: 'Transaction Reversed & Funds Restored',
        timestamp: now,
        note: 'Fraud dispute confirmed. Full funds have been scheduled for return and the temporary hold has been lifted.'
      });
      window.TicketStatusPage._showToast('Ticket marked as Resolved & Closed.');
    } else if (newStatus === 'not_closed') {
      ticket.status = 'branch_visit';
      ticket.statusLabel = 'Branch Visit Required';
      ticket.updatedAt = now;
      ticket.timeline.unshift({
        event: 'In-Person Branch Verification Required',
        timestamp: now,
        note: `Safeguard cannot be cleared remotely. Please visit your registered home branch (${ticket.bank}) with Government Photo ID to verify account holder identity.`
      });
      window.TicketStatusPage._showToast('Ticket marked: In-Person Bank Visit Required.');
    } else if (newStatus === 'open') {
      ticket.status = 'open';
      ticket.statusLabel = 'Under Review';
      ticket.updatedAt = now;
      ticket.timeline = [
        {
          event: 'Ticket submitted',
          timestamp: now,
          note: 'Your investigation request has been received and queued.'
        }
      ];
      window.TicketStatusPage._showToast('Ticket reset to "Ticket submitted".');
    }

    all[idx] = ticket;
    localStorage.setItem('fs_tickets', JSON.stringify(all));
    window.TicketStatusPage._closeAdvanceModal();
    window.TicketStatusPage._renderList();
  },

  _showToast(msg) {
    const toast = document.getElementById('statusToast');
    const msgEl = document.getElementById('toastMsg');
    if (toast && msgEl) {
      msgEl.textContent = msg;
      toast.classList.remove('hidden');
      setTimeout(() => {
        toast.classList.add('hidden');
      }, 3500);
    }
  }
};
