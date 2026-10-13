/**
 * hold-reason.js — Protective Hold & Detailed Fraud Explanation
 * Displays comprehensive transaction details:
 * - Sender / Originator details (From whom it came)
 * - Recipient / Beneficiary details (To whom it went)
 * - Exact Timestamp & Transmission Time
 * - Deep AI Fraud Explanation & Multi-factor Flag Reason Breakdown
 */

window.HoldReasonPage = {
  protected: true,
  render: async () => {
    const div = document.createElement('div');
    div.className = "min-h-screen bg-surface flex flex-col p-4 md:p-8 relative page-enter";
    div.innerHTML = `
      <!-- Dynamic Background Glow -->
      <div class="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-error-container/30 via-surface to-surface -z-10 transition-colors duration-1000" id="bg-glow"></div>

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
                <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-error-container text-error font-label-mono-sm text-[11px] font-bold uppercase tracking-wider">
                  <span class="w-2 h-2 rounded-full bg-error animate-pulse"></span>
                  Protective Hold Applied
                </span>
                <span class="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-mono-sm text-[10px]">Just now</span>
              </div>
              <h1 class="font-display-lg text-[28px] md:text-[34px] leading-tight text-on-surface mt-1" id="page-title">Action Required: Transaction Flagged</h1>
            </div>
          </div>

          <div class="hidden sm:flex items-center gap-2">
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-[12px] text-on-surface-variant font-medium">
              <span class="material-symbols-outlined text-[16px] text-primary">security</span>
              Model FL-14 Edge Guard
            </span>
          </div>
        </div>

        <!-- Main Incident Card -->
        <div class="bg-surface-container-lowest rounded-[24px] shadow-[0_12px_40px_rgba(45,42,58,0.06)] border border-error/25 overflow-hidden transition-all duration-500 mb-6" id="main-card">
          
          <!-- Top Financial Overview -->
          <div class="p-6 md:p-8 border-b border-outline-variant/20 bg-gradient-to-r from-error-container/20 via-surface-container-low/40 to-surface-container-low/60">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span class="font-label-mono-sm text-[11px] text-error font-bold block mb-1 uppercase tracking-wider flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[16px]">report</span>
                  Attempted Intercepted Transaction
                </span>
                <h2 class="font-headline-lg text-[24px] md:text-[28px] font-bold text-on-surface tracking-tight" id="tx-merchant">Nexus International Wire</h2>
                <p class="font-body-sm text-[13px] text-on-surface-variant mt-1" id="tx-location">High Risk Overseas Transfer &bull; Account Verified</p>
              </div>
              <div class="text-left md:text-right">
                <span class="font-display-lg text-[36px] md:text-[42px] font-bold text-on-surface block tracking-tight text-error" id="tx-amount">-₹1,48,500.00</span>
                <span class="font-label-mono-sm text-[11px] text-error bg-error-container/60 border border-error/30 px-3 py-1 rounded-full font-bold inline-flex items-center gap-1 mt-2">
                  <span class="material-symbols-outlined text-[14px]">lock</span>
                  Funds Temporarily Blocked
                </span>
              </div>
            </div>
          </div>

          <!-- Section 1: Detailed Routing (From Whom ➔ To Whom) -->
          <div class="p-6 md:p-8 border-b border-outline-variant/20">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-label-mono-sm text-[12px] uppercase tracking-wider text-on-surface font-bold flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[18px]">swap_horiz</span>
                Transaction Routing Details (Sender &rarr; Recipient)
              </h3>
              <span class="text-[11px] font-mono text-on-surface-variant/80 bg-surface-container px-2 py-0.5 rounded-md" id="tx-ref-id">
                Ref: #TXN-FLAGGED
              </span>
            </div>

            <!-- Flow Visual Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Sender / Originator Box (FROM) -->
              <div class="p-4 md:p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-label-mono-sm text-[11px] font-bold uppercase tracking-wider">
                      <span class="material-symbols-outlined text-[15px]">arrow_downward</span>
                      From (Originator / Sender)
                    </span>
                    <span class="text-[10px] uppercase font-mono text-on-surface-variant/70 font-semibold">Inbound Origin</span>
                  </div>
                  <div class="font-headline-sm text-[16px] font-bold text-on-surface" id="tx-sender-name">
                    Nexus International Wire Clearing LLC
                  </div>
                  <p class="font-label-mono-sm text-[12px] text-on-surface-variant font-mono mt-0.5" id="tx-sender-account">
                    A/C &bull;&bull;&bull;&bull; 9842 (IBAN: GB82 MIDL 4005 1512 3456)
                  </p>
                </div>

                <div class="mt-4 pt-3 border-t border-outline-variant/20 space-y-1.5 text-[12px] text-on-surface-variant">
                  <div class="flex items-center justify-between">
                    <span class="font-medium">Originating Bank:</span>
                    <span class="font-semibold text-on-surface text-right" id="tx-sender-bank">Standard Chartered Bank (London Gateway)</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="font-medium">Origin Location & IP:</span>
                    <span class="font-semibold text-on-surface text-right" id="tx-sender-location">London, UK (IP: 185.220.101.5)</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="font-medium">Transfer Channel:</span>
                    <span class="font-semibold text-primary font-mono text-right" id="tx-sender-channel">SWIFT Wire MT103</span>
                  </div>
                </div>
              </div>

              <!-- Recipient / Beneficiary Box (TO) -->
              <div class="p-4 md:p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-800 font-label-mono-sm text-[11px] font-bold uppercase tracking-wider">
                      <span class="material-symbols-outlined text-[15px]">arrow_upward</span>
                      To (Beneficiary / Recipient)
                    </span>
                    <span class="text-[10px] uppercase font-mono text-on-surface-variant/70 font-semibold">Target Account</span>
                  </div>
                  <div class="font-headline-sm text-[16px] font-bold text-on-surface" id="tx-recipient-name">
                    Rajesh Sharma (Your Primary Account)
                  </div>
                  <p class="font-label-mono-sm text-[12px] text-on-surface-variant font-mono mt-0.5" id="tx-recipient-account">
                    A/C &bull;&bull;&bull;&bull; 6655 (Savings Account)
                  </p>
                </div>

                <div class="mt-4 pt-3 border-t border-outline-variant/20 space-y-1.5 text-[12px] text-on-surface-variant">
                  <div class="flex items-center justify-between">
                    <span class="font-medium">Beneficiary Bank:</span>
                    <span class="font-semibold text-on-surface text-right" id="tx-recipient-bank">Nagaland Regional Bank &bull; Kohima Main Branch</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="font-medium">IFSC / Domestic Code:</span>
                    <span class="font-semibold text-on-surface font-mono text-right" id="tx-recipient-ifsc">NRBN0001842</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="font-medium">Settlement Status:</span>
                    <span class="font-semibold text-error text-right">Held in Edge Clearing Buffer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 2: Exact Transaction Time & Audit Metadata -->
          <div class="p-6 md:p-8 border-b border-outline-variant/20 bg-surface-container-low/30">
            <h3 class="font-label-mono-sm text-[12px] uppercase tracking-wider text-on-surface font-bold flex items-center gap-2 mb-4">
              <span class="material-symbols-outlined text-primary text-[18px]">schedule</span>
              Transaction Timestamp & Transmission Audit
            </h3>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div class="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/25">
                <span class="block font-label-mono-sm text-[10px] uppercase tracking-wider text-on-surface-variant mb-1 font-semibold">Exact Transaction Time</span>
                <span class="font-body-sm text-[13px] text-on-surface font-bold flex items-center gap-1.5" id="tx-exact-time">
                  <span class="material-symbols-outlined text-[15px] text-primary">alarm</span>
                  Today, 09:41:28 AM IST
                </span>
              </div>

              <div class="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/25">
                <span class="block font-label-mono-sm text-[10px] uppercase tracking-wider text-on-surface-variant mb-1 font-semibold">Value / Processing Date</span>
                <span class="font-body-sm text-[13px] text-on-surface font-bold flex items-center gap-1.5" id="tx-exact-date">
                  <span class="material-symbols-outlined text-[15px] text-primary">calendar_today</span>
                  13 Oct 2026
                </span>
              </div>

              <div class="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/25">
                <span class="block font-label-mono-sm text-[10px] uppercase tracking-wider text-on-surface-variant mb-1 font-semibold">Core Banking UTR Ref</span>
                <span class="font-body-sm text-[13px] text-on-surface font-mono font-semibold" id="tx-utr-ref">
                  UTR-20261013-883921-NRB
                </span>
              </div>

              <div class="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/25">
                <span class="block font-label-mono-sm text-[10px] uppercase tracking-wider text-on-surface-variant mb-1 font-semibold">Detection Response Latency</span>
                <span class="font-body-sm text-[13px] text-emerald-700 font-bold flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[15px] text-emerald-600">bolt</span>
                  18ms (Edge AI Intercept)
                </span>
              </div>
            </div>
          </div>

          <!-- Section 3: Deep AI Fraud Explanation & Why Flag Was Raised -->
          <div class="p-6 md:p-8">
            <div class="flex items-start gap-3.5 mb-6">
              <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-[24px]">psychology</span>
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-headline-sm text-[18px] font-bold text-on-surface">Why was this flag raised?</h3>
                  <span class="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono text-[10px] font-bold">Federated AI Analysis</span>
                </div>
                <p class="font-body-md text-[14px] text-on-surface-variant leading-relaxed" id="tx-reason">
                  This transaction was placed on protective hold because an incoming overseas wire transfer of this magnitude heavily deviates from typical account behavior based on federated local inference.
                </p>
              </div>
            </div>

            <!-- Federated Risk Score Bar -->
            <div class="bg-surface-container/60 rounded-2xl p-4 md:p-5 border border-outline-variant/30 mb-6">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span class="font-label-mono-sm text-[11px] uppercase tracking-wider text-on-surface font-bold">Federated Risk Score</span>
                  <span class="text-[11px] text-on-surface-variant font-mono">(Threshold: &gt; 0.50 triggers block)</span>
                </div>
                <span class="text-error font-bold font-mono text-[13px]" id="tx-risk">Critical Risk (0.94)</span>
              </div>
              <div class="w-full h-2.5 bg-surface-variant rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-error rounded-full transition-all duration-1000 w-0" id="risk-bar"></div>
              </div>
            </div>

            <!-- Multi-factor Breakdown Cards: Explicit Reasons Why Flag Was Raised -->
            <div class="mb-8">
              <h4 class="font-label-mono-sm text-[11px] uppercase tracking-wider text-on-surface-variant font-bold mb-3 flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px] text-error">warning</span>
                Specific Flag Indicators Triggered by Local Model
              </h4>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <!-- Indicator 1: Amount Spike -->
                <div class="p-4 rounded-xl bg-surface-container-lowest border border-error/20 flex items-start gap-3">
                  <div class="w-8 h-8 rounded-lg bg-error/10 text-error flex items-center justify-center shrink-0 mt-0.5">
                    <span class="material-symbols-outlined text-[18px]">trending_up</span>
                  </div>
                  <div>
                    <div class="font-headline-sm text-[13px] font-bold text-on-surface">Extreme Transaction Value Anomaly</div>
                    <div class="font-body-sm text-[12px] text-on-surface-variant mt-0.5 leading-relaxed">
                      The transfer amount of <strong>₹1,48,500.00</strong> is <strong>18.5&times; higher</strong> than your account's 90-day median transaction size (&asymp; ₹8,000.00).
                    </div>
                  </div>
                </div>

                <!-- Indicator 2: Geo / Device Mismatch -->
                <div class="p-4 rounded-xl bg-surface-container-lowest border border-error/20 flex items-start gap-3">
                  <div class="w-8 h-8 rounded-lg bg-error/10 text-error flex items-center justify-center shrink-0 mt-0.5">
                    <span class="material-symbols-outlined text-[18px]">travel_explore</span>
                  </div>
                  <div>
                    <div class="font-headline-sm text-[13px] font-bold text-on-surface">Unrecognized Origin &amp; Geofence Mismatch</div>
                    <div class="font-body-sm text-[12px] text-on-surface-variant mt-0.5 leading-relaxed">
                      Originated from an overseas routing node (<strong>London, UK</strong>) that does not match your domestic account geographic activity history.
                    </div>
                  </div>
                </div>

                <!-- Indicator 3: Unverified Channel -->
                <div class="p-4 rounded-xl bg-surface-container-lowest border border-error/20 flex items-start gap-3">
                  <div class="w-8 h-8 rounded-lg bg-error/10 text-error flex items-center justify-center shrink-0 mt-0.5">
                    <span class="material-symbols-outlined text-[18px]">hub</span>
                  </div>
                  <div>
                    <div class="font-headline-sm text-[13px] font-bold text-on-surface">High-Risk International Gateway Channel</div>
                    <div class="font-body-sm text-[12px] text-on-surface-variant mt-0.5 leading-relaxed">
                      Executed via cross-border wire clearing without prior verified correspondent relationship or customer standing instruction.
                    </div>
                  </div>
                </div>

                <!-- Indicator 4: Federated Edge Consensus -->
                <div class="p-4 rounded-xl bg-surface-container-lowest border border-error/20 flex items-start gap-3">
                  <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <span class="material-symbols-outlined text-[18px]">shield</span>
                  </div>
                  <div>
                    <div class="font-headline-sm text-[13px] font-bold text-on-surface">Federated Model Consensus (FL-14)</div>
                    <div class="font-body-sm text-[12px] text-on-surface-variant mt-0.5 leading-relaxed">
                      On-device neural network classified this behavioral vector in the top <strong>0.6% anomaly percentile</strong> with 94.2% fraud confidence.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Privacy Guarantee Badge -->
            <div class="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3 mb-8">
              <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-[18px]">verified_user</span>
              </div>
              <div class="text-[12px] text-on-surface leading-relaxed">
                <span class="font-bold text-primary">Absolute Data Privacy Guarantee:</span>
                This inference was computed strictly inside your home bank's edge perimeter. No personal account numbers, names, or transaction payloads were ever exported.
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4" id="action-buttons">
              <!-- Reject / Fraud Button -->
              <button id="btnNotMe" class="p-4 md:p-5 rounded-2xl border-2 border-error/30 bg-error/5 hover:bg-error hover:border-error group transition-all text-left relative overflow-hidden flex flex-col gap-2 cursor-pointer shadow-sm hover:shadow-md">
                <div class="absolute inset-0 bg-error/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div class="relative z-10 flex items-center justify-between">
                  <div class="flex items-center gap-2 text-error group-hover:text-white transition-colors">
                    <span class="material-symbols-outlined text-[22px]">report_problem</span>
                    <span class="font-headline-sm text-[16px] font-bold">Not My Transaction</span>
                  </div>
                  <span class="material-symbols-outlined text-[18px] text-error group-hover:text-white transition-colors">arrow_forward</span>
                </div>
                <span class="relative z-10 font-body-sm text-[12px] text-on-surface-variant group-hover:text-white/90 transition-colors leading-relaxed">
                  Permanently block unauthorized transfer, safeguard account, and open an investigation dispute ticket.
                </span>
              </button>

              <!-- Approve / Safe Button -->
              <button id="btnApprove" class="p-4 md:p-5 rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-600 hover:border-emerald-600 group transition-all text-left relative overflow-hidden flex flex-col gap-2 cursor-pointer shadow-sm hover:shadow-md">
                <div class="absolute inset-0 bg-emerald-600/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div class="relative z-10 flex items-center justify-between">
                  <div class="flex items-center gap-2 text-emerald-700 group-hover:text-white transition-colors">
                    <span class="material-symbols-outlined text-[22px]">fingerprint</span>
                    <span class="font-headline-sm text-[16px] font-bold">I Did This (Authorize)</span>
                  </div>
                  <span class="material-symbols-outlined text-[18px] text-emerald-700 group-hover:text-white transition-colors">arrow_forward</span>
                </div>
                <span class="relative z-10 font-body-sm text-[12px] text-on-surface-variant group-hover:text-white/90 transition-colors leading-relaxed">
                  Verify your identity, lift the protective hold, and allow the transaction to proceed to settlement.
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

      // Resilient fallbacks: find flagged transaction if exact id wasn't matched
      if (!tx) {
        tx = txs.find(t => t.status === 'Flagged' || t.category === 'flagged') || txs[0] || {
          id: txId || 'TXN-FLAGGED',
          entity: 'Nexus International Wire Clearing LLC',
          merchant: 'Nexus International Wire',
          amount: 148500.0,
          subtext: 'High Risk Overseas Inbound Wire Transfer',
          status: 'Flagged',
          timestamp: 'Today, 09:41:28 AM IST'
        };
      }

      if (!alert) {
        alert = alerts.find(a => a.status === 'blocked') || {
          transaction_id: tx.id,
          risk_score: 0.9420,
          explanation_text: tx.flagReason || "This transaction was placed on protective hold because an incoming overseas wire transfer of this magnitude heavily deviates from typical account behavior based on federated local inference."
        };
      }

      const txRef = tx.id ? (tx.id.startsWith('TXN-') ? tx.id : `TXN-${tx.id.slice(-6).toUpperCase()}`) : 'TXN-CBE3AC';
      const cleanAmt = typeof tx.amount === 'number' 
        ? tx.amount 
        : parseFloat(String(tx.amount || '').replace(/[^0-9.]/g, '')) || 148500.0;
      const formattedAmount = `₹${cleanAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

      // 1. Overview data
      const merchantEl = document.getElementById('tx-merchant');
      if (merchantEl) merchantEl.textContent = tx.merchant || tx.entity || 'Nexus International Wire';

      const amountEl = document.getElementById('tx-amount');
      if (amountEl) amountEl.textContent = `-${formattedAmount}`;

      const locationEl = document.getElementById('tx-location');
      if (locationEl) locationEl.textContent = `${tx.subtext || 'High Risk Overseas Transfer'} • Account Verified`;

      const refIdEl = document.getElementById('tx-ref-id');
      if (refIdEl) refIdEl.textContent = `Ref: #${txRef}`;

      // 2. Sender / Originator details (From whom it came)
      const senderNameEl = document.getElementById('tx-sender-name');
      if (senderNameEl) senderNameEl.textContent = tx.senderName || tx.entity || 'Nexus International Wire Clearing LLC';

      const senderAccountEl = document.getElementById('tx-sender-account');
      if (senderAccountEl) senderAccountEl.textContent = tx.senderAccount || 'A/C •••• 9842 (IBAN: GB82 MIDL 4005 1512 3456)';

      const senderBankEl = document.getElementById('tx-sender-bank');
      if (senderBankEl) senderBankEl.textContent = tx.senderBank || 'Standard Chartered Bank (London Gateway Branch)';

      const senderLocationEl = document.getElementById('tx-sender-location');
      if (senderLocationEl) senderLocationEl.textContent = tx.senderLocation || 'London, UK (IP: 185.220.101.5 • Foreign Routing)';

      const senderChannelEl = document.getElementById('tx-sender-channel');
      if (senderChannelEl) senderChannelEl.textContent = tx.channel || 'SWIFT Wire MT103 (Cross-Border)';

      // 3. Recipient / Beneficiary details (To whom it went)
      const recipientNameEl = document.getElementById('tx-recipient-name');
      if (recipientNameEl) recipientNameEl.textContent = `${activeName} (Your Account)`;

      const recipientAccountEl = document.getElementById('tx-recipient-account');
      if (recipientAccountEl) recipientAccountEl.textContent = `A/C •••• ${activePhone.slice(-4)} (Primary Account)`;

      const recipientBankEl = document.getElementById('tx-recipient-bank');
      if (recipientBankEl) recipientBankEl.textContent = `${bankName} • Main Branch`;

      const recipientIfscEl = document.getElementById('tx-recipient-ifsc');
      if (recipientIfscEl) recipientIfscEl.textContent = `NRBN0001842 • Domestic Node #1`;

      // 4. Timestamp & Exact Time
      const rawTimestamp = tx.timestamp || 'Today, 09:41:28 AM IST';
      const exactTimeEl = document.getElementById('tx-exact-time');
      if (exactTimeEl) {
        exactTimeEl.innerHTML = `
          <span class="material-symbols-outlined text-[15px] text-primary">alarm</span>
          ${rawTimestamp.includes('AM') || rawTimestamp.includes('PM') ? rawTimestamp : `${rawTimestamp} (09:41:28 AM IST)`}
        `;
      }

      const exactDateEl = document.getElementById('tx-exact-date');
      if (exactDateEl) {
        const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        exactDateEl.innerHTML = `
          <span class="material-symbols-outlined text-[15px] text-primary">calendar_today</span>
          ${todayStr}
        `;
      }

      const utrRefEl = document.getElementById('tx-utr-ref');
      if (utrRefEl) {
        utrRefEl.textContent = `UTR-20261013-${txRef.slice(-6)}-NRB`;
      }

      // 5. Reason the flag was raised
      let reason = alert.explanation_text || tx.flagReason || "This transaction was placed on protective hold because an incoming overseas wire transfer of this magnitude heavily deviates from typical account behavior based on federated local inference.";
      let score = alert.risk_score || alert.fraud_score || 0.9420;

      const reasonEl = document.getElementById('tx-reason');
      if (reasonEl) reasonEl.textContent = reason;

      const riskEl = document.getElementById('tx-risk');
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
          Router.navigate('/raise-ticket');
        });
      }

    } catch (err) {
      console.error("Error loading hold details:", err);
    }
  }
};
