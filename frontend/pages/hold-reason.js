/**
 * hold-reason.js — Dynamic Multi-Scenario Fraud Hold & Protective Review
 * Context-aware page that adapts to the exact transaction type:
 * - ATM Cash Withdrawal (Off-Hours, Skimmer, Terminal Anomaly)
 * - Incoming International Transfer / Wire (Sender Overseas Bank -> Receiving Bank)
 * - Merchant Payment / POS / UPI Debit (Merchant Terminal -> Debited Account)
 * - Domestic Outgoing Transfer (Beneficiary -> Debited Account)
 */

window.HoldReasonPage = {
  protected: true,
  render: async () => {
    const div = document.createElement('div');
    div.className = "min-h-screen bg-surface flex flex-col p-4 md:p-8 relative page-enter";
    div.innerHTML = `
      <!-- Dynamic Background Glow -->
      <div class="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/15 via-surface to-surface -z-10 transition-colors duration-1000" id="bg-glow"></div>

      <div class="w-full max-w-4xl mx-auto flex-1 flex flex-col pt-4 md:pt-8 pb-12">
        <!-- Top Navigation & Status Header -->
        <div class="flex items-center justify-between gap-4 mb-6">
          <div class="flex items-center gap-3 min-w-0">
            <button onclick="Router.navigate('/dashboard')" 
              class="w-10 h-10 rounded-full border border-outline-variant/40 bg-surface-container-lowest hover:bg-surface-container flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-sm" 
              title="Return to Dashboard">
              <span class="material-symbols-outlined text-on-surface-variant text-[20px]">arrow_back</span>
            </button>
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-900 border border-amber-500/30 font-label-mono-sm text-[11px] font-bold uppercase tracking-wider" id="top-status-badge">
                  <span class="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
                  <span id="top-status-text">Protective Hold Applied &bull; Security Review</span>
                </span>
                <span class="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-mono-sm text-[10px] font-medium" id="tx-demo-tag">
                  Live Security Intercept
                </span>
              </div>
              <h1 class="font-display-lg text-[28px] md:text-[34px] leading-tight text-on-surface mt-1" id="page-title">
                Action Required: Transaction Flagged
              </h1>
            </div>
          </div>

          <div class="hidden sm:flex items-center gap-2">
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-[12px] text-on-surface-variant font-medium" id="model-guard-badge">
              <span class="material-symbols-outlined text-[16px] text-primary">security</span>
              Model FL-14 Edge Guard
            </span>
          </div>
        </div>

        <!-- Main Incident Card -->
        <div class="bg-surface-container-lowest rounded-[24px] shadow-[0_12px_40px_rgba(45,42,58,0.06)] border border-amber-500/25 overflow-hidden transition-all duration-500 mb-6" id="main-card">
          
          <!-- Top Financial Overview -->
          <div class="p-6 md:p-8 border-b border-outline-variant/20 bg-gradient-to-r from-amber-500/10 via-surface-container-low/40 to-surface-container-low/60">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span class="font-label-mono-sm text-[11px] text-amber-900 font-bold block mb-1 uppercase tracking-wider flex items-center gap-1.5" id="tx-direction-label">
                  <span class="material-symbols-outlined text-[16px]">security</span>
                  Domestic Transaction &bull; Flagged Edge Anomaly
                </span>
                <h2 class="font-headline-lg text-[24px] md:text-[28px] font-bold text-on-surface tracking-tight" id="tx-merchant">Transaction Review</h2>
                <p class="font-body-sm text-[13px] text-on-surface-variant mt-1" id="tx-location">
                  Suspicious Transaction &mdash; Flagged for Review
                </p>
              </div>
              <div class="text-left md:text-right">
                <span class="font-display-lg text-[36px] md:text-[42px] font-bold block tracking-tight text-amber-900" id="tx-amount">-₹0.00</span>
                <span class="font-label-mono-sm text-[11px] text-amber-900 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full font-bold inline-flex items-center gap-1.5 mt-2" id="tx-credit-badge">
                  <span class="material-symbols-outlined text-[14px]">lock</span>
                  <span id="tx-credit-badge-text">Security Hold Active &bull; Transaction Blocked</span>
                </span>
              </div>
            </div>
          </div>

          <!-- Section 1: Detailed Routing Audit Grid -->
          <div class="p-6 md:p-8 border-b border-outline-variant/20">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-label-mono-sm text-[12px] uppercase tracking-wider text-on-surface font-bold flex items-center gap-2" id="routing-header-title">
                <span class="material-symbols-outlined text-primary text-[18px]">swap_horiz</span>
                Transaction Origin &amp; Routing Details
              </h3>
              <span class="text-[11px] font-mono text-on-surface-variant/80 bg-surface-container px-2 py-0.5 rounded-md" id="tx-ref-id">
                Ref: #TXN-FLAGGED
              </span>
            </div>

            <!-- Flow Visual Grid (Left: Origin/Terminal/Sender | Right: Debited/Receiving Account) -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <!-- Left Card: Originating Entity / Terminal -->
              <div class="p-4 md:p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 flex flex-col justify-between" id="left-card-box">
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-label-mono-sm text-[11px] font-bold uppercase tracking-wider" id="left-card-badge">
                      <span class="material-symbols-outlined text-[15px]" id="left-card-badge-icon">local_atm</span>
                      <span id="left-card-badge-text">ORIGINATING TERMINAL</span>
                    </span>
                    <span class="text-[10px] uppercase font-mono text-on-surface-variant/70 font-semibold" id="left-card-role-tag">Originating Source</span>
                  </div>
                  <div class="font-headline-sm text-[16px] font-bold text-on-surface" id="tx-sender-name">
                    Terminal / Merchant
                  </div>
                  <p class="font-label-mono-sm text-[12px] text-on-surface-variant font-mono mt-0.5" id="tx-sender-account">
                    Terminal ID &bull; Network Node
                  </p>
                </div>

                <div class="mt-4 pt-3 border-t border-outline-variant/20 space-y-1.5 text-[12px] text-on-surface-variant" id="left-card-fields">
                  <div class="flex items-center justify-between">
                    <span class="font-medium" id="left-f1-label">Interbank Switch:</span>
                    <span class="font-semibold text-on-surface text-right" id="left-f1-val">Domestic Network</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="font-medium" id="left-f2-label">Reported Origin &amp; Time:</span>
                    <span class="font-semibold text-on-surface text-right" id="left-f2-val">Local Kiosk</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="font-medium" id="left-f3-label">Channel Mode:</span>
                    <span class="font-semibold text-primary font-mono text-right" id="left-f3-val">Domestic ATM Debit</span>
                  </div>
                </div>
              </div>

              <!-- Right Card: Account Details (Debited or Receiving Account) -->
              <div class="p-4 md:p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 flex flex-col justify-between" id="right-card-box">
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-800 font-label-mono-sm text-[11px] font-bold uppercase tracking-wider" id="right-card-badge">
                      <span class="material-symbols-outlined text-[15px]" id="right-card-badge-icon">account_balance_wallet</span>
                      <span id="right-card-badge-text">YOUR BANK ACCOUNT</span>
                    </span>
                    <span class="text-[10px] uppercase font-mono text-on-surface-variant/70 font-semibold" id="right-card-role-tag">Primary Account</span>
                  </div>
                  <div class="font-headline-sm text-[16px] font-bold text-on-surface" id="tx-recipient-name">
                    Account Holder
                  </div>
                  <p class="font-label-mono-sm text-[12px] text-on-surface-variant font-mono mt-0.5" id="tx-recipient-account">
                    A/C &bull;&bull;&bull;&bull; 6655 (Primary Savings)
                  </p>
                </div>

                <div class="mt-4 pt-3 border-t border-outline-variant/20 space-y-1.5 text-[12px] text-on-surface-variant" id="right-card-fields">
                  <div class="flex items-center justify-between">
                    <span class="font-medium" id="right-f1-label">Issuing Bank:</span>
                    <span class="font-semibold text-on-surface text-right" id="right-f1-val">Nagaland Regional Bank &bull; Main Branch</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="font-medium" id="right-f2-label">IFSC / Branch Code:</span>
                    <span class="font-semibold text-on-surface font-mono text-right" id="right-f2-val">NRBN0001842 &bull; Domestic Edge Node #1</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="font-medium" id="right-f3-label">Account Security Status:</span>
                    <span class="font-semibold text-amber-800 text-right" id="right-f3-val">Protected &bull; Blocked at Edge</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 2: Timestamp & Transmission Audit -->
          <div class="p-6 md:p-8 border-b border-outline-variant/20 bg-surface-container-low/30">
            <h3 class="font-label-mono-sm text-[12px] uppercase tracking-wider text-on-surface font-bold flex items-center gap-2 mb-4">
              <span class="material-symbols-outlined text-primary text-[18px]">schedule</span>
              Transaction Timestamp &amp; Transmission Audit
            </h3>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div class="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/25">
                <span class="block font-label-mono-sm text-[10px] uppercase tracking-wider text-on-surface-variant mb-1 font-semibold">Exact Transaction Time</span>
                <span class="font-body-sm text-[13px] text-on-surface font-bold flex items-center gap-1.5" id="tx-exact-time">
                  <span class="material-symbols-outlined text-[15px] text-primary">alarm</span>
                  Today, 02:41 AM
                </span>
              </div>

              <div class="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/25">
                <span class="block font-label-mono-sm text-[10px] uppercase tracking-wider text-on-surface-variant mb-1 font-semibold" id="tx-date-label">Transaction Date</span>
                <span class="font-body-sm text-[13px] text-on-surface font-bold flex items-center gap-1.5" id="tx-exact-date">
                  <span class="material-symbols-outlined text-[15px] text-primary">calendar_today</span>
                  Today
                </span>
              </div>

              <div class="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/25">
                <span class="block font-label-mono-sm text-[10px] uppercase tracking-wider text-on-surface-variant mb-1 font-semibold">Reference / UTR</span>
                <span class="font-body-sm text-[13px] text-on-surface font-mono font-semibold" id="tx-utr-ref">
                  TXN-REF
                </span>
              </div>

              <div class="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/25">
                <span class="block font-label-mono-sm text-[10px] uppercase tracking-wider text-on-surface-variant mb-1 font-semibold">Edge Intercept Latency</span>
                <span class="font-body-sm text-[13px] text-amber-900 font-bold flex items-center gap-1.5" id="tx-latency">
                  <span class="material-symbols-outlined text-[15px] text-amber-700">bolt</span>
                  18ms (Edge AI Intercept)
                </span>
              </div>
            </div>
          </div>

          <!-- Section 3: Deep AI Fraud Explanation & Indicators -->
          <div class="p-6 md:p-8">
            <div class="flex items-start gap-3.5 mb-6">
              <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-[24px]">psychology</span>
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-headline-sm text-[18px] font-bold text-on-surface" id="tx-why-title">Why was this transaction flagged?</h3>
                  <span class="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono text-[10px] font-bold" id="tx-why-badge">Edge AI Safeguard</span>
                </div>
                <p class="font-body-md text-[14px] text-on-surface-variant leading-relaxed" id="tx-reason">
                  Evaluating transaction risk factors...
                </p>
              </div>
            </div>

            <!-- Federated Risk Score Bar -->
            <div class="bg-surface-container/60 rounded-2xl p-4 md:p-5 border border-outline-variant/30 mb-6">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span class="font-label-mono-sm text-[11px] uppercase tracking-wider text-on-surface font-bold">Federated Risk Score (Edge Node)</span>
                  <span class="text-[11px] text-on-surface-variant font-mono">(Threshold: &gt; 0.50 triggers protective hold)</span>
                </div>
                <span class="text-error font-bold font-mono text-[13px]" id="tx-risk">Critical Risk (0.94)</span>
              </div>
              <div class="w-full h-2.5 bg-surface-variant rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-error rounded-full transition-all duration-1000 w-0" id="risk-bar"></div>
              </div>
            </div>

            <!-- Dynamic Indicators Container -->
            <div class="mb-8">
              <h4 class="font-label-mono-sm text-[11px] uppercase tracking-wider text-on-surface-variant font-bold mb-3 flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px] text-amber-700">warning</span>
                Specific Flag Indicators Triggered by Local Neural Model
              </h4>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5" id="indicators-container">
                <!-- Injected dynamically in afterRender -->
              </div>
            </div>

            <!-- Privacy Guarantee Badge -->
            <div class="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3 mb-8">
              <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-[18px]">verified_user</span>
              </div>
              <div class="text-[12px] text-on-surface leading-relaxed">
                <span class="font-bold text-primary">On-Device Federated Edge Privacy Guarantee:</span>
                This inference was evaluated 100% locally on your bank's decentralized edge node. Your financial credentials and account balance never left your bank's secure infrastructure.
              </div>
            </div>

            <!-- Contextual Action Buttons -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4" id="action-buttons">
              <!-- Reject / Report Fraud -->
              <button id="btnNotMe" class="p-4 md:p-5 rounded-2xl border-2 border-error/30 bg-error/5 hover:bg-error hover:border-error group transition-all text-left relative overflow-hidden flex flex-col gap-2 cursor-pointer shadow-sm hover:shadow-md">
                <div class="absolute inset-0 bg-error/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div class="relative z-10 flex items-center justify-between">
                  <div class="flex items-center gap-2 text-error group-hover:text-white transition-colors">
                    <span class="material-symbols-outlined text-[22px]" id="btn-reject-icon">report_problem</span>
                    <span class="font-headline-sm text-[16px] font-bold" id="btn-reject-title">Not My Transaction / Report Fraud</span>
                  </div>
                  <span class="material-symbols-outlined text-[18px] text-error group-hover:text-white transition-colors">arrow_forward</span>
                </div>
                <span class="relative z-10 font-body-sm text-[12px] text-on-surface-variant group-hover:text-white/90 transition-colors leading-relaxed" id="btn-reject-desc">
                  Safeguard your account against fraud, keep protective holds active, and submit an investigation dispute ticket.
                </span>
              </button>

              <!-- Approve / Confirm Authorized -->
              <button id="btnApprove" class="p-4 md:p-5 rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-600 hover:border-emerald-600 group transition-all text-left relative overflow-hidden flex flex-col gap-2 cursor-pointer shadow-sm hover:shadow-md">
                <div class="absolute inset-0 bg-emerald-600/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div class="relative z-10 flex items-center justify-between">
                  <div class="flex items-center gap-2 text-emerald-700 group-hover:text-white transition-colors">
                    <span class="material-symbols-outlined text-[22px]" id="btn-approve-icon">fingerprint</span>
                    <span class="font-headline-sm text-[16px] font-bold" id="btn-approve-title">I Authorized This Transaction</span>
                  </div>
                  <span class="material-symbols-outlined text-[18px] text-emerald-700 group-hover:text-white transition-colors">arrow_forward</span>
                </div>
                <span class="relative z-10 font-body-sm text-[12px] text-on-surface-variant group-hover:text-white/90 transition-colors leading-relaxed" id="btn-approve-desc">
                  Confirm that you authorized this transaction, remove the security hold, and proceed normally.
                </span>
              </button>
            </div>
          </div>
        </div>

        <button class="mt-4 mx-auto font-label-mono-sm text-[12px] uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1.5 cursor-pointer" onclick="Router.navigate('/dashboard')">
          <span class="material-symbols-outlined text-[16px]">arrow_back</span> Return to Dashboard
        </button>
      </div>
    `;
    return div;
  },

  afterRender: async () => {
    let txId = sessionStorage.getItem('current_alert_tx');
    const authData = API.getAuth();
    const activeUser = authData.user || {};
    const activePhone = activeUser.phone || localStorage.getItem('fs_active_phone') || '9988776655';
    const activeName = activeUser.name || (activePhone === '9988776655' ? 'Rajesh Sharma' : 'Valued Customer');
    const bankName = activeUser.bank_name || 'Nagaland Regional Bank';

    try {
      let txs = [];
      let alerts = [];
      try { txs = await API.getTransactions() || []; } catch (e) { console.warn("Failed fetching txs", e); }
      try { alerts = await API.getAlerts() || []; } catch (e) { console.warn("Failed fetching alerts", e); }

      let tx = txs.find(t => String(t.id) === String(txId));
      let alert = alerts.find(a => String(a.transaction_id) === String(txId));

      // Fallbacks if not directly matched by id
      if (!tx) {
        tx = txs.find(t => t.status === 'Flagged' || t.category === 'flagged') || txs[0];
      }
      if (!tx) {
        tx = {
          id: txId || 'TXN-ATM084',
          entity: 'Late-Night ATM Cash Withdrawal',
          merchant: 'Domestic ATM Network',
          amount: '-₹25,000.00',
          raw_amount: 25000.0,
          isPositive: false,
          subtext: 'Suspicious Off-Hours ATM Withdrawal — Terminal #0842',
          channel: 'Domestic ATM Debit',
          channelType: 'Domestic ATM Cash Withdrawal',
          status: 'Flagged',
          timestamp: 'Today, 02:41 AM'
        };
      }

      if (!alert) {
        alert = alerts.find(a => a.status === 'blocked') || {
          transaction_id: tx.id,
          risk_score: 0.9420,
          explanation_text: tx.flagReason || "This domestic transaction was placed on protective security hold because a late-night ATM cash withdrawal of ₹25,000.00 heavily deviated from your normal domestic account behavior based on federated local edge inference (Domestic Anomaly: Suspicious Off-Hours ATM Pattern / Possible Skimmer)."
        };
      }

      // Store in session so ticket screen can immediately reference it
      try {
        sessionStorage.setItem('current_alert_tx_data', JSON.stringify(tx));
      } catch (e) {}

      // ── Detect Fraud Type / Scenario ──
      const entityLower = (tx.entity || tx.merchant || '').toLowerCase();
      const subtextLower = (tx.subtext || '').toLowerCase();
      const channelLower = (tx.channel || '').toLowerCase();
      const channelTypeLower = (tx.channelType || '').toLowerCase();
      const flagReasonLower = (tx.flagReason || alert.explanation_text || '').toLowerCase();
      const isPositiveAmt = tx.isPositive === true || tx.is_positive === 1 || String(tx.amount || '').startsWith('+') || channelTypeLower.includes('inbound');

      const isATM = channelLower.includes('atm') || channelTypeLower.includes('atm') || entityLower.includes('atm') || subtextLower.includes('atm') || flagReasonLower.includes('atm') || flagReasonLower.includes('skimmer');
      const isWire = isPositiveAmt || channelLower.includes('wire') || channelLower.includes('swift') || entityLower.includes('wire') || entityLower.includes('nexus') || channelTypeLower.includes('inbound');
      const isMerchant = !isATM && !isWire && (channelLower.includes('pos') || channelLower.includes('upi') || channelTypeLower.includes('pos') || channelTypeLower.includes('retail') || channelLower.includes('merchant') || entityLower.includes('market') || entityLower.includes('store') || entityLower.includes('shop'));

      let scenario = 'DOMESTIC_DEBIT';
      if (isATM) scenario = 'ATM_WITHDRAWAL';
      else if (isWire) scenario = 'INCOMING_WIRE';
      else if (isMerchant) scenario = 'MERCHANT_PAYMENT';

      // Clean amount formatting
      const cleanAmt = typeof tx.raw_amount === 'number'
        ? Math.abs(tx.raw_amount)
        : (typeof tx.amount === 'number' 
            ? Math.abs(tx.amount) 
            : parseFloat(String(tx.amount || '').replace(/[^0-9.]/g, '')) || 25000.0);
      const signPrefix = scenario === 'INCOMING_WIRE' ? '+' : '-';
      const formattedAmount = `${signPrefix}₹${cleanAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

      const isCredited = tx.status === 'Completed' || tx.status === 'Credited';
      const txRef = tx.id ? (tx.id.startsWith('TXN-') ? tx.id : `TXN-${tx.id.slice(-6).toUpperCase()}`) : 'TXN-ATM084';
      const score = alert.risk_score || alert.fraud_score || 0.9420;

      // ── Apply Scenario Details ──
      const pageTitleEl = document.getElementById('page-title');
      const topStatusTextEl = document.getElementById('top-status-text');
      const dirLabelEl = document.getElementById('tx-direction-label');
      const merchantEl = document.getElementById('tx-merchant');
      const locationEl = document.getElementById('tx-location');
      const amountEl = document.getElementById('tx-amount');
      const creditBadgeTextEl = document.getElementById('tx-credit-badge-text');
      const routingHeaderEl = document.getElementById('routing-header-title');
      const refIdEl = document.getElementById('tx-ref-id');

      const leftCardBadge = document.getElementById('left-card-badge');
      const leftCardBadgeIcon = document.getElementById('left-card-badge-icon');
      const leftCardBadgeText = document.getElementById('left-card-badge-text');
      const leftCardRoleTag = document.getElementById('left-card-role-tag');
      const senderNameEl = document.getElementById('tx-sender-name');
      const senderAccountEl = document.getElementById('tx-sender-account');
      const leftF1Label = document.getElementById('left-f1-label');
      const leftF1Val = document.getElementById('left-f1-val');
      const leftF2Label = document.getElementById('left-f2-label');
      const leftF2Val = document.getElementById('left-f2-val');
      const leftF3Label = document.getElementById('left-f3-label');
      const leftF3Val = document.getElementById('left-f3-val');

      const rightCardBadge = document.getElementById('right-card-badge');
      const rightCardBadgeIcon = document.getElementById('right-card-badge-icon');
      const rightCardBadgeText = document.getElementById('right-card-badge-text');
      const rightCardRoleTag = document.getElementById('right-card-role-tag');
      const recipientNameEl = document.getElementById('tx-recipient-name');
      const recipientAccountEl = document.getElementById('tx-recipient-account');
      const rightF1Label = document.getElementById('right-f1-label');
      const rightF1Val = document.getElementById('right-f1-val');
      const rightF2Label = document.getElementById('right-f2-label');
      const rightF2Val = document.getElementById('right-f2-val');
      const rightF3Label = document.getElementById('right-f3-label');
      const rightF3Val = document.getElementById('right-f3-val');

      const exactTimeEl = document.getElementById('tx-exact-time');
      const exactDateEl = document.getElementById('tx-exact-date');
      const dateLabelEl = document.getElementById('tx-date-label');
      const utrRefEl = document.getElementById('tx-utr-ref');
      const whyTitleEl = document.getElementById('tx-why-title');
      const whyBadgeEl = document.getElementById('tx-why-badge');
      const reasonEl = document.getElementById('tx-reason');
      const riskEl = document.getElementById('tx-risk');
      const indicatorsContainer = document.getElementById('indicators-container');

      const btnRejectTitle = document.getElementById('btn-reject-title');
      const btnRejectDesc = document.getElementById('btn-reject-desc');
      const btnRejectIcon = document.getElementById('btn-reject-icon');
      const btnApproveTitle = document.getElementById('btn-approve-title');
      const btnApproveDesc = document.getElementById('btn-approve-desc');
      const btnApproveIcon = document.getElementById('btn-approve-icon');

      if (refIdEl) refIdEl.textContent = `Ref: #${txRef}`;
      if (amountEl) amountEl.textContent = formattedAmount;
      if (utrRefEl) utrRefEl.textContent = `UTR-20261013-${txRef.slice(-6)}-NRB`;

      const rawTimestamp = tx.timestamp || 'Today, 02:41 AM';
      if (exactTimeEl) {
        exactTimeEl.innerHTML = `<span class="material-symbols-outlined text-[15px] text-primary">alarm</span> ${rawTimestamp.includes('AM') || rawTimestamp.includes('PM') ? rawTimestamp : `${rawTimestamp} (02:41 AM IST)`}`;
      }
      if (exactDateEl) {
        exactDateEl.innerHTML = `<span class="material-symbols-outlined text-[15px] text-primary">calendar_today</span> ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;
      }

      // Populate based on scenario:
      if (scenario === 'ATM_WITHDRAWAL') {
        if (pageTitleEl) pageTitleEl.textContent = "Action Required: Suspicious ATM Withdrawal Flagged";
        if (topStatusTextEl) topStatusTextEl.textContent = "Protective Hold Applied • Local Edge Security Intercept";
        if (dirLabelEl) {
          dirLabelEl.innerHTML = `<span class="material-symbols-outlined text-[16px]">local_atm</span> Domestic ATM Transaction &bull; Flagged Edge Anomaly`;
        }
        if (merchantEl) merchantEl.textContent = tx.entity || "Late-Night ATM Cash Withdrawal";
        if (locationEl) locationEl.textContent = tx.subtext || "Suspicious Off-Hours ATM Withdrawal — Terminal #0842";
        if (creditBadgeTextEl) creditBadgeTextEl.textContent = isCredited ? "Cash Dispensed & Settled" : "Security Hold Active • Cash Withheld at Edge";
        if (routingHeaderEl) {
          routingHeaderEl.innerHTML = `<span class="material-symbols-outlined text-primary text-[18px]">local_atm</span> Transaction Origin &amp; Terminal Audit (ATM Terminal &rarr; Debited Account)`;
        }

        // Left Card: ATM Terminal
        if (leftCardBadgeIcon) leftCardBadgeIcon.textContent = "local_atm";
        if (leftCardBadgeText) leftCardBadgeText.textContent = "ATM TERMINAL — DOMESTIC SWITCH";
        if (leftCardRoleTag) leftCardRoleTag.textContent = "Originating Terminal";
        if (senderNameEl) senderNameEl.textContent = "Terminal #0842 (Domestic Network Node)";
        if (senderAccountEl) senderAccountEl.textContent = "ATM ID: ATM-DOM-0842 • Switch Node #14";
        if (leftF1Label) leftF1Label.textContent = "Interbank Switch:";
        if (leftF1Val) leftF1Val.textContent = "National Financial Switch (NFS ATM Network)";
        if (leftF2Label) leftF2Label.textContent = "Terminal Location & Time:";
        if (leftF2Val) leftF2Val.textContent = "Local ATM Kiosk • Sector 4 Market (02:41 AM)";
        if (leftF3Label) leftF3Label.textContent = "Access Channel:";
        if (leftF3Val) leftF3Val.textContent = "Domestic ATM Debit (Card & PIN)";

        // Right Card: Debited Account
        if (rightCardBadgeIcon) rightCardBadgeIcon.textContent = "account_balance_wallet";
        if (rightCardBadgeText) rightCardBadgeText.textContent = "DEBITED ACCOUNT — YOUR BANK";
        if (rightCardRoleTag) rightCardRoleTag.textContent = "Primary Account";
        if (recipientNameEl) recipientNameEl.textContent = `${activeName} (Account Holder)`;
        if (recipientAccountEl) recipientAccountEl.textContent = `A/C •••• ${activePhone.slice(-4)} (Primary Savings)`;
        if (rightF1Label) rightF1Label.textContent = "Card Issuing Bank:";
        if (rightF1Val) rightF1Val.textContent = `${bankName} • Main Branch`;
        if (rightF2Label) rightF2Label.textContent = "IFSC / Branch Code:";
        if (rightF2Val) rightF2Val.textContent = "NRBN0001842 • Domestic Node #1";
        if (rightF3Label) rightF3Label.textContent = "Dispense Status:";
        if (rightF3Val) {
          rightF3Val.textContent = isCredited ? "Dispensed / Settled" : "Protected • Cash Dispensation Blocked at Edge";
          rightF3Val.className = isCredited ? "font-semibold text-emerald-700 text-right" : "font-semibold text-rose-800 text-right";
        }

        // Section 3
        if (whyTitleEl) whyTitleEl.textContent = "Why was this ATM cash withdrawal flagged?";
        if (whyBadgeEl) whyBadgeEl.textContent = "Edge ATM Safeguard";
        if (reasonEl) {
          reasonEl.textContent = alert.explanation_text || "This domestic transaction was placed on protective security hold because a late-night ATM cash withdrawal of ₹25,000.00 heavily deviated from your normal domestic account behavior based on federated local edge inference (Domestic Anomaly: Suspicious Off-Hours ATM Pattern / Possible Skimmer).";
        }

        // Dynamic Indicators for ATM
        if (indicatorsContainer) {
          indicatorsContainer.innerHTML = `
            <div class="p-4 rounded-xl bg-surface-container-lowest border border-amber-500/25 flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <span class="material-symbols-outlined text-[18px]">schedule</span>
              </div>
              <div>
                <div class="font-headline-sm text-[13px] font-bold text-on-surface">Suspicious Off-Hours Timing (02:41 AM)</div>
                <div class="font-body-sm text-[12px] text-on-surface-variant mt-0.5 leading-relaxed">
                  Withdrawal initiated during off-peak midnight hours (<strong>02:41 AM</strong>), severely deviating from your account's daytime historical activity.
                </div>
              </div>
            </div>

            <div class="p-4 rounded-xl bg-surface-container-lowest border border-amber-500/25 flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <span class="material-symbols-outlined text-[18px]">payments</span>
              </div>
              <div>
                <div class="font-headline-sm text-[13px] font-bold text-on-surface">Extreme Cash Amount Spike</div>
                <div class="font-body-sm text-[12px] text-on-surface-variant mt-0.5 leading-relaxed">
                  A single cash withdrawal request of <strong>${formattedAmount}</strong> is <strong>4.8&times; higher</strong> than your card's average ATM dispensation volume.
                </div>
              </div>
            </div>

            <div class="p-4 rounded-xl bg-surface-container-lowest border border-amber-500/25 flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <span class="material-symbols-outlined text-[18px]">warning</span>
              </div>
              <div>
                <div class="font-headline-sm text-[13px] font-bold text-on-surface">Terminal Anomaly &amp; Possible Skimmer</div>
                <div class="font-body-sm text-[12px] text-on-surface-variant mt-0.5 leading-relaxed">
                  Terminal #0842 triggered velocity warning alerts on the domestic interbank switch, indicating elevated risk of magnetic card skimming.
                </div>
              </div>
            </div>

            <div class="p-4 rounded-xl bg-surface-container-lowest border border-primary/25 flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <span class="material-symbols-outlined text-[18px]">shield</span>
              </div>
              <div>
                <div class="font-headline-sm text-[13px] font-bold text-on-surface">Federated Edge AI Intercept</div>
                <div class="font-body-sm text-[12px] text-on-surface-variant mt-0.5 leading-relaxed">
                  Your bank's on-device neural network scored this withdrawal with a <strong>${(score * 100).toFixed(1)}% anomaly risk score</strong> and blocked cash dispensation before funds exited.
                </div>
              </div>
            </div>
          `;
        }

        // Action Buttons for ATM
        if (btnRejectTitle) btnRejectTitle.textContent = "Not My Transaction / Block Card & Dispute";
        if (btnRejectDesc) btnRejectDesc.textContent = "Block debit card immediately, protect your savings against skimming, and raise an urgent fraud ticket.";
        if (btnRejectIcon) btnRejectIcon.textContent = "credit_card_off";
        if (btnApproveTitle) btnApproveTitle.textContent = "I Made This Withdrawal (Unfreeze)";
        if (btnApproveDesc) btnApproveDesc.textContent = "Confirm you conducted this ATM cash withdrawal, verify your MPIN, and lift the temporary card hold.";
        if (btnApproveIcon) btnApproveIcon.textContent = "fingerprint";

      } else if (scenario === 'INCOMING_WIRE') {
        if (pageTitleEl) pageTitleEl.textContent = "Action Required: Incoming Transfer Flagged";
        if (topStatusTextEl) topStatusTextEl.textContent = "Protective Hold Applied • Receiving Bank Security Review";
        if (dirLabelEl) {
          dirLabelEl.innerHTML = `<span class="material-symbols-outlined text-[16px]">south_west</span> Incoming International Transfer &bull; Flagged for Review`;
        }
        if (merchantEl) merchantEl.textContent = tx.entity || tx.merchant || "Nexus International Wire Clearing LLC";
        if (locationEl) locationEl.textContent = tx.subtext || "Incoming International Transfer — Flagged for Review";
        if (creditBadgeTextEl) creditBadgeTextEl.textContent = isCredited ? "Funds Successfully Settled" : "Pending Security Review • Funds Not Credited";
        if (routingHeaderEl) {
          routingHeaderEl.innerHTML = `<span class="material-symbols-outlined text-primary text-[18px]">swap_horiz</span> Transaction Routing Details (Sender &rarr; Receiving Bank)`;
        }

        // Left Card: Overseas Sender
        if (leftCardBadgeIcon) leftCardBadgeIcon.textContent = "account_balance";
        if (leftCardBadgeText) leftCardBadgeText.textContent = "SENDER — OVERSEAS BANK";
        if (leftCardRoleTag) leftCardRoleTag.textContent = "Originating Entity";
        if (senderNameEl) senderNameEl.textContent = tx.senderName || tx.entity || "Nexus International Wire Clearing LLC";
        if (senderAccountEl) senderAccountEl.textContent = tx.senderAccount || "A/C •••• 9842 (IBAN: GB82 MIDL 4005 1512 3456)";
        if (leftF1Label) leftF1Label.textContent = "Originating Bank:";
        if (leftF1Val) leftF1Val.textContent = tx.senderBank || "Standard Chartered Bank (London Gateway Branch)";
        if (leftF2Label) leftF2Label.textContent = "Reported Origin & IP:";
        if (leftF2Val) leftF2Val.textContent = tx.senderLocation || "London, UK (Reported IP: 185.220.101.5)";
        if (leftF3Label) leftF3Label.textContent = "Transfer Channel:";
        if (leftF3Val) leftF3Val.textContent = tx.channel || "SWIFT Inbound Wire MT103";

        // Right Card: Receiving Account
        if (rightCardBadgeIcon) rightCardBadgeIcon.textContent = "domain";
        if (rightCardBadgeText) rightCardBadgeText.textContent = "RECEIVING ACCOUNT — YOUR BANK";
        if (rightCardRoleTag) rightCardRoleTag.textContent = "Beneficiary Account";
        if (recipientNameEl) recipientNameEl.textContent = `${activeName} (Recipient Beneficiary)`;
        if (recipientAccountEl) recipientAccountEl.textContent = `A/C •••• ${activePhone.slice(-4)} (Primary Savings)`;
        if (rightF1Label) rightF1Label.textContent = "Receiving Bank:";
        if (rightF1Val) rightF1Val.textContent = `${bankName} • Main Branch`;
        if (rightF2Label) rightF2Label.textContent = "IFSC / Domestic Code:";
        if (rightF2Val) rightF2Val.textContent = "NRBN0001842 • Domestic Node #1";
        if (rightF3Label) rightF3Label.textContent = "Credit Status:";
        if (rightF3Val) {
          rightF3Val.textContent = isCredited ? "Successfully Credited to Account" : "Pending Security Review (Not Yet Credited)";
          rightF3Val.className = isCredited ? "font-semibold text-emerald-700 text-right" : "font-semibold text-amber-900 text-right";
        }

        // Section 3
        if (whyTitleEl) whyTitleEl.textContent = "Why was this incoming transfer flagged?";
        if (whyBadgeEl) whyBadgeEl.textContent = "Receiving Bank Safeguard";
        if (reasonEl) {
          reasonEl.textContent = alert.explanation_text || "As your receiving bank, our local edge AI actively screens incoming international wire transfers to protect account holders against unauthorized credits, wire diversion, and fraudulent settlement.";
        }

        if (indicatorsContainer) {
          indicatorsContainer.innerHTML = `
            <div class="p-4 rounded-xl bg-surface-container-lowest border border-amber-500/25 flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <span class="material-symbols-outlined text-[18px]">trending_up</span>
              </div>
              <div>
                <div class="font-headline-sm text-[13px] font-bold text-on-surface">Extreme Inbound Value Anomaly</div>
                <div class="font-body-sm text-[12px] text-on-surface-variant mt-0.5 leading-relaxed">
                  The intended incoming transfer of <strong>${formattedAmount}</strong> is significantly higher than your typical incoming transaction volume.
                </div>
              </div>
            </div>

            <div class="p-4 rounded-xl bg-surface-container-lowest border border-amber-500/25 flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <span class="material-symbols-outlined text-[18px]">travel_explore</span>
              </div>
              <div>
                <div class="font-headline-sm text-[13px] font-bold text-on-surface">Unverified Overseas Originating Node</div>
                <div class="font-body-sm text-[12px] text-on-surface-variant mt-0.5 leading-relaxed">
                  Originated from an overseas routing node with no prior remittance history associated with your home branch account.
                </div>
              </div>
            </div>

            <div class="p-4 rounded-xl bg-surface-container-lowest border border-amber-500/25 flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <span class="material-symbols-outlined text-[18px]">hub</span>
              </div>
              <div>
                <div class="font-headline-sm text-[13px] font-bold text-on-surface">Unverified International Inbound Gateway</div>
                <div class="font-body-sm text-[12px] text-on-surface-variant mt-0.5 leading-relaxed">
                  Arrived via international correspondent wire clearing without verified pre-authorization or standing instruction on file.
                </div>
              </div>
            </div>

            <div class="p-4 rounded-xl bg-surface-container-lowest border border-primary/25 flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <span class="material-symbols-outlined text-[18px]">shield</span>
              </div>
              <div>
                <div class="font-headline-sm text-[13px] font-bold text-on-surface">Receiving Bank FL-14 Consensus</div>
                <div class="font-body-sm text-[12px] text-on-surface-variant mt-0.5 leading-relaxed">
                  Your bank's on-device neural network scored this incoming transfer with a <strong>${(score * 100).toFixed(1)}% anomaly confidence</strong>.
                </div>
              </div>
            </div>
          `;
        }

        // Action Buttons for Wire
        if (btnRejectTitle) btnRejectTitle.textContent = "Not My Transfer / Reject Wire";
        if (btnRejectDesc) btnRejectDesc.textContent = "Reject this unauthorized inbound transfer, safeguard your account, and submit a security dispute ticket.";
        if (btnRejectIcon) btnRejectIcon.textContent = "report_problem";
        if (btnApproveTitle) btnApproveTitle.textContent = "I Expect This (Authorize Credit)";
        if (btnApproveDesc) btnApproveDesc.textContent = "Confirm you expect this incoming transfer, remove the protective hold, and allow funds to credit to your account.";
        if (btnApproveIcon) btnApproveIcon.textContent = "fingerprint";

      } else {
        // MERCHANT_PAYMENT or DOMESTIC_DEBIT
        if (pageTitleEl) pageTitleEl.textContent = "Action Required: Suspicious Payment Flagged";
        if (topStatusTextEl) topStatusTextEl.textContent = "Protective Hold Applied • Merchant Payment Intercept";
        if (dirLabelEl) {
          dirLabelEl.innerHTML = `<span class="material-symbols-outlined text-[16px]">storefront</span> Domestic Transaction &bull; Flagged Edge Anomaly`;
        }
        if (merchantEl) merchantEl.textContent = tx.entity || tx.merchant || "Retail Store / Merchant";
        if (locationEl) locationEl.textContent = tx.subtext || "Supermarket UPI / POS Payment";
        if (creditBadgeTextEl) creditBadgeTextEl.textContent = isCredited ? "Payment Settled Successfully" : "Security Hold Active • Payment Intercepted";
        if (routingHeaderEl) {
          routingHeaderEl.innerHTML = `<span class="material-symbols-outlined text-primary text-[18px]">storefront</span> Merchant Terminal &amp; Account Audit (Merchant Terminal &rarr; Debited Account)`;
        }

        // Left Card: Merchant
        if (leftCardBadgeIcon) leftCardBadgeIcon.textContent = "storefront";
        if (leftCardBadgeText) leftCardBadgeText.textContent = "MERCHANT — PAYMENT TERMINAL";
        if (leftCardRoleTag) leftCardRoleTag.textContent = "Destination Merchant";
        if (senderNameEl) senderNameEl.textContent = tx.entity || "Retail Merchant Terminal";
        if (senderAccountEl) senderAccountEl.textContent = tx.subtext || "POS Terminal #289 • Merchant ID: MID-8921";
        if (leftF1Label) leftF1Label.textContent = "Payment Processor:";
        if (leftF1Val) leftF1Val.textContent = "Interbank UPI / POS Switch";
        if (leftF2Label) leftF2Label.textContent = "Reported Location:";
        if (leftF2Val) leftF2Val.textContent = "Domestic Retail Kiosk";
        if (leftF3Label) leftF3Label.textContent = "Channel Mode:";
        if (leftF3Val) leftF3Val.textContent = tx.channel || "UPI / POS Debit";

        // Right Card: Debited Account
        if (rightCardBadgeIcon) rightCardBadgeIcon.textContent = "account_balance_wallet";
        if (rightCardBadgeText) rightCardBadgeText.textContent = "DEBITED ACCOUNT — YOUR BANK";
        if (rightCardRoleTag) rightCardRoleTag.textContent = "Primary Account";
        if (recipientNameEl) recipientNameEl.textContent = `${activeName} (Account Holder)`;
        if (recipientAccountEl) recipientAccountEl.textContent = `A/C •••• ${activePhone.slice(-4)} (Primary Savings)`;
        if (rightF1Label) rightF1Label.textContent = "Card Issuing Bank:";
        if (rightF1Val) rightF1Val.textContent = `${bankName} • Main Branch`;
        if (rightF2Label) rightF2Label.textContent = "IFSC / Branch Code:";
        if (rightF2Val) rightF2Val.textContent = "NRBN0001842 • Domestic Node #1";
        if (rightF3Label) rightF3Label.textContent = "Authorization Status:";
        if (rightF3Val) {
          rightF3Val.textContent = isCredited ? "Settled Successfully" : "Protected • Blocked at Edge";
          rightF3Val.className = isCredited ? "font-semibold text-emerald-700 text-right" : "font-semibold text-rose-800 text-right";
        }

        // Section 3
        if (whyTitleEl) whyTitleEl.textContent = "Why was this merchant payment flagged?";
        if (whyBadgeEl) whyBadgeEl.textContent = "Merchant Safeguard";
        if (reasonEl) {
          reasonEl.textContent = alert.explanation_text || `This domestic transaction was placed on protective security hold because a payment of ${formattedAmount} deviated from your normal spending behavior based on federated local edge inference.`;
        }

        if (indicatorsContainer) {
          indicatorsContainer.innerHTML = `
            <div class="p-4 rounded-xl bg-surface-container-lowest border border-amber-500/25 flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <span class="material-symbols-outlined text-[18px]">store</span>
              </div>
              <div>
                <div class="font-headline-sm text-[13px] font-bold text-on-surface">Unusual Merchant Profile</div>
                <div class="font-body-sm text-[12px] text-on-surface-variant mt-0.5 leading-relaxed">
                  Transaction initiated at an unrecognized merchant category with atypical terminal credentials.
                </div>
              </div>
            </div>

            <div class="p-4 rounded-xl bg-surface-container-lowest border border-amber-500/25 flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <span class="material-symbols-outlined text-[18px]">speed</span>
              </div>
              <div>
                <div class="font-headline-sm text-[13px] font-bold text-on-surface">Spending Velocity Anomaly</div>
                <div class="font-body-sm text-[12px] text-on-surface-variant mt-0.5 leading-relaxed">
                  Payment amount (${formattedAmount}) deviated from standard daily retail spending thresholds.
                </div>
              </div>
            </div>

            <div class="p-4 rounded-xl bg-surface-container-lowest border border-amber-500/25 flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <span class="material-symbols-outlined text-[18px]">devices</span>
              </div>
              <div>
                <div class="font-headline-sm text-[13px] font-bold text-on-surface">Terminal Verification Mismatch</div>
                <div class="font-body-sm text-[12px] text-on-surface-variant mt-0.5 leading-relaxed">
                  The merchant terminal reported inconsistent cryptographic handshake parameters.
                </div>
              </div>
            </div>

            <div class="p-4 rounded-xl bg-surface-container-lowest border border-primary/25 flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <span class="material-symbols-outlined text-[18px]">shield</span>
              </div>
              <div>
                <div class="font-headline-sm text-[13px] font-bold text-on-surface">Federated Model Consensus</div>
                <div class="font-body-sm text-[12px] text-on-surface-variant mt-0.5 leading-relaxed">
                  On-premise edge model flagged this transaction with a <strong>${(score * 100).toFixed(1)}% anomaly risk score</strong>.
                </div>
              </div>
            </div>
          `;
        }

        // Action Buttons for Merchant
        if (btnRejectTitle) btnRejectTitle.textContent = "I Did Not Authorize This / Report Fraud";
        if (btnRejectDesc) btnRejectDesc.textContent = "Block this charge permanently, freeze compromised credentials, and submit an urgent fraud ticket.";
        if (btnRejectIcon) btnRejectIcon.textContent = "report_problem";
        if (btnApproveTitle) btnApproveTitle.textContent = "I Recognize This / Authorize Payment";
        if (btnApproveDesc) btnApproveDesc.textContent = "Confirm that you initiated this merchant transaction and allow the charge to settle.";
        if (btnApproveIcon) btnApproveIcon.textContent = "fingerprint";
      }

      // Risk score number & animated bar
      if (riskEl) riskEl.textContent = `Critical Risk (${score.toFixed(2)})`;
      setTimeout(() => {
        const riskBar = document.getElementById('risk-bar');
        if (riskBar) riskBar.style.width = `${Math.min(100, Math.max(10, score * 100))}%`;
      }, 300);

      // Actions
      const btnApprove = document.getElementById('btnApprove');
      const btnNotMe = document.getElementById('btnNotMe');

      if (btnApprove) {
        btnApprove.addEventListener('click', async () => {
          try {
            await API.resolveAlert(tx.id || txId);
          } catch (e) {
            console.warn("Could not resolve alert on backend, proceeding to Access Restored:", e);
          }
          Router.navigate('/access-restored');
        });
      }

      if (btnNotMe) {
        btnNotMe.addEventListener('click', () => {
          sessionStorage.setItem('investigation_tx', tx.id || txId);
          sessionStorage.setItem('current_alert_tx_data', JSON.stringify(tx));
          Router.navigate('/raise-ticket');
        });
      }

    } catch (err) {
      console.error("Error loading hold details:", err);
    }
  }
};
