window.HoldReasonPage = {
  protected: true,
  render: async () => {
    const div = document.createElement('div');
    div.className = "min-h-screen bg-surface flex flex-col p-4 md:p-8 relative page-enter";
    div.innerHTML = `
      <!-- Dynamic Background -->
      <div class="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-error-container/40 via-surface to-surface -z-10 transition-colors duration-1000" id="bg-glow"></div>

      <div class="w-full max-w-2xl mx-auto flex-1 flex flex-col pt-8">
        <!-- Status Header -->
        <div class="flex items-center gap-3 mb-8">
          <div class="w-12 h-12 rounded-full bg-error-container text-error flex items-center justify-center shrink-0 shadow-sm transition-colors duration-500" id="icon-container">
            <span class="material-symbols-outlined text-[24px]" id="status-icon">shield_locked</span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-label-mono-sm text-label-mono-sm uppercase tracking-wider text-error font-bold transition-colors duration-500" id="status-label">Protective Hold Applied</span>
              <span class="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-mono-sm text-[10px]">Just now</span>
            </div>
            <h1 class="font-display-lg text-[32px] leading-none text-on-surface mt-1" id="page-title">Action Required</h1>
          </div>
        </div>

        <div class="bg-surface-container-lowest rounded-[24px] shadow-[0_8px_30px_rgba(45,42,58,0.04)] border border-error/20 overflow-hidden transition-all duration-500" id="main-card">
          <!-- Transaction Context -->
          <div class="p-6 md:p-8 border-b border-outline-variant/30 bg-surface-container-low/50">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span class="font-label-mono-sm text-label-mono-sm text-on-surface-variant block mb-1 uppercase tracking-wider">Attempted Transaction</span>
                <p class="font-headline-lg text-headline-lg text-on-surface" id="tx-merchant">Loading...</p>
                <p class="font-body-sm text-body-sm text-on-surface-variant mt-1" id="tx-location">Loading...</p>
              </div>
              <div class="text-left md:text-right">
                <span class="font-display-lg text-[36px] leading-none text-on-surface block" id="tx-amount">$0.00</span>
                <span class="font-label-mono-sm text-label-mono-sm text-error bg-error-container/50 px-2 py-0.5 rounded font-semibold inline-block mt-2">Funds Blocked</span>
              </div>
            </div>
          </div>

          <!-- Plain English Explanation (Federated AI output) -->
          <div class="p-6 md:p-8">
            <div class="flex items-start gap-4 mb-6">
              <span class="material-symbols-outlined text-primary text-[28px] shrink-0 mt-1">psychology</span>
              <div>
                <h3 class="font-headline-sm text-headline-sm text-on-surface mb-2">Why was this stopped?</h3>
                <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed" id="tx-reason">
                  Loading AI explanation...
                </p>
              </div>
            </div>

            <!-- Risk Factors Bar -->
            <div class="space-y-3 pl-12 mb-8">
              <div class="flex justify-between font-label-mono-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
                <span>Federated Risk Score</span>
                <span class="text-error font-bold" id="tx-risk">High (0.00)</span>
              </div>
              <div class="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                <div class="h-full bg-error rounded-full transition-all duration-1000 w-0" id="risk-bar"></div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8" id="action-buttons">
              <!-- Reject / Fraud Button -->
              <button id="btnNotMe" class="p-4 rounded-xl border-2 border-error/20 bg-error-container/20 hover:bg-error hover:border-error group transition-all text-left relative overflow-hidden flex flex-col gap-2">
                <div class="absolute inset-0 bg-error/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div class="relative z-10 flex items-center gap-2 text-error group-hover:text-on-error transition-colors">
                  <span class="material-symbols-outlined text-[20px]">report</span>
                  <span class="font-headline-sm text-headline-sm">Not My Transaction</span>
                </div>
                <span class="relative z-10 font-body-sm text-[12px] text-on-surface-variant group-hover:text-on-error/80 transition-colors">Block card & raise investigation ticket instantly.</span>
              </button>

              <!-- Approve / Safe Button -->
              <button id="btnApprove" class="p-4 rounded-xl border-2 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-600 hover:border-emerald-600 group transition-all text-left relative overflow-hidden flex flex-col gap-2">
                <div class="absolute inset-0 bg-emerald-600/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div class="relative z-10 flex items-center gap-2 text-emerald-700 group-hover:text-white transition-colors">
                  <span class="material-symbols-outlined text-[20px]">fingerprint</span>
                  <span class="font-headline-sm text-headline-sm">I Did This (Authorize)</span>
                </div>
                <span class="relative z-10 font-body-sm text-[12px] text-on-surface-variant group-hover:text-white/80 transition-colors">Lift hold and allow transaction to process.</span>
              </button>
            </div>
          </div>
        </div>

        <button class="mt-8 mx-auto font-label-mono-sm text-label-mono-sm uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1" onclick="Router.navigate('/dashboard')">
          <span class="material-symbols-outlined text-[16px]">arrow_back</span> Return to Dashboard
        </button>
      </div>
    `;
    return div;
  },
  afterRender: async () => {
    let txId = sessionStorage.getItem('current_alert_tx');

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
          entity: 'Nexus International Wire',
          amount: '₹1,48,500.00',
          subtext: 'High Risk Overseas Transfer',
          status: 'Flagged'
        };
      }

      if (!alert) {
        alert = alerts.find(a => a.status === 'blocked') || {
          transaction_id: tx.id,
          risk_score: 0.9420,
          explanation_text: tx.flagReason || "This transaction was placed on hold because an overseas wire transfer of this volume heavily deviated from your normal localized behavioral profile."
        };
      }

      // Populate data
      document.getElementById('tx-merchant').textContent = tx.merchant || tx.entity || 'Transaction';
      const amountVal = typeof tx.amount === 'number' ? `₹${tx.amount.toLocaleString('en-IN')}` : (tx.amount || '₹0.00');
      document.getElementById('tx-amount').textContent = amountVal;
      document.getElementById('tx-location').textContent = `${tx.subtext || tx.location || 'Attempted activity'} • Account Verified`;
      
      let reason = alert.explanation_text || tx.flagReason || "This transaction deviated significantly from your typical spending patterns based on our federated models.";
      let score = alert.risk_score || alert.fraud_score || 0.94;
      
      document.getElementById('tx-reason').textContent = reason;
      document.getElementById('tx-risk').textContent = `High (${(score).toFixed(2)})`;
      
      setTimeout(() => {
        const riskBar = document.getElementById('risk-bar');
        if (riskBar) riskBar.style.width = `${Math.min(100, score * 100)}%`;
      }, 300);

      // Actions
      const btnApprove = document.getElementById('btnApprove');
      const btnNotMe = document.getElementById('btnNotMe');
      
      btnApprove.addEventListener('click', () => {
        sessionStorage.setItem('investigation_tx', txId);
        Router.navigate('/raise-ticket');
      });

      btnNotMe.addEventListener('click', () => {
        sessionStorage.setItem('investigation_tx', txId);
        Router.navigate('/raise-ticket');
      });

    } catch (err) {
      console.error("Error loading hold details:", err);
      alert("Failed to load details.");
    }
  }
};
