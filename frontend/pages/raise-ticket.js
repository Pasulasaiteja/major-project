/**
 * raise-ticket.js — Raise a Fraud Investigation Ticket
 * Saves submitted tickets to localStorage (fs_tickets) for status tracking.
 */

window.RaiseTicketPage = {
  protected: true,
  render: async () => {
    // Pre-populate transaction context if navigated from hold-reason
    const txId = sessionStorage.getItem('investigation_tx') || null;
    let txInfo = null;
    let alertInfo = null;
    try {
      const accs = JSON.parse(localStorage.getItem('fs_accounts') || '{}');
      const phone = localStorage.getItem('fs_active_phone');
      const txListRaw = localStorage.getItem(`fs_txns_${phone}`) || '[]';
      const txList = JSON.parse(txListRaw);
      txInfo = txList.find(t => t.id === txId) || null;
    } catch (e) { /* silent */ }

    const txRef = txId ? txId.slice(-8).toUpperCase() : null;
    const txMerchant = txInfo ? (txInfo.entity || txInfo.merchant || 'Unknown Merchant') : null;
    const txAmt = txInfo ? `₹${Number(txInfo.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : null;

    const div = document.createElement('div');
    div.className = "min-h-screen bg-surface flex flex-col p-4 md:p-8 relative page-enter";
    div.innerHTML = `
      <div class="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/8 via-surface to-surface -z-10"></div>

      <div class="w-full max-w-2xl mx-auto flex-1 flex flex-col pt-8">
        <!-- Header -->
        <div class="flex items-center gap-3 mb-8">
          <button onclick="window.history.back()" class="p-2 rounded-full hover:bg-surface-container transition-colors" title="Go Back">
            <span class="material-symbols-outlined text-on-surface-variant">arrow_back</span>
          </button>
          <div class="flex-1 min-w-0">
            <h1 class="font-display-lg text-[28px] md:text-[32px] text-on-surface leading-none">Raise Investigation Ticket</h1>
            <p class="font-body-sm text-on-surface-variant mt-1">Our specialists will investigate within 2–3 business days.</p>
          </div>
          <a href="#" onclick="Router.navigate('/ticket-status'); return false;"
            class="shrink-0 inline-flex items-center gap-1.5 text-[12px] font-semibold text-primary border border-primary/30 px-3 py-1.5 rounded-full hover:bg-primary/5 transition-colors cursor-pointer">
            <span class="material-symbols-outlined text-[15px]">receipt_long</span>
            My Tickets
          </a>
        </div>

        <div class="bg-surface-container-lowest rounded-[24px] shadow-[0_8px_30px_rgba(45,42,58,0.04)] border border-outline-variant/30 overflow-hidden">
          
          ${txRef ? `
          <!-- Transaction Context Banner -->
          <div class="flex items-center gap-4 px-6 md:px-8 py-4 bg-surface-container-low border-b border-outline-variant/30">
            <div class="w-10 h-10 rounded-xl bg-error/10 text-error flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-[20px]">shield_locked</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-label-mono-sm text-[10px] uppercase tracking-wider text-on-surface-variant mb-0.5">Flagged Transaction</div>
              <div class="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                <span class="font-headline-sm text-[14px] font-bold text-on-surface truncate">${txMerchant || 'Unknown Merchant'}</span>
                ${txAmt ? `<span class="font-label-mono-md text-error font-bold">${txAmt}</span>` : ''}
              </div>
              <div class="font-body-sm text-[11px] text-on-surface-variant font-mono">Ref: #${txRef}</div>
            </div>
            <span class="shrink-0 px-2 py-1 rounded-lg bg-error/10 text-error text-[11px] font-semibold font-label-mono-sm">Hold Active</span>
          </div>
          ` : ''}

          <div class="p-6 md:p-8">
            <form id="ticket-form" class="space-y-6">
              <!-- Hidden: transaction reference -->
              <input type="hidden" id="ticket-tx-id" value="${txId || ''}">

              <!-- Reason -->
              <div>
                <label class="block font-label-mono-sm text-[11px] uppercase tracking-wider text-on-surface-variant mb-2">Reason for Ticket <span class="text-error">*</span></label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">help</span>
                  <select id="ticket-reason" required
                    class="w-full pl-12 pr-10 h-12 rounded-xl border border-outline-variant/50 bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary appearance-none cursor-pointer font-body-md transition-all">
                    <option value="">— Select a reason —</option>
                    <option value="unrecognized_merchant">I don't recognize this merchant</option>
                    <option value="wrong_amount">I recognize the merchant, but not the amount</option>
                    <option value="unauthorized">I did not authorize any transaction</option>
                    <option value="stolen_card">My card / credentials may have been stolen</option>
                    <option value="other">Other</option>
                  </select>
                  <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                </div>
              </div>

              <!-- Additional Details -->
              <div>
                <label class="block font-label-mono-sm text-[11px] uppercase tracking-wider text-on-surface-variant mb-2">Additional Comments <span class="text-on-surface-variant/50">(Optional)</span></label>
                <textarea id="ticket-comments" rows="4"
                  class="w-full p-4 rounded-xl border border-outline-variant/50 bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-body-md resize-none transition-all"
                  placeholder="Provide any additional context — location you were at, expected amount, etc."></textarea>
              </div>

              <!-- Contact Preference -->
              <div>
                <label class="block font-label-mono-sm text-[11px] uppercase tracking-wider text-on-surface-variant mb-3">Contact Preference</label>
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

              <!-- Urgency -->
              <div>
                <label class="block font-label-mono-sm text-[11px] uppercase tracking-wider text-on-surface-variant mb-2">Urgency Level</label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">priority_high</span>
                  <select id="ticket-urgency"
                    class="w-full pl-12 pr-10 h-12 rounded-xl border border-outline-variant/50 bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary appearance-none cursor-pointer font-body-md transition-all">
                    <option value="normal" selected>Normal — Investigate within 3 business days</option>
                    <option value="high">High — I believe fraud is actively occurring</option>
                    <option value="critical">Critical — Large sum / potential identity theft</option>
                  </select>
                  <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                </div>
              </div>

              <!-- Error -->
              <div id="ticket-error" class="hidden px-4 py-3 rounded-xl bg-error-container text-error font-body-sm text-[13px] flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px]">error</span>
                <span id="ticket-error-msg">Please fill in all required fields.</span>
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

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorDiv.classList.add('hidden');

      const reason = document.getElementById('ticket-reason').value;
      const comments = document.getElementById('ticket-comments').value.trim();
      const urgency = document.getElementById('ticket-urgency').value;
      const contactPref = document.querySelector('input[name="contact-pref"]:checked')?.value || 'sms';
      const txId = document.getElementById('ticket-tx-id').value;

      if (!reason) {
        showError('Please select a reason for raising this ticket.');
        return;
      }

      const originalHTML = btnSubmit.innerHTML;
      btnSubmit.innerHTML = '<span class="material-symbols-outlined spinner align-middle text-[18px]">sync</span> Submitting...';
      btnSubmit.disabled = true;

      // Simulate network delay
      await new Promise(r => setTimeout(r, 1400));

      // Build ticket object and save to localStorage
      const phone = localStorage.getItem('fs_active_phone') || 'unknown';
      const accs = JSON.parse(localStorage.getItem('fs_accounts') || '{}');
      const user = accs[phone] || {};

      const reasonLabels = {
        unrecognized_merchant: "Don't recognize merchant",
        wrong_amount: "Wrong amount charged",
        unauthorized: "Transaction not authorized",
        stolen_card: "Card / credentials stolen",
        other: "Other"
      };
      const urgencyLabels = { normal: 'Normal', high: 'High', critical: 'Critical' };

      const ticketId = 'TKT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 5).toUpperCase();
      const now = new Date().toISOString();

      const ticket = {
        id: ticketId,
        phone,
        userName: user.name || `User ${phone.slice(-4)}`,
        bank: user.bankDisplayName || user.bank || 'Nagaland Regional Bank',
        txId: txId || null,
        reason,
        reasonLabel: reasonLabels[reason] || reason,
        comments,
        urgency,
        urgencyLabel: urgencyLabels[urgency] || urgency,
        contactPref,
        status: 'open',
        statusLabel: 'Open — Under Review',
        createdAt: now,
        updatedAt: now,
        timeline: [
          { event: 'Ticket submitted', timestamp: now, note: 'Your investigation request has been received and queued.' }
        ]
      };

      const existing = JSON.parse(localStorage.getItem('fs_tickets') || '[]');
      existing.unshift(ticket);
      localStorage.setItem('fs_tickets', JSON.stringify(existing));

      // Clear the transaction session reference
      sessionStorage.removeItem('investigation_tx');

      // Show success state
      btnSubmit.innerHTML = '<span class="material-symbols-outlined text-[18px]">check_circle</span> Submitted!';
      btnSubmit.classList.add('bg-emerald-600', 'hover:bg-emerald-700');
      btnSubmit.classList.remove('bg-primary', 'hover:bg-primary/90');

      setTimeout(() => {
        Router.navigate('/ticket-status');
      }, 900);
    });
  }
};
