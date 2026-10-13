/**
 * branch-verification.js — In-Person Branch Verification Safeguard
 * Displayed when an investigation ticket cannot be closed remotely.
 * Displays user's designated home branch details, token code, and documents.
 */

window.BranchVerificationPage = {
  protected: true,

  render: async () => {
    const phone = localStorage.getItem('fs_active_phone') || '';
    const accs = JSON.parse(localStorage.getItem('fs_accounts') || '{}');
    const user = accs[phone] || {};
    const bankName = user.bankDisplayName || user.bank || 'Nagaland Regional Bank';

    // Get ticket ID from URL query or session
    const urlParams = new URLSearchParams(window.location.search);
    const ticketId = urlParams.get('ticket') || sessionStorage.getItem('branch_ticket_id') || 'TKT-SEC-4821';

    // Bank specific branch data
    const branchInfoMap = {
      'Nagaland Regional Bank': {
        branchName: 'Kohima Main Banking Complex',
        address: '452 Financial Way, Sector 4, Kohima, Nagaland 797001',
        hours: 'Mon – Fri: 9:00 AM – 5:00 PM IST | Sat: 9:00 AM – 1:00 PM IST',
        phone: '1800-244-0199',
        officer: 'Institutional Fraud Safeguard Officer'
      },
      'Meghalaya Regional Bank': {
        branchName: 'Shillong Central Banking Circle',
        address: '78 Commercial Blvd, Police Bazar, Shillong, Meghalaya 793001',
        hours: 'Mon – Fri: 9:00 AM – 5:00 PM IST | Sat: 9:00 AM – 1:00 PM IST',
        phone: '1800-364-0188',
        officer: 'Senior Dispute Resolution Officer'
      },
      'UP Gramin Bank': {
        branchName: 'Lucknow Institutional Plaza',
        address: '12 Hazratganj Main Road, Lucknow, Uttar Pradesh 226001',
        hours: 'Mon – Fri: 9:00 AM – 5:00 PM IST | Sat: 9:00 AM – 1:00 PM IST',
        phone: '1800-522-0177',
        officer: 'Vigilance & Risk Desk Officer'
      }
    };

    const branch = branchInfoMap[bankName] || branchInfoMap['Nagaland Regional Bank'];
    const cleanId = ticketId.replace(/^TKT-|^SEC-/, '');
    const tokenRef = `#SEC-${cleanId || '4821-BR'}`;

    const div = document.createElement('div');
    div.className = "min-h-screen bg-surface flex flex-col p-4 md:p-8 relative page-enter";
    div.innerHTML = `
      <div class="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/8 via-surface to-surface -z-10"></div>

      <div class="w-full max-w-4xl mx-auto flex-1 flex flex-col pt-4 md:pt-6">
        <!-- Top Navigation -->
        <div class="flex items-center justify-between mb-6">
          <button onclick="Router.navigate('/ticket-status')" 
            class="inline-flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors font-body-sm text-[13px] cursor-pointer">
            <span class="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back to Investigation Tickets</span>
          </button>

          <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 font-label-mono-sm text-[11px] font-bold">
            <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>IN-PERSON SAFEGUARD REQUIRED</span>
          </div>
        </div>

        <!-- Hero Header -->
        <div class="text-center max-w-2xl mx-auto mb-8">
          <div class="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-700 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <span class="material-symbols-outlined text-[36px]">account_balance</span>
          </div>
          <h1 class="font-display-lg text-[26px] md:text-[32px] font-bold text-on-surface tracking-tight mb-2">
            Please Visit Your Home Branch
          </h1>
          <p class="font-body-md text-on-surface-variant text-[14px] leading-relaxed">
            For your institutional protection, this investigation safeguard cannot be closed remotely. Please visit your registered branch of account opening with <strong class="text-on-surface font-semibold">${bankName}</strong> to review details directly with an institutional officer.
          </p>
        </div>

        <!-- Main Card -->
        <div class="bg-surface-container-lowest rounded-[24px] border border-outline-variant/30 shadow-lg p-6 md:p-8 mb-6">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <!-- Left Column: Branch Details -->
            <div class="lg:col-span-7 space-y-5">
              <div class="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                <span class="font-label-mono-sm text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">Designated Home Branch</span>
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                  <span class="material-symbols-outlined text-[13px]">pin_drop</span>
                  Primary Banking Node
                </span>
              </div>

              <div>
                <h3 class="font-headline-sm text-[18px] text-on-surface font-bold mb-1">${branch.branchName}</h3>
                <p class="font-body-sm text-[13px] text-on-surface-variant flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[16px] text-primary">location_on</span>
                  ${branch.address}
                </p>
              </div>

              <!-- Counter Hours Box -->
              <div class="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/20 space-y-2">
                <div class="flex items-center gap-2 text-on-surface font-semibold text-[13px]">
                  <span class="material-symbols-outlined text-primary text-[18px]">schedule</span>
                  <span>Institutional Counter Hours</span>
                </div>
                <div class="text-[12px] text-on-surface-variant pl-6 space-y-0.5">
                  <p>${branch.hours}</p>
                  <p class="text-[11px] text-on-surface-variant/70">Desk: ${branch.officer}</p>
                </div>
              </div>

              <!-- Action Links -->
              <div class="flex flex-wrap items-center gap-3 pt-2">
                <button onclick="window.BranchVerificationPage._openDirections('${encodeURIComponent(branch.address)}')"
                  class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-headline-sm text-[13px] transition-colors cursor-pointer shadow-sm">
                  <span class="material-symbols-outlined text-[18px] text-primary">directions</span>
                  Get Directions
                </button>
                <button onclick="window.BranchVerificationPage._scheduleAppointment()"
                  class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-headline-sm text-[13px] hover:bg-primary/90 transition-all cursor-pointer shadow-[0_4px_12px_rgba(84,63,213,0.25)]">
                  <span class="material-symbols-outlined text-[18px]">calendar_month</span>
                  Schedule Officer Appointment
                </button>
              </div>
            </div>

            <!-- Right Column: Verification Token & Required Documents -->
            <div class="lg:col-span-5 space-y-5">
              <!-- Token Box -->
              <div class="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/30">
                <span class="block font-label-mono-sm text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-2">
                  Officer Verification Token
                </span>
                <div class="flex items-center justify-between bg-surface-container-lowest rounded-xl px-4 py-2.5 border border-outline-variant/40">
                  <span class="font-mono text-[14px] font-bold text-primary tracking-wider" id="refTokenText">${tokenRef}</span>
                  <button id="btnCopyToken" onclick="window.BranchVerificationPage._copyToken('${tokenRef}')"
                    class="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors cursor-pointer px-2 py-1 rounded">
                    COPY
                  </button>
                </div>
                <p class="text-[11px] text-on-surface-variant/80 mt-2">
                  Present this token code upon check-in with the branch dispute officer.
                </p>
              </div>

              <!-- Required In-Person Documents -->
              <div>
                <span class="block font-label-mono-sm text-[11px] uppercase tracking-wider text-on-surface font-bold mb-3">
                  Required In-Person Documents
                </span>
                <div class="space-y-2.5">
                  <div class="flex items-start gap-3 p-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/20">
                    <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <span class="material-symbols-outlined text-[18px]">badge</span>
                    </div>
                    <div>
                      <p class="font-body-sm text-[13px] text-on-surface font-semibold">Government Photo ID</p>
                      <p class="font-body-sm text-[11px] text-on-surface-variant">Aadhaar Card, PAN Card, or Passport</p>
                    </div>
                  </div>

                  <div class="flex items-start gap-3 p-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/20">
                    <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <span class="material-symbols-outlined text-[18px]">credit_card</span>
                    </div>
                    <div>
                      <p class="font-body-sm text-[13px] text-on-surface font-semibold">Physical Device or Card</p>
                      <p class="font-body-sm text-[11px] text-on-surface-variant">Associated debit card or registered mobile device</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- Bottom Notice -->
          <div class="mt-8 pt-5 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-low/50 rounded-2xl p-4">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-primary text-[22px]">shield_check</span>
              <p class="text-[12px] text-on-surface">
                <strong>Account Protection Guarantee:</strong> Your deposits and core balances remain fully secure and insured under RBI guidelines.
              </p>
            </div>
            <div class="shrink-0 text-[12px] text-on-surface-variant">
              <span>Helpline: </span>
              <a href="tel:${branch.phone}" class="text-primary font-bold hover:underline">${branch.phone}</a>
            </div>
          </div>
        </div>

        <!-- Demo Officer Clearance Tool -->
        <div class="bg-surface-container-low border border-primary/20 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 text-primary font-semibold text-[13px] mb-1">
              <span class="material-symbols-outlined text-[18px]">science</span>
              <span>Demo Simulation: Officer Desk Counter Clearance</span>
            </div>
            <p class="text-[12px] text-on-surface-variant">
              Simulate an in-person physical identity check completed by the branch officer to resolve this ticket.
            </p>
          </div>
          <button onclick="window.BranchVerificationPage._simulateOfficerClearance('${ticketId}')"
            class="shrink-0 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-headline-sm text-[13px] font-semibold transition-all shadow-sm cursor-pointer flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">verified</span>
            Mark Cleared by Branch
          </button>
        </div>

      </div>
    `;
    return div;
  },

  _copyToken(token) {
    navigator.clipboard.writeText(token);
    const btn = document.getElementById('btnCopyToken');
    if (btn) {
      btn.textContent = 'COPIED!';
      btn.classList.add('text-emerald-600');
      setTimeout(() => {
        btn.textContent = 'COPY';
        btn.classList.remove('text-emerald-600');
      }, 2000);
    }
  },

  _openDirections(address) {
    window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
  },

  _scheduleAppointment() {
    alert("Appointment scheduled! A calendar confirmation and SMS reminder have been sent to your registered phone.");
  },

  _simulateOfficerClearance(ticketId) {
    const all = JSON.parse(localStorage.getItem('fs_tickets') || '[]');
    const idx = all.findIndex(t => t.id === ticketId);
    const now = new Date().toISOString();

    if (idx !== -1) {
      all[idx].status = 'resolved';
      all[idx].statusLabel = 'Resolved & Cleared via Branch Verification';
      all[idx].updatedAt = now;
      all[idx].timeline.unshift({
        event: 'In-Person Branch Verification Completed',
        timestamp: now,
        note: 'Customer presented Government Photo ID at home branch. Officer cleared dispute safeguard and lifted hold.'
      });
      localStorage.setItem('fs_tickets', JSON.stringify(all));
    }

    alert('In-person verification verified successfully! Safeguard lifted and ticket marked as Resolved.');
    Router.navigate('/ticket-status');
  }
};
