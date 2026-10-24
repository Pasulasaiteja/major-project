/**
 * raise-ticket.js — Raise a Context-Aware Fraud Investigation Ticket
 * Dynamically provides tailored dispute reasons based on the flagged fraud type:
 * - ATM Cash Withdrawal (Cloning, Skimmer, Terminal Error, Not Present, Lost Card)
 * - Inbound International Wire (Unknown Sender, Mule Scam, Unexpected Deposit)
 * - Merchant Payment / POS / UPI (Unknown Merchant, Overcharge, Duplicate, CNP Fraud)
 * - Domestic Account Transfer (Unauthorized Beneficiary, Impersonator Phishing, Typo)
 */

window.RaiseTicketPage = {
  protected: true,
  render: async () => {
    // 1. Resolve Transaction Context
    const txId = sessionStorage.getItem('investigation_tx') || null;
    let txInfo = null;

    try {
      const savedTx = sessionStorage.getItem('current_alert_tx_data');
      if (savedTx) txInfo = JSON.parse(savedTx);
    } catch (e) { /* silent */ }

    if (!txInfo) {
      try {
        const phone = localStorage.getItem('fs_active_phone');
        const txListRaw = localStorage.getItem(`fs_txns_${phone}`) || '[]';
        const txList = JSON.parse(txListRaw);
        txInfo = txList.find(t => String(t.id) === String(txId)) || null;
      } catch (e) { /* silent */ }
    }

    // Try fetching via API if still not found
    if (!txInfo && typeof API !== 'undefined' && API.getTransactions) {
      try {
        const apiTxs = await API.getTransactions();
        if (Array.isArray(apiTxs)) {
          txInfo = (txId ? apiTxs.find(t => String(t.id) === String(txId)) : null) || 
                   apiTxs.find(t => t.status === 'Flagged' || t.category === 'flagged') || null;
        }
      } catch (e) { /* silent */ }
    }

    // Fallback default for demo if none resolved
    if (!txInfo && txId) {
      txInfo = {
        id: txId,
        entity: 'Late-Night ATM Cash Withdrawal',
        amount: '-₹25,000.00',
        subtext: 'Suspicious Off-Hours ATM Withdrawal — Terminal #0842',
        channel: 'Domestic ATM Debit',
        channelType: 'Domestic ATM Cash Withdrawal',
        status: 'Flagged'
      };
    }

    const txRef = txInfo?.id ? (txInfo.id.startsWith('TXN-') ? txInfo.id : `TXN-${txInfo.id.slice(-6).toUpperCase()}`) : (txId ? `TXN-${txId.slice(-6).toUpperCase()}` : null);
    const txMerchant = txInfo ? (txInfo.entity || txInfo.merchant || 'Flagged Transaction') : null;
    let txAmt = null;
    if (txInfo) {
      if (typeof txInfo.amount === 'string' && (txInfo.amount.includes('₹') || txInfo.amount.includes('$'))) {
        txAmt = txInfo.amount;
      } else {
        const val = typeof txInfo.raw_amount === 'number' ? txInfo.raw_amount : Number(txInfo.amount || 0);
        const sign = (txInfo.isPositive || txInfo.is_positive) ? '+' : '-';
        txAmt = `${sign}₹${Math.abs(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
    }

    // 2. Classify Fraud Scenario
    function detectScenario(tx) {
      if (!tx) return 'GENERIC';
      const entity = (tx.entity || tx.merchant || '').toLowerCase();
      const subtext = (tx.subtext || '').toLowerCase();
      const channel = (tx.channel || '').toLowerCase();
      const channelType = (tx.channelType || tx.channel_type || '').toLowerCase();
      const flagReason = (tx.flagReason || tx.flag_reason || '').toLowerCase();
      const isPositiveAmt = tx.isPositive === true || tx.is_positive === 1 || String(tx.amount || '').startsWith('+') || channelType.includes('inbound');

      if (channel.includes('atm') || channelType.includes('atm') || entity.includes('atm') || subtext.includes('atm') || flagReason.includes('atm') || flagReason.includes('skimmer')) {
        return 'ATM_WITHDRAWAL';
      }
      if (isPositiveAmt || channel.includes('wire') || channel.includes('swift') || entity.includes('wire') || entity.includes('nexus') || channelType.includes('inbound')) {
        return 'INCOMING_WIRE';
      }
      if (channel.includes('pos') || channel.includes('upi') || channelType.includes('pos') || channelType.includes('retail') || channel.includes('merchant') || entity.includes('market') || entity.includes('store') || entity.includes('shop')) {
        return 'MERCHANT_PAYMENT';
      }
      if (channel.includes('neft') || channel.includes('imps') || channel.includes('transfer') || channelType.includes('transfer')) {
        return 'DOMESTIC_TRANSFER';
      }
      return 'GENERIC';
    }

    const scenario = detectScenario(txInfo);

    // 3. Define Context-Specific Reasons & Configurations
    const SCENARIO_CONFIG = {
      ATM_WITHDRAWAL: {
        categoryName: "ATM Cash Withdrawal",
        categoryIcon: "local_atm",
        badgeColor: "bg-rose-500/10 text-rose-800 border-rose-500/20",
        selectPlaceholder: "— Select an ATM dispute reason —",
        commentPlaceholder: "Provide details: e.g. I still possess my physical debit card, I was asleep at home at 02:41 AM, or the ATM machine made counting sounds but dispensed no cash...",
        options: [
          { value: "atm_not_present", label: "I was never present at this ATM terminal / location" },
          { value: "skimmer_cloned_card", label: "Suspected card skimming / cloning (I still have my card)" },
          { value: "card_lost_stolen", label: "My physical debit card was lost, stolen, or misplaced" },
          { value: "atm_cash_dispense_error", label: "ATM hardware error (Cash was not dispensed, but account debited)" },
          { value: "unauthorized_pin_coercion", label: "Unauthorized PIN compromise or coerced withdrawal" },
          { value: "other_atm_issue", label: "Other ATM transaction discrepancy" }
        ]
      },
      INCOMING_WIRE: {
        categoryName: "International Inbound Wire",
        categoryIcon: "south_west",
        badgeColor: "bg-amber-500/10 text-amber-900 border-amber-500/20",
        selectPlaceholder: "— Select an inbound wire dispute reason —",
        commentPlaceholder: "Provide details: e.g. I don't know the overseas sender, I never authorized an inbound wire from the UK, or the expected transfer amount was different...",
        options: [
          { value: "unrecognized_sender", label: "I do not recognize or know this overseas sender" },
          { value: "suspected_deposit_scam", label: "Unsolicited wire deposit (Suspected money mule or accidental wire scam)" },
          { value: "wrong_wire_amount", label: "I expected a remittance, but the transfer amount is incorrect" },
          { value: "unauthorized_account_disclosure", label: "I never provided my bank account or IFSC to this sender" },
          { value: "unauthorized_inbound", label: "I did not initiate or authorize this incoming transfer" },
          { value: "other_wire_issue", label: "Other international wire discrepancy" }
        ]
      },
      MERCHANT_PAYMENT: {
        categoryName: "Merchant / POS Payment",
        categoryIcon: "storefront",
        badgeColor: "bg-primary/10 text-primary border-primary/20",
        selectPlaceholder: "— Select a merchant payment dispute reason —",
        commentPlaceholder: "Provide details: e.g. I never visited this retail outlet, was charged twice for one item, or did not authorize this online transaction...",
        options: [
          { value: "unrecognized_merchant", label: "I don't recognize this store or merchant" },
          { value: "wrong_charge_amount", label: "I visited this merchant, but was overcharged / charged wrong amount" },
          { value: "duplicate_charge", label: "Duplicate charge (Billed multiple times for the same transaction)" },
          { value: "card_not_present_fraud", label: "Unauthorized online / Card-Not-Present transaction" },
          { value: "unauthorized_upi", label: "Fraudulent UPI collect request or malicious QR payment" },
          { value: "stolen_card_details", label: "My card details or NetBanking credentials were compromised" },
          { value: "other_merchant_issue", label: "Other merchant billing dispute" }
        ]
      },
      DOMESTIC_TRANSFER: {
        categoryName: "Domestic Account Transfer",
        categoryIcon: "send",
        badgeColor: "bg-secondary/10 text-secondary border-secondary/20",
        selectPlaceholder: "— Select a transfer dispute reason —",
        commentPlaceholder: "Provide details: e.g. I did not add this beneficiary, I entered the account number with a typo, or I was instructed by an impersonator...",
        options: [
          { value: "unauthorized_beneficiary", label: "I did not add or authorize transfer to this beneficiary" },
          { value: "wrong_account_number", label: "Accidental transfer (Sent to wrong account number or IFSC typo)" },
          { value: "phishing_impostor_scam", label: "Deceived by impersonator / fraudulent phone caller (Phishing scam)" },
          { value: "compromised_netbanking", label: "Unauthorized NetBanking login or mobile banking app session" },
          { value: "other_transfer_issue", label: "Other account transfer dispute" }
        ]
      },
      GENERIC: {
        categoryName: "Flagged Transaction",
        categoryIcon: "shield_locked",
        badgeColor: "bg-surface-container-high text-on-surface-variant border-outline-variant/30",
        selectPlaceholder: "— Select a reason for dispute —",
        commentPlaceholder: "Provide any additional context — location you were at, expected amount, or why you dispute this transaction...",
        options: [
          { value: "unauthorized", label: "I did not authorize any transaction" },
          { value: "wrong_amount", label: "The billed amount does not match what I agreed to" },
          { value: "stolen_card", label: "My card or banking credentials may have been stolen" },
          { value: "scam_fraud", label: "I was the victim of a fraudulent scam or unauthorized access" },
          { value: "other", label: "Other discrepancy" }
        ]
      }
    };

    const config = SCENARIO_CONFIG[scenario];

    const div = document.createElement('div');
    div.className = "min-h-screen bg-surface flex flex-col p-4 md:p-8 relative page-enter";
    div.innerHTML = `
      <div class="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/8 via-surface to-surface -z-10"></div>

      <div class="w-full max-w-2xl mx-auto flex-1 flex flex-col pt-8">
        <!-- Header -->
        <div class="flex items-center gap-3 mb-8">
          <button onclick="window.history.back()" class="p-2 rounded-full hover:bg-surface-container transition-colors cursor-pointer" title="Go Back">
            <span class="material-symbols-outlined text-on-surface-variant">arrow_back</span>
          </button>
          <div class="flex-1 min-w-0">
            <h1 class="font-display-lg text-[28px] md:text-[32px] text-on-surface leading-none">Raise Investigation Ticket</h1>
            <p class="font-body-sm text-on-surface-variant mt-1 text-[13px]">Our fraud intelligence specialists will investigate within 2–3 business days.</p>
          </div>
          <a href="#" onclick="Router.navigate('/ticket-status'); return false;"
            class="shrink-0 inline-flex items-center gap-1.5 text-[12px] font-semibold text-primary border border-primary/30 px-3 py-1.5 rounded-full hover:bg-primary/5 transition-colors cursor-pointer">
            <span class="material-symbols-outlined text-[15px]">receipt_long</span>
            My Tickets
          </a>
        </div>

        <div class="bg-surface-container-lowest rounded-[24px] shadow-[0_8px_30px_rgba(45,42,58,0.04)] border border-outline-variant/30 overflow-hidden">
          
          ${txRef ? `
          <!-- Flagged Transaction Context Banner -->
          <div class="flex items-center gap-4 px-6 md:px-8 py-4 bg-surface-container-low border-b border-outline-variant/30">
            <div class="w-10 h-10 rounded-xl bg-error/10 text-error flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-[20px]">${config.categoryIcon}</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-0.5">
                <span class="font-label-mono-sm text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Flagged Transaction</span>
                <span class="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-mono font-bold border ${config.badgeColor}">
                  ${config.categoryName}
                </span>
              </div>
              <div class="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                <span class="font-headline-sm text-[14px] font-bold text-on-surface truncate">${txMerchant || 'Flagged Transaction'}</span>
                ${txAmt ? `<span class="font-label-mono-md text-error font-bold">${txAmt}</span>` : ''}
              </div>
              <div class="font-body-sm text-[11px] text-on-surface-variant font-mono mt-0.5">Ref: #${txRef} ${txInfo?.subtext ? `&bull; ${txInfo.subtext}` : ''}</div>
            </div>
            <span class="shrink-0 px-2.5 py-1 rounded-lg bg-error/10 text-error text-[11px] font-bold font-label-mono-sm flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>
              Hold Active
            </span>
          </div>
          ` : ''}

          <div class="p-6 md:p-8">
            <form id="ticket-form" class="space-y-6">
              <!-- Hidden transaction references -->
              <input type="hidden" id="ticket-tx-id" value="${txRef || txId || ''}">
              <input type="hidden" id="ticket-scenario" value="${scenario}">

              <!-- Dynamic Reason Selection -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label class="block font-label-mono-sm text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                    Reason for Dispute <span class="text-error">*</span>
                  </label>
                  <span class="font-label-mono-sm text-[10px] text-primary font-semibold uppercase tracking-wider">
                    Tailored for ${config.categoryName}
                  </span>
                </div>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">help</span>
                  <select id="ticket-reason" required
                    class="w-full pl-12 pr-10 h-12 rounded-xl border border-outline-variant/50 bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary appearance-none cursor-pointer font-body-md transition-all text-[13px] md:text-[14px]">
                    <option value="">${config.selectPlaceholder}</option>
                    ${config.options.map(opt => `
                      <option value="${opt.value}">${opt.label}</option>
                    `).join('')}
                  </select>
                  <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                </div>
              </div>

              <!-- Contextual Additional Details -->
              <div>
                <label class="block font-label-mono-sm text-[11px] uppercase tracking-wider text-on-surface-variant mb-2 font-bold">
                  Additional Details &amp; Notes <span class="text-on-surface-variant/50 font-normal">(Optional)</span>
                </label>
                <textarea id="ticket-comments" rows="4"
                  class="w-full p-4 rounded-xl border border-outline-variant/50 bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-body-md resize-none transition-all text-[13px] md:text-[14px]"
                  placeholder="${config.commentPlaceholder}"></textarea>
              </div>

              <!-- Contact Preference -->
              <div>
                <label class="block font-label-mono-sm text-[11px] uppercase tracking-wider text-on-surface-variant mb-3 font-bold">Contact Preference</label>
                <div class="flex flex-wrap gap-3" id="contact-pref-group">
                  <label class="contact-pref-option flex items-center gap-2 px-4 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container cursor-pointer hover:border-primary/50 transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <input type="radio" name="contact-pref" value="sms" class="accent-primary" checked>
                    <span class="material-symbols-outlined text-[17px] text-on-surface-variant">sms</span>
                    <span class="font-body-sm text-[13px] text-on-surface font-medium">SMS</span>
                  </label>
                  <label class="contact-pref-option flex items-center gap-2 px-4 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container cursor-pointer hover:border-primary/50 transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <input type="radio" name="contact-pref" value="email" class="accent-primary">
                    <span class="material-symbols-outlined text-[17px] text-on-surface-variant">email</span>
                    <span class="font-body-sm text-[13px] text-on-surface font-medium">Email</span>
                  </label>
                  <label class="contact-pref-option flex items-center gap-2 px-4 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container cursor-pointer hover:border-primary/50 transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <input type="radio" name="contact-pref" value="none" class="accent-primary">
                    <span class="material-symbols-outlined text-[17px] text-on-surface-variant">do_not_disturb</span>
                    <span class="font-body-sm text-[13px] text-on-surface font-medium">No Contact</span>
                  </label>
                </div>
              </div>

              <!-- Urgency Level -->
              <div>
                <label class="block font-label-mono-sm text-[11px] uppercase tracking-wider text-on-surface-variant mb-2 font-bold">Urgency Level</label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">priority_high</span>
                  <select id="ticket-urgency"
                    class="w-full pl-12 pr-10 h-12 rounded-xl border border-outline-variant/50 bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary appearance-none cursor-pointer font-body-md transition-all text-[13px] md:text-[14px]">
                    <option value="normal" selected>Normal — Standard investigation within 3 business days</option>
                    <option value="high">High — Active unauthorized access / possible card skimming</option>
                    <option value="critical">Critical — Immediate card cancellation / severe threat</option>
                  </select>
                  <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                </div>
              </div>

              <!-- Error Box -->
              <div id="ticket-error" class="hidden px-4 py-3 rounded-xl bg-error-container text-error font-body-sm text-[13px] flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px]">error</span>
                <span id="ticket-error-msg">Please select a reason for this ticket.</span>
              </div>

              <!-- Actions -->
              <div class="pt-2 flex flex-col sm:flex-row gap-3">
                <button type="button" onclick="Router.navigate('/dashboard')"
                  class="flex-1 py-3.5 rounded-xl border border-outline-variant/60 text-on-surface hover:bg-surface-container transition-colors font-headline-sm text-[14px] cursor-pointer">
                  Cancel
                </button>
                <button type="submit" id="btn-submit"
                  class="flex-2 py-3.5 px-8 rounded-xl bg-primary text-on-primary hover:bg-primary/90 transition-all font-headline-sm text-[14px] flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(84,63,213,0.25)] hover:shadow-[0_6px_16px_rgba(84,63,213,0.35)] hover:-translate-y-0.5 cursor-pointer">
                  <span class="material-symbols-outlined text-[18px]">send</span>
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
    return div;
  },

  afterRender: async () => {
    const form = document.getElementById('ticket-form');
    const btnSubmit = document.getElementById('btn-submit');
    const errorDiv = document.getElementById('ticket-error');
    const errorMsg = document.getElementById('ticket-error-msg');

    function showError(msg) {
      errorMsg.textContent = msg;
      errorDiv.classList.remove('hidden');
      errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorDiv.classList.add('hidden');

      const reasonSelect = document.getElementById('ticket-reason');
      const reason = reasonSelect ? reasonSelect.value : '';
      const selectedOptionText = reasonSelect && reasonSelect.selectedIndex >= 0 ? reasonSelect.options[reasonSelect.selectedIndex].text : '';
      const comments = document.getElementById('ticket-comments').value.trim();
      const urgency = document.getElementById('ticket-urgency').value;
      const contactPref = document.querySelector('input[name="contact-pref"]:checked')?.value || 'sms';
      const txId = document.getElementById('ticket-tx-id').value;
      const scenario = document.getElementById('ticket-scenario')?.value || 'GENERIC';

      if (!reason) {
        showError('Please select a specific reason for raising this ticket.');
        return;
      }

      const originalHTML = btnSubmit.innerHTML;
      btnSubmit.innerHTML = '<span class="material-symbols-outlined spinner align-middle text-[18px]">sync</span> Submitting...';
      btnSubmit.disabled = true;

      // Simulate network roundtrip
      await new Promise(r => setTimeout(r, 1200));

      const phone = localStorage.getItem('fs_active_phone') || '9988776655';
      const auth = typeof API !== 'undefined' && API.getAuth ? API.getAuth() : {};
      const activeUser = auth.user || {};

      // Unified comprehensive dictionary mapping all reason keys to human-readable summaries
      const reasonLabelMap = {
        // ATM
        atm_not_present: "Not present at ATM terminal",
        skimmer_cloned_card: "Suspected card skimming / cloned card",
        card_lost_stolen: "Physical debit card lost/stolen",
        atm_cash_dispense_error: "ATM cash dispense malfunction",
        unauthorized_pin_coercion: "Unauthorized PIN compromise",
        other_atm_issue: "Other ATM discrepancy",

        // Inbound Wire
        unrecognized_sender: "Unrecognized overseas sender",
        suspected_deposit_scam: "Suspected wire / mule scam",
        wrong_wire_amount: "Incorrect inbound wire amount",
        unauthorized_account_disclosure: "Unauthorized account sharing",
        unauthorized_inbound: "Unauthorized inbound transfer",
        other_wire_issue: "Other wire discrepancy",

        // Merchant
        unrecognized_merchant: "Unrecognized store / merchant",
        wrong_charge_amount: "Incorrect charge amount",
        duplicate_charge: "Duplicate charge",
        card_not_present_fraud: "Unauthorized online charge",
        unauthorized_upi: "Unauthorized UPI / QR scam",
        stolen_card_details: "Compromised card credentials",
        other_merchant_issue: "Other merchant dispute",

        // Domestic Transfer
        unauthorized_beneficiary: "Unauthorized beneficiary transfer",
        wrong_account_number: "Incorrect destination account",
        phishing_impostor_scam: "Impersonator / Phishing scam",
        compromised_netbanking: "Compromised NetBanking access",
        other_transfer_issue: "Other transfer dispute",

        // Fallbacks
        unauthorized: "Transaction not authorized",
        wrong_amount: "Wrong amount charged",
        stolen_card: "Card / credentials stolen",
        scam_fraud: "Suspected scam / fraud",
        other: "Other discrepancy"
      };

      const finalReasonLabel = reasonLabelMap[reason] || selectedOptionText || reason;
      const urgencyLabels = { normal: 'Normal', high: 'High', critical: 'Critical' };

      const ticketId = 'TKT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 5).toUpperCase();
      const now = new Date().toISOString();

      let storedTx = null;
      try {
        const raw = sessionStorage.getItem('current_alert_tx_data');
        if (raw) storedTx = JSON.parse(raw);
      } catch(e) {}

      const ticket = {
        id: ticketId,
        phone,
        userName: activeUser.name || (phone === '9988776655' ? 'Rajesh Sharma' : `User ${phone.slice(-4)}`),
        bank: activeUser.bank_name || 'Nagaland Regional Bank',
        txId: txId || null,
        txEntity: storedTx?.entity || storedTx?.merchant || (scenario === 'ATM_WITHDRAWAL' ? 'Late-Night ATM Cash Withdrawal' : 'Flagged Transaction'),
        txAmount: storedTx?.amount || (scenario === 'ATM_WITHDRAWAL' ? '-₹25,000.00' : null),
        fraudScenario: scenario,
        reason,
        reasonLabel: finalReasonLabel,
        comments,
        urgency,
        urgencyLabel: urgencyLabels[urgency] || urgency,
        contactPref,
        status: 'open',
        statusLabel: 'Open — Under Review',
        createdAt: now,
        updatedAt: now,
        timeline: [
          { 
            event: 'Ticket submitted', 
            timestamp: now, 
            note: `Dispute filed for ${finalReasonLabel}. Card protective hold confirmed active.` 
          }
        ]
      };

      const existing = JSON.parse(localStorage.getItem('fs_tickets') || '[]');
      existing.unshift(ticket);
      localStorage.setItem('fs_tickets', JSON.stringify(existing));

      // Sync to backend database for branch manager if API is online
      try {
        fetch('http://127.0.0.1:8001/manager/tickets/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ticket_id: ticket.id,
            user_phone: ticket.phone,
            user_name: ticket.userName,
            bank_id: activeUser.bank || 'bank_1',
            bank_name: ticket.bank,
            tx_id: ticket.txId,
            reason: ticket.reason,
            reason_label: ticket.reasonLabel,
            comments: ticket.comments,
            urgency: ticket.urgency,
            status: ticket.status,
            status_label: ticket.statusLabel,
            created_at: ticket.createdAt,
            updated_at: ticket.updatedAt,
            timeline_json: JSON.stringify(ticket.timeline)
          })
        }).catch(() => {});
      } catch (e) { /* silent fallback */ }

      // Clear the transaction session reference
      sessionStorage.removeItem('investigation_tx');

      // Success feedback
      btnSubmit.innerHTML = '<span class="material-symbols-outlined text-[18px]">check_circle</span> Submitted!';
      btnSubmit.classList.add('bg-emerald-600', 'hover:bg-emerald-700');
      btnSubmit.classList.remove('bg-primary', 'hover:bg-primary/90');

      setTimeout(() => {
        Router.navigate('/ticket-status');
      }, 800);
    });
  }
};
