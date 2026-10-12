/**
 * ticket-status.js — View My Fraud Investigation Tickets
 * Shows submitted fraud investigation tickets with real-time status badges,
 * filter tabs, step-by-step audit timeline, and demo simulation controls.
 */

window.TicketStatusPage = {
  protected: true,
  _activeFilter: 'all',

  render: async () => {
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
            <button data-filter="resolved" class="filter-tab px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all cursor-pointer bg-surface-container text-on-surface-variant hover:bg-surface-container-high">
              Resolved <span id="count-resolved" class="ml-1 opacity-80">(0)</span>
            </button>
          </div>

          <div class="flex items-center gap-2 text-on-surface-variant text-[12px]">
            <span class="material-symbols-outlined text-[16px] text-emerald-600">verified_user</span>
            <span class="font-medium">Federated AI Audit Active</span>
          </div>
        </div>

        <!-- Tickets List Container -->
        <div id="tickets-container" class="space-y-4 flex-1">
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
    `;
    return div;
  },

  afterRender: async () => {
    const phone = localStorage.getItem('fs_active_phone') || '';
    
    // Ensure initial demo tickets exist if empty
    window.TicketStatusPage._ensureDemoSeeded(phone);

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
    }, 250);
  },

  _ensureDemoSeeded(phone) {
    try {
      let all = JSON.parse(localStorage.getItem('fs_tickets') || '[]');
      if (!Array.isArray(all) || all.length === 0) {
        const now = new Date();
        const twoDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString();
        const oneHourAgo = new Date(Date.now() - 1000 * 60 * 60).toISOString();

        const defaultPhone = phone || '9988776655';
        const demoTickets = [
          {
            id: 'TKT-FD-8921',
            phone: defaultPhone,
            userName: defaultPhone === '9988776655' ? 'Rajesh Sharma' : 'User ' + defaultPhone.slice(-4),
            bank: 'Nagaland Regional Bank',
            txId: 'TXN-FLAGGED-01',
            reason: 'unauthorized',
            reasonLabel: 'Transaction not authorized',
            comments: 'I did not make this international wire transfer to Crypto Gateway. Card was in my wallet.',
            urgency: 'high',
            urgencyLabel: 'High',
            contactPref: 'sms',
            status: 'investigating',
            statusLabel: 'Investigation in Progress',
            createdAt: twoDaysAgo,
            updatedAt: oneHourAgo,
            timeline: [
              {
                event: 'Investigation in Progress',
                timestamp: oneHourAgo,
                note: 'Assigned to Senior Risk Analyst. Cross-referencing encrypted federated behavioral cluster #7.'
              },
              {
                event: 'Automated Defense Hold Engaged',
                timestamp: twoDaysAgo,
                note: 'Local on-device inference flagged ₹1,50,000 transfer as high anomaly.'
              },
              {
                event: 'Ticket Submitted',
                timestamp: twoDaysAgo,
                note: 'Customer disputed transaction via mobile banking.'
              }
            ]
          }
        ];
        localStorage.setItem('fs_tickets', JSON.stringify(demoTickets));
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
    const id = 'TKT-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);

    const newTicket = {
      id,
      phone,
      userName: user.name || 'User ' + phone.slice(-4),
      bank: user.bankDisplayName || user.bank || 'Nagaland Regional Bank',
      txId: 'TXN-' + Math.floor(100000 + Math.random() * 900000),
      reason: 'unrecognized_merchant',
      reasonLabel: "Don't recognize merchant",
      comments: 'Suspicious charge from unknown vendor on POS terminal.',
      urgency: 'normal',
      urgencyLabel: 'Normal',
      contactPref: 'sms',
      status: 'open',
      statusLabel: 'Open — Under Review',
      createdAt: now,
      updatedAt: now,
      timeline: [
        {
          event: 'Ticket submitted',
          timestamp: now,
          note: 'Investigation request submitted and scheduled for federated audit.'
        }
      ]
    };

    const existing = JSON.parse(localStorage.getItem('fs_tickets') || '[]');
    existing.unshift(newTicket);
    localStorage.setItem('fs_tickets', JSON.stringify(existing));
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

    // Filter by user phone (allow matching tickets with matching phone or if single user demo)
    const userTickets = all.filter(t => !t.phone || t.phone === phone);

    // Update count badges
    const countAll = userTickets.length;
    const countOpen = userTickets.filter(t => t.status === 'open').length;
    const countInv = userTickets.filter(t => t.status === 'investigating').length;
    const countRes = userTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

    const cAllEl = document.getElementById('count-all');
    const cOpenEl = document.getElementById('count-open');
    const cInvEl = document.getElementById('count-investigating');
    const cResEl = document.getElementById('count-resolved');
    const badgeEl = document.getElementById('ticketCountBadge');

    if (cAllEl) cAllEl.textContent = `(${countAll})`;
    if (cOpenEl) cOpenEl.textContent = `(${countOpen})`;
    if (cInvEl) cInvEl.textContent = `(${countInv})`;
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
            ${filter === 'all' ? 'No Investigation Tickets Yet' : `No ${filter.replace('_', ' ')} tickets`}
          </h3>
          <p class="font-body-sm text-on-surface-variant max-w-sm mb-6 text-[13px]">
            ${filter === 'all' 
              ? 'When our Federated AI detects suspicious activities, you can raise an investigation ticket to dispute fraudulent transactions.' 
              : `There are currently no tickets in the "${filter}" category.`}
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
              Add Sample Ticket
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
        dot: 'bg-primary animate-pulse'
      },
      investigating: {
        color: 'text-amber-700',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        icon: 'manage_search',
        label: 'Investigating',
        dot: 'bg-amber-500 animate-pulse'
      },
      resolved: {
        color: 'text-emerald-700',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        icon: 'check_circle',
        label: 'Resolved & Reversed',
        dot: 'bg-emerald-500'
      },
      closed: {
        color: 'text-on-surface-variant',
        bg: 'bg-surface-container',
        border: 'border-outline-variant/30',
        icon: 'cancel',
        label: 'Closed',
        dot: 'bg-outline-variant'
      }
    };

    const urgencyConfig = {
      normal: { color: 'text-on-surface-variant', bg: 'bg-surface-container', label: 'Normal' },
      high: { color: 'text-amber-700', bg: 'bg-amber-50 border border-amber-200', label: 'High Priority' },
      critical: { color: 'text-error', bg: 'bg-error-container', label: 'Critical Priority' }
    };

    function formatDate(iso) {
      try {
        const d = new Date(iso);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) +
          ' • ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
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
      const uc = urgencyConfig[ticket.urgency] || urgencyConfig.normal;
      const timeline = ticket.timeline || [];

      const timelineItems = timeline.map((step, idx) => `
        <div class="flex gap-3 items-start relative">
          <div class="flex flex-col items-center shrink-0">
            <div class="w-2.5 h-2.5 rounded-full ${idx === 0 ? sc.dot : 'bg-outline-variant'} mt-1"></div>
            ${idx < timeline.length - 1 ? '<div class="w-px h-10 bg-outline-variant/40 my-1"></div>' : ''}
          </div>
          <div class="pb-3 text-left">
            <div class="font-label-mono-md text-[12px] font-bold text-on-surface flex items-center gap-2">
              <span>${step.event}</span>
              ${idx === 0 ? `<span class="px-1.5 py-0.2 rounded text-[9px] font-mono bg-primary/10 text-primary">LATEST</span>` : ''}
            </div>
            <div class="font-body-sm text-[12px] text-on-surface-variant/90 mt-0.5 leading-relaxed">${step.note || ''}</div>
            <div class="font-label-mono-sm text-[10px] text-on-surface-variant/60 mt-1 font-mono">${formatDate(step.timestamp)}</div>
          </div>
        </div>
      `).join('');

      return `
        <div class="bg-surface-container-lowest rounded-[22px] border ${sc.border} shadow-sm overflow-hidden transition-all hover:shadow-md">
          <!-- Card Header -->
          <div class="p-5 md:p-6 border-b border-outline-variant/20 bg-surface-container-low/40">
            <div class="flex items-start justify-between gap-4 flex-wrap">
              <div class="flex items-center gap-3.5 min-w-0">
                <div class="w-11 h-11 rounded-2xl ${sc.bg} ${sc.color} flex items-center justify-center shrink-0 shadow-inner">
                  <span class="material-symbols-outlined text-[24px]">${sc.icon}</span>
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-label-mono-md text-[13px] font-bold text-on-surface font-mono tracking-wide">${ticket.id}</span>
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${sc.bg} ${sc.color}">
                      <span class="w-1.5 h-1.5 rounded-full ${sc.dot}"></span>
                      ${sc.label}
                    </span>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${uc.bg} ${uc.color}">
                      ${uc.label}
                    </span>
                  </div>
                  <div class="font-body-sm text-[12px] text-on-surface-variant flex items-center gap-2 mt-1">
                    <span>${timeAgo(ticket.createdAt)}</span>
                    <span>&bull;</span>
                    <span class="flex items-center gap-1">
                      <span class="material-symbols-outlined text-[13px]">account_balance</span>
                      ${ticket.bank || 'Bank Partner'}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Quick Action Simulator -->
              <div class="flex items-center gap-2">
                ${ticket.status !== 'resolved' && ticket.status !== 'closed' ? `
                <button onclick="window.TicketStatusPage._advanceStatus('${ticket.id}')"
                  class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  title="Simulate fraud investigation progress for testing">
                  <span class="material-symbols-outlined text-[14px]">fast_forward</span>
                  Advance Status
                </button>
                ` : `
                <span class="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  <span class="material-symbols-outlined text-[14px]">task_alt</span> Case Closed
                </span>
                `}
                <button onclick="window.TicketStatusPage._deleteTicket('${ticket.id}')"
                  class="w-7 h-7 rounded-lg text-on-surface-variant/50 hover:text-error hover:bg-error-container/20 flex items-center justify-center transition-colors cursor-pointer"
                  title="Remove ticket">
                  <span class="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </div>

            <!-- Details Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <div class="bg-surface-container-lowest border border-outline-variant/30 p-3 rounded-xl">
                <span class="block font-label-mono-sm text-[10px] uppercase tracking-wider text-on-surface-variant/70 mb-0.5">Dispute Reason</span>
                <span class="font-body-sm text-[13px] text-on-surface font-semibold">${ticket.reasonLabel || ticket.reason}</span>
              </div>
              <div class="bg-surface-container-lowest border border-outline-variant/30 p-3 rounded-xl">
                <span class="block font-label-mono-sm text-[10px] uppercase tracking-wider text-on-surface-variant/70 mb-0.5">Transaction ID</span>
                <span class="font-body-sm text-[13px] text-on-surface font-mono font-medium">${ticket.txId ? '#' + ticket.txId : 'General Inquiry'}</span>
              </div>
              <div class="bg-surface-container-lowest border border-outline-variant/30 p-3 rounded-xl">
                <span class="block font-label-mono-sm text-[10px] uppercase tracking-wider text-on-surface-variant/70 mb-0.5">Notification Method</span>
                <span class="font-body-sm text-[13px] text-on-surface capitalize font-medium flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px] text-primary">${ticket.contactPref === 'email' ? 'mail' : ticket.contactPref === 'none' ? 'do_not_disturb' : 'sms'}</span>
                  ${ticket.contactPref || 'SMS'}
                </span>
              </div>
            </div>

            ${ticket.comments ? `
            <div class="mt-3 bg-surface-container/60 border border-outline-variant/30 rounded-xl p-3">
              <span class="block font-label-mono-sm text-[10px] uppercase tracking-wider text-on-surface-variant mb-1 font-semibold">User Notes</span>
              <p class="font-body-sm text-[12px] text-on-surface leading-relaxed">${ticket.comments}</p>
            </div>
            ` : ''}
          </div>

          <!-- Timeline Section -->
          <div class="p-5 md:p-6 bg-surface-container-lowest">
            <div class="flex items-center justify-between mb-4">
              <span class="font-label-mono-sm text-[11px] uppercase tracking-wider text-on-surface font-bold flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px] text-primary">timeline</span>
                Investigation Audit Trail
              </span>
              <span class="font-label-mono-sm text-[10px] text-on-surface-variant font-mono">Updated: ${formatDate(ticket.updatedAt || ticket.createdAt)}</span>
            </div>
            <div class="space-y-0 pl-1">
              ${timelineItems}
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  _advanceStatus(ticketId) {
    const all = JSON.parse(localStorage.getItem('fs_tickets') || '[]');
    const idx = all.findIndex(t => t.id === ticketId);
    if (idx === -1) return;

    const ticket = all[idx];
    const now = new Date().toISOString();

    if (ticket.status === 'open') {
      ticket.status = 'investigating';
      ticket.statusLabel = 'Investigating';
      ticket.updatedAt = now;
      ticket.timeline.unshift({
        event: 'Specialist Review in Progress',
        timestamp: now,
        note: 'Privacy-preserving anomaly scores cross-validated. Assigned to senior fraud mitigation agent.'
      });
    } else if (ticket.status === 'investigating') {
      ticket.status = 'resolved';
      ticket.statusLabel = 'Resolved & Reversed';
      ticket.updatedAt = now;
      ticket.timeline.unshift({
        event: 'Transaction Reversed & Funds Restored',
        timestamp: now,
        note: 'Fraud dispute confirmed. Full funds have been scheduled for return and the temporary hold has been lifted.'
      });
    }

    all[idx] = ticket;
    localStorage.setItem('fs_tickets', JSON.stringify(all));
    window.TicketStatusPage._renderList();
  },

  _deleteTicket(ticketId) {
    if (!confirm('Are you sure you want to dismiss this ticket record?')) return;
    let all = JSON.parse(localStorage.getItem('fs_tickets') || '[]');
    all = all.filter(t => t.id !== ticketId);
    localStorage.setItem('fs_tickets', JSON.stringify(all));
    window.TicketStatusPage._renderList();
  }
};
