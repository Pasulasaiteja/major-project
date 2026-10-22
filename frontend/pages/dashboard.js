window.DashboardPage = {
  protected: true,
  render: async () => {
    const div = document.createElement('div');
    div.className = "min-h-screen bg-surface flex flex-col page-enter";
    div.innerHTML = `
      <!-- Header -->
      <header class="sticky top-0 z-50 bg-surface/80 backdrop-blur-lg border-b border-outline-variant/30 px-margin lg:px-margin-desktop h-16 flex items-center justify-between">
        <div class="flex items-center gap-space-sm">
          <div class="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center">
            <span class="material-symbols-outlined text-primary text-[18px]">policy</span>
          </div>
          <span class="font-headline-sm text-headline-sm text-on-surface">FEDERATED SENTINEL</span>
        </div>
        <div class="flex items-center gap-space-sm">
          <!-- Tickets quick link -->
          <button onclick="Router.navigate('/ticket-status')" title="My Tickets" class="w-10 h-10 rounded-full hover:bg-surface-container-high transition-colors flex items-center justify-center relative cursor-pointer">
            <span class="material-symbols-outlined text-on-surface-variant">receipt_long</span>
            <span class="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" id="ticketBadge" style="display:none;"></span>
          </button>

          <button class="w-10 h-10 rounded-full hover:bg-surface-container-high transition-colors flex items-center justify-center relative">
            <span class="material-symbols-outlined text-on-surface-variant">notifications</span>
            <span class="absolute top-2 right-2 w-2 h-2 rounded-full bg-error" id="notifBadge" style="display:none;"></span>
          </button>

          <!-- Profile Dropdown -->
          <div class="relative" id="profileDropdownWrapper">
            <button id="profileBtn" class="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-headline-sm text-headline-sm shadow-sm hover:opacity-90 transition-opacity cursor-pointer">
              US
            </button>
            <div id="profileDropdown" class="hidden absolute right-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-xl py-2 z-50">
              <div class="px-4 py-2 border-b border-outline-variant/20 mb-1">
                <div class="font-headline-sm text-sm text-on-surface font-semibold" id="dropdownUserName">User Account</div>
                <div class="font-body-sm text-xs text-on-surface-variant" id="dropdownUserPhone">+91 Verified</div>
              </div>
              <a href="/ticket-status" data-path="/ticket-status" class="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container transition-colors">
                <span class="material-symbols-outlined text-[18px] text-on-surface-variant">receipt_long</span>
                My Tickets
              </a>
              <a href="/profile" data-path="/profile" class="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container transition-colors">
                <span class="material-symbols-outlined text-[18px] text-on-surface-variant">person</span>
                Profile & Settings
              </a>
              <button id="logoutBtn" class="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error-container/20 transition-colors">
                <span class="material-symbols-outlined text-[18px]">logout</span>
                Log Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main class="flex-1 w-full max-w-7xl mx-auto px-margin lg:px-margin-desktop py-space-xl">
        <div class="flex items-center gap-2 mb-8">
          <span class="font-label-mono-sm text-label-mono-sm uppercase text-primary font-bold tracking-wider">Account Overview</span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mb-8">
          <!-- Main Balance Card (Spending Limit Style) -->
          <div class="lg:col-span-8 rounded-[24px] border border-outline-variant/30 bg-surface-container-lowest p-6 md:p-8 text-on-surface shadow-sm relative overflow-hidden">
            <header class="flex items-start justify-between">
              <div>
                <h2 class="font-headline-sm text-xl font-semibold tracking-tight">Account Balance</h2>
                <p class="text-sm text-on-surface-variant font-body-sm mt-1">Data up to date</p>
              </div>
              <button class="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors border border-outline-variant/30 bg-surface hover:bg-surface-variant hover:text-on-surface h-9 px-4">
                View Report
              </button>
            </header>

            <div class="mt-8">
              <p class="font-display-lg text-[42px] leading-none font-bold tracking-tight text-on-surface">
                ₹1,12,450.80
                <span class="ml-2 text-base font-medium text-on-surface-variant">
                  of ₹5,00,000.00 Limit
                </span>
              </p>
            </div>

            <!-- Segmented Progress Bar -->
            <div class="mt-6" role="progressbar" aria-valuenow="22.5" aria-valuemin="0" aria-valuemax="100">
              <div class="flex w-full items-center gap-1.5">
                <div class="h-2.5 flex-1 rounded-full bg-emerald-500"></div>
                <div class="h-2.5 flex-1 rounded-full bg-emerald-500"></div>
                <div class="h-2.5 flex-1 rounded-full bg-emerald-500/20"></div>
                <div class="h-2.5 flex-1 rounded-full bg-emerald-500/20"></div>
                <div class="h-2.5 flex-1 rounded-full bg-emerald-500/20"></div>
                <div class="h-2.5 flex-1 rounded-full bg-emerald-500/20"></div>
                <div class="h-2.5 flex-1 rounded-full bg-emerald-500/20"></div>
              </div>
            </div>
            
            <div class="mt-8 flex items-center gap-6">
                <button class="px-6 py-3 rounded-full bg-primary text-on-primary font-body-md text-body-md font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2">
                  <span class="material-symbols-outlined text-[18px]">send</span> Transfer
                </button>
                <div class="flex gap-4 font-label-mono-md text-label-mono-md text-on-surface-variant">
                  <div class="flex flex-col"><span class="text-xs">Checking</span><span class="font-bold">••4820</span></div>
                  <div class="w-px h-8 bg-outline-variant/30"></div>
                  <div class="flex flex-col"><span class="text-xs">Routing</span><span class="font-bold">021000021</span></div>
                </div>
            </div>
          </div>
          
          <!-- Sentinel Status Mini Card -->
          <div class="lg:col-span-4 rounded-[24px] bg-surface-container border border-outline-variant/40 p-6 flex flex-col justify-between" id="sentinelStatusCard">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-[24px]">shield_locked</span>
              </div>
              <div>
                <h3 class="font-headline-sm text-headline-sm text-on-surface">Sentinel Active</h3>
                <span class="font-label-mono-sm text-label-mono-sm text-on-surface-variant">Federated AI monitoring on</span>
              </div>
            </div>
            
            <div class="space-y-3">
              <div class="flex justify-between text-body-sm font-body-sm">
                <span class="text-on-surface-variant">Protected Cards</span>
                <span class="text-on-surface font-semibold">2 Active</span>
              </div>
              <div class="flex justify-between text-body-sm font-body-sm">
                <span class="text-on-surface-variant">Recent Scans</span>
                <span class="text-on-surface font-semibold" id="scanCount">Loading...</span>
              </div>
              <div class="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden mt-1">
                <div class="h-full bg-primary w-full origin-left animate-[pulse_2s_ease-in-out_infinite]"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Fraud Alert Banner (Hidden by default) -->
        <div id="alertBanner" class="hidden w-full p-4 mb-8 rounded-xl bg-error-container border border-error/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex gap-3">
            <span class="material-symbols-outlined text-error text-[24px] shrink-0 mt-0.5">warning</span>
            <div>
              <h4 class="font-headline-sm text-headline-sm text-on-error-container">Suspicious Activity Detected</h4>
              <p class="font-body-sm text-body-sm text-on-error-container/80 mt-0.5">We've placed a temporary hold on a recent transaction to protect your account.</p>
            </div>
          </div>
          <button id="reviewAlertBtn" class="shrink-0 px-5 py-2.5 rounded-lg bg-error text-on-error font-body-sm text-body-sm font-bold hover:bg-error/90 transition-colors shadow-sm">
            Review Activity
          </button>
        </div>

        <!-- Transactions Section -->
        <div class="w-full">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-headline-md text-headline-md text-on-surface">Recent Transactions</h3>
            <button class="font-label-mono-sm text-label-mono-sm text-primary hover:underline uppercase tracking-wider font-semibold">View All</button>
          </div>
          
          <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
            <div id="txList" class="divide-y divide-outline-variant/20">
              <!-- Loading placeholders -->
              <div class="p-4 flex gap-4 shimmer">
                <div class="w-12 h-12 rounded-full bg-surface-variant shrink-0"></div>
                <div class="flex-1 space-y-2 py-1"><div class="h-4 bg-surface-variant rounded w-1/3"></div><div class="h-3 bg-surface-variant rounded w-1/4"></div></div>
              </div>
              <div class="p-4 flex gap-4 shimmer">
                <div class="w-12 h-12 rounded-full bg-surface-variant shrink-0"></div>
                <div class="flex-1 space-y-2 py-1"><div class="h-4 bg-surface-variant rounded w-1/3"></div><div class="h-3 bg-surface-variant rounded w-1/4"></div></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Simulate Transaction Tool (Demo Purpose) -->
        <div class="mt-12 p-6 bg-surface-container-high rounded-xl border border-outline-variant/50">
          <div class="flex items-center gap-2 mb-4">
            <span class="material-symbols-outlined text-primary text-[20px]">science</span>
            <h4 class="font-headline-sm text-headline-sm text-on-surface">Demo Tools</h4>
          </div>
          <p class="font-body-sm text-body-sm text-on-surface-variant mb-4">Simulate an incoming transaction to trigger the edge node's local inference.</p>
          <button id="simFraudBtn" class="px-4 py-2 bg-error-container text-on-error-container font-label-mono-md text-label-mono-md rounded border border-error/20 hover:bg-error hover:text-on-error transition-colors">
            Simulate Fraudulent Transaction
          </button>
        </div>
      </main>
    </div>
    `;
    return div;
  },
  afterRender: async () => {
    const txList = document.getElementById('txList');
    const notifBadge = document.getElementById('notifBadge');
    const alertBanner = document.getElementById('alertBanner');
    const ticketBadge = document.getElementById('ticketBadge');
    let activeAlertId = null;

    // Check user's tickets
    try {
      const activePhone = localStorage.getItem('fs_active_phone') || '';
      const allTickets = JSON.parse(localStorage.getItem('fs_tickets') || '[]');
      const userTickets = allTickets.filter(t => t.phone === activePhone && t.status !== 'closed' && t.status !== 'resolved');
      if (ticketBadge && userTickets.length > 0) {
        ticketBadge.style.display = 'block';
      }
    } catch (e) {}

    async function loadData() {
      try {
        const activeUser = API.getAuth().user;
        const storedPhone = localStorage.getItem('fs_active_phone');
        const activePhone = (activeUser ? (activeUser.phone || activeUser.account_number) : '') || storedPhone || '';
        const txs = await API.getTransactions(activePhone);
        const alerts = await API.getAlerts(null, null, activePhone);
        
        document.getElementById('scanCount').textContent = `${txs.length} Scans Today`;

        // Render transactions
        txList.innerHTML = '';
        if (txs.length === 0) {
          txList.innerHTML = '<div class="p-6 text-center text-on-surface-variant font-body-sm">No recent transactions.</div>';
        } else {
          txs.forEach(tx => {
            // Find if there's an active alert for this tx
            const alert = alerts.find(a => String(a.transaction_id) === String(tx.id) && a.status === 'blocked');
            const isFlagged = tx.status === 'Flagged' || !!alert;
            const isIncoming = tx.isPositive === true || tx.is_positive === 1 || String(tx.amount || '').startsWith('+') || (tx.channelType && tx.channelType.toLowerCase().includes('in')) || (tx.channel && tx.channel.toLowerCase().includes('inbound'));
            const entityStr = tx.entity || 'Transaction';
            const icon = entityStr.toLowerCase().includes('atm') ? 'local_atm' : 
                         entityStr.toLowerCase().includes('wire') ? 'account_balance' : 
                         entityStr.toLowerCase().includes('cash') ? 'local_atm' : 'credit_card';
            
            let statusBadge = `<span class="px-2 py-0.5 rounded-full badge-cleared font-label-mono-sm text-[10px] font-semibold uppercase">${tx.status || 'Cleared'}</span>`;
            if (isFlagged) {
              statusBadge = `<span class="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 border border-amber-500/30 font-label-mono-sm text-[10px] font-semibold uppercase">Pending Security Review</span>`;
            }

            // Proper amount-sign formatting logic based on direction (receiving bank perspective)
            let formattedAmount = tx.amount || '₹0.00';
            if (typeof tx.raw_amount === 'number' || typeof tx.amount === 'number') {
              const numVal = Math.abs(tx.raw_amount || tx.amount);
              const sign = isIncoming ? '+' : '-';
              formattedAmount = `${sign}₹${numVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            } else if (isIncoming && !formattedAmount.startsWith('+')) {
              formattedAmount = '+' + formattedAmount.replace(/^[-+]/, '');
            }

            // Subtext: show receiving bank perspective for flagged incoming transfer
            let subtextStr = tx.subtext || '';
            if (entityStr.toLowerCase().includes('nexus') || subtextStr.toLowerCase().includes('overseas')) {
              subtextStr = 'Incoming International Transfer — Flagged for Review';
            }

            const item = document.createElement('div');
            item.className = `p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-surface-container-low transition-colors ${isFlagged ? 'bg-amber-500/5 border-l-4 border-amber-500' : ''}`;
            item.innerHTML = `
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-10 h-10 rounded-full ${isFlagged ? 'bg-amber-500/15 text-amber-700' : 'bg-surface-container-high text-on-surface'} flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-[20px]">${isFlagged ? 'security' : icon}</span>
                </div>
                <div class="min-w-0 overflow-hidden">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-label-mono-lg text-label-mono-lg font-bold text-on-surface truncate">${entityStr}</span>
                    ${statusBadge}
                  </div>
                  <span class="font-body-sm text-[12px] text-on-surface-variant truncate block mt-0.5">${tx.timestamp || ''} ${subtextStr ? '• ' + subtextStr : ''}</span>
                </div>
              </div>
              <div class="text-right shrink-0">
                <span class="font-label-mono-md text-label-mono-md font-bold ${isFlagged ? 'text-amber-800' : (isIncoming ? 'text-emerald-600' : 'text-on-surface')} block">
                  ${formattedAmount}
                </span>
                ${isFlagged ? `<span class="block text-[10px] text-amber-700/80 font-mono font-medium">Funds Not Credited</span><button class="text-primary font-label-mono-sm text-[10px] font-bold uppercase mt-1 hover:underline resolve-btn" data-id="${tx.id}">${tx.actionText || 'Review Flag'}</button>` : ''}
              </div>
            `;
            txList.appendChild(item);
          });
        }

        // Show alert banner ONLY if there are flagged transactions belonging to this user!
        // If there are no transactions, there can never be an active threat or hold.
        const txIds = new Set(txs.map(t => String(t.id)));
        const flaggedTxs = txs.filter(t => t.status === 'Flagged' || t.category === 'flagged');
        const activeAlerts = (txs.length > 0)
          ? alerts.filter(a => a.status === 'blocked' && (txIds.has(String(a.transaction_id)) || (activePhone && a.user_phone === activePhone)))
          : [];

        const hasActiveThreat = txs.length > 0 && (flaggedTxs.length > 0 || activeAlerts.length > 0);

        const sentinelCard = document.getElementById('sentinelStatusCard');
        if (hasActiveThreat) {
          activeAlertId = activeAlerts.length > 0 ? activeAlerts[0].transaction_id : flaggedTxs[0].id;
          alertBanner.classList.remove('hidden');
          notifBadge.style.display = 'block';
          
          if (sentinelCard) {
            sentinelCard.classList.remove('bg-surface-container');
            sentinelCard.classList.add('bg-error-container', 'border-error/30');
            const h3 = sentinelCard.querySelector('h3');
            if (h3) {
              h3.classList.add('text-error');
              h3.textContent = 'Threat Mitigated';
            }
            const iconEl = sentinelCard.querySelector('.material-symbols-outlined');
            if (iconEl) {
              iconEl.textContent = 'gpp_bad';
              iconEl.classList.replace('text-on-secondary-fixed', 'text-error');
            }
          }
        } else {
          alertBanner.classList.add('hidden');
          notifBadge.style.display = 'none';
          
          if (sentinelCard) {
            sentinelCard.classList.add('bg-surface-container');
            sentinelCard.classList.remove('bg-error-container', 'border-error/30');
            const h3 = sentinelCard.querySelector('h3');
            if (h3) {
              h3.classList.remove('text-error');
              h3.textContent = 'Sentinel Active';
            }
            const iconEl = sentinelCard.querySelector('.material-symbols-outlined');
            if (iconEl) {
              iconEl.textContent = 'shield_locked';
              iconEl.classList.remove('text-error');
              if (!iconEl.classList.contains('text-on-secondary-fixed')) {
                iconEl.classList.add('text-on-secondary-fixed');
              }
            }
          }
        }

        // Attach listeners to resolve buttons
        document.querySelectorAll('.resolve-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            sessionStorage.setItem('current_alert_tx', id);
            Router.navigate('/hold-reason');
          });
        });

      } catch (e) {
        console.error("Failed to load dashboard data:", e);
      }
    }

    await loadData();

    // Profile Dropdown Setup
    const authData = API.getAuth();
    const activeUser = authData.user || {};
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');

    if (profileBtn) {
      if (activeUser.name) {
        const parts = activeUser.name.trim().split(' ');
        const initials = parts.length >= 2
          ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
          : activeUser.name.substring(0, 2).toUpperCase();
        profileBtn.textContent = initials;
      }

      profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('hidden');
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', () => {
        if (profileDropdown && !profileDropdown.classList.contains('hidden')) {
          profileDropdown.classList.add('hidden');
        }
      });
    }

    const dropdownName = document.getElementById('dropdownUserName');
    const dropdownPhone = document.getElementById('dropdownUserPhone');
    if (dropdownName) dropdownName.textContent = activeUser.name || 'Account';
    if (dropdownPhone) dropdownPhone.textContent = '+91 ' + (activeUser.phone || activeUser.account_number || '9876543210');

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        API.logout();
        Router.navigate('/login');
      });
    }

    const reviewAlertBtn = document.getElementById('reviewAlertBtn');
    if (reviewAlertBtn) {
      reviewAlertBtn.addEventListener('click', () => {
        const targetId = activeAlertId || 'TXN-FLAGGED';
        sessionStorage.setItem('current_alert_tx', targetId);
        Router.navigate('/hold-reason');
      });
    }

    // Demo Simulation
    const simFraudBtn = document.getElementById('simFraudBtn');
    if (simFraudBtn) {
      simFraudBtn.addEventListener('click', async () => {
        try {
          const activePhone = localStorage.getItem('fs_active_phone') || (API.getAuth().user ? API.getAuth().user.phone : null);
          const tx = {
            phone: activePhone,
            age: 22,
            transaction_amount: 150000.0,
            account_balance: 50.0,
            gender: "Male",
            account_type: "Checking",
            transaction_type: "Wire",
            merchant_category: "Crypto",
            device_type: "Unknown",
            state: "Unknown"
          };
          const res = await API.predictTransaction(tx);
          console.log("Prediction result:", res);
          // Reload to show the new transaction and alert
          await loadData();
        } catch (err) {
          alert("Failed to simulate transaction: " + err.message);
        }
      });
    }
  }
};
