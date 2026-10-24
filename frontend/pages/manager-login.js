/**
 * manager-login.js — Manager Portal Authentication
 * Separate login flow for bank branch managers with offline fallback.
 */

window.ManagerLoginPage = {
  protected: false,

  render: async () => {
    const div = document.createElement('div');
    div.className = "min-h-screen bg-surface flex flex-col relative page-enter";
    div.innerHTML = `
      <!-- Background gradient -->
      <div class="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-inverse-surface/15 via-surface to-surface -z-10"></div>

      <!-- Top Accent Bar -->
      <div class="w-full h-2 bg-gradient-to-r from-primary via-amber-500 to-tertiary"></div>

      <!-- Header -->
      <div class="w-full px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-[28px]">shield</span>
          <span class="font-display-lg text-[18px] font-bold text-on-surface tracking-tight">FEDERATED SENTINEL</span>
        </div>
        <a href="/login" data-path="/login" onclick="event.preventDefault(); Router.navigate('/login');" 
          class="text-[12px] text-primary font-semibold hover:underline cursor-pointer flex items-center gap-1">
          <span class="material-symbols-outlined text-[16px]">person</span>
          Client Login
        </a>
      </div>

      <!-- Centered Card -->
      <div class="flex-1 flex items-center justify-center px-4 pb-16">
        <div class="w-full max-w-md">
          <div class="bg-surface-container-lowest rounded-[24px] border border-outline-variant/40 shadow-[0_20px_60px_rgba(0,0,0,0.12)] overflow-hidden">
            
            <!-- Card Header -->
            <div class="bg-inverse-surface px-7 py-6 text-center">
              <div class="flex items-center justify-center gap-2 mb-2">
                <span class="material-symbols-outlined text-inverse-primary text-[32px]">admin_panel_settings</span>
              </div>
              <h1 class="font-display-lg text-[24px] font-bold text-white tracking-tight">Manager Portal</h1>
              <p class="font-body-sm text-[13px] text-white/60 mt-1">Branch Operations Access</p>
              <div class="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40">
                <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span class="text-[10px] font-bold uppercase tracking-wider text-amber-300">Restricted Access</span>
              </div>
            </div>

            <!-- Form -->
            <div class="px-7 py-7">
              <!-- Error -->
              <div id="mgrLoginError" class="hidden mb-4 p-3 rounded-xl bg-error/10 border border-error/20 text-error text-[13px] font-medium flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px]">error</span>
                <span id="mgrLoginErrorText">Invalid Manager ID or PIN</span>
              </div>

              <!-- Manager ID -->
              <div class="mb-4">
                <label class="block font-label-mono-sm text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1.5">Manager ID</label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px]">badge</span>
                  <input id="mgrId" type="text" placeholder="e.g. MGR-NRB-001"
                    class="w-full pl-11 pr-4 py-3 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface font-body-sm text-[14px] placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition-all"
                    autocomplete="off" spellcheck="false" />
                </div>
              </div>

              <!-- Bank Selector -->
              <div class="mb-4">
                <label class="block font-label-mono-sm text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1.5">Bank Node</label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px]">account_balance</span>
                  <select id="mgrBank"
                    class="w-full pl-11 pr-4 py-3 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface font-body-sm text-[14px] focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition-all appearance-none cursor-pointer">
                    <option value="">Select Bank</option>
                    <option value="bank_1">Nagaland Regional Bank</option>
                    <option value="bank_2">Meghalaya Regional Bank</option>
                    <option value="bank_3">UP Gramin Bank</option>
                  </select>
                </div>
              </div>

              <!-- MPIN -->
              <div class="mb-6">
                <label class="block font-label-mono-sm text-[10px] uppercase tracking-wider text-on-surface-variant font-bold mb-1.5">6-Digit MPIN</label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px]">lock</span>
                  <input id="mgrPin" type="password" maxlength="6" placeholder="••••••"
                    class="w-full pl-11 pr-4 py-3 rounded-xl border border-outline-variant/50 bg-surface-container-low text-on-surface font-label-mono-lg text-[22px] text-center tracking-[0.6em] placeholder:text-on-surface-variant/30 placeholder:tracking-[0.3em] placeholder:text-[16px] focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition-all"
                    autocomplete="off" />
                </div>
              </div>

              <!-- Submit -->
              <button id="mgrLoginBtn" onclick="window.ManagerLoginPage._handleLogin()"
                class="w-full py-3.5 rounded-xl bg-primary text-on-primary font-headline-sm text-[14px] font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-[0_4px_16px_rgba(84,63,213,0.3)] hover:shadow-[0_6px_20px_rgba(84,63,213,0.4)] hover:-translate-y-0.5 cursor-pointer">
                <span>Access Manager Portal</span>
                <span class="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>

            <!-- Footer -->
            <div class="px-7 pb-6 text-center">
              <div class="flex items-center justify-center gap-2 text-on-surface-variant/60 text-[11px] font-label-mono-sm">
                <span class="material-symbols-outlined text-[14px]">verified_user</span>
                <span>AES-256 Encrypted Session · Role-Based Access Control</span>
              </div>
            </div>
          </div>

          <!-- Demo Credentials Hint -->
          <div class="mt-4 p-3.5 rounded-xl bg-surface-container/80 border border-outline-variant/25 text-center">
            <span class="font-label-mono-sm text-[10px] text-on-surface-variant/70 uppercase tracking-wider font-bold">Demo Credentials</span>
            <div class="mt-1.5 font-body-sm text-[12px] text-on-surface-variant leading-relaxed">
              <code class="font-label-mono-md text-[11px] text-primary">MGR-NRB-001</code> · Bank 1 · PIN: <code class="font-label-mono-md text-[11px]">112233</code>
            </div>
          </div>
        </div>
      </div>
    `;
    return div;
  },

  afterRender: async () => {
    // Auto-focus manager ID
    const idInput = document.getElementById('mgrId');
    if (idInput) setTimeout(() => idInput.focus(), 150);

    // Enter key submits
    ['mgrId', 'mgrBank', 'mgrPin'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') window.ManagerLoginPage._handleLogin();
      });
    });
  },

  async _handleLogin() {
    const managerId = (document.getElementById('mgrId')?.value || '').trim().toUpperCase();
    const bankId = document.getElementById('mgrBank')?.value || '';
    const pin = (document.getElementById('mgrPin')?.value || '').trim();
    const errEl = document.getElementById('mgrLoginError');
    const errText = document.getElementById('mgrLoginErrorText');
    const btn = document.getElementById('mgrLoginBtn');

    // Hide previous error
    if (errEl) errEl.classList.add('hidden');

    // Validate
    if (!managerId) return _showErr('Please enter your Manager ID.');
    if (!bankId) return _showErr('Please select your bank node.');
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) return _showErr('MPIN must be exactly 6 digits.');

    // Disable button
    if (btn) { btn.disabled = true; btn.innerHTML = '<span class="material-symbols-outlined text-[20px] animate-spin">progress_activity</span> Authenticating...'; }

    // Try API first
    try {
      const resp = await fetch('http://127.0.0.1:8001/manager/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manager_id: managerId, pin })
      });
      if (resp.ok) {
        const data = await resp.json();
        localStorage.setItem('fs_manager_token', data.token);
        localStorage.setItem('fs_manager_info', JSON.stringify(data.manager));
        Router.navigate('/manager');
        return;
      } else {
        const errData = await resp.json().catch(() => ({}));
        _showErr(errData.detail || 'Invalid Manager ID or PIN.');
        _resetBtn();
        return;
      }
    } catch (networkErr) {
      // API unreachable — try offline fallback
      console.warn('Manager API unreachable, trying offline fallback...');
    }

    // Offline fallback credentials
    const OFFLINE_CREDS = {
      'MGR-NRB-001': { bank_id: 'bank_1', pin: '112233', name: 'Anurag Kapoor', bank_name: 'Nagaland Regional Bank' },
      'MGR-MRB-001': { bank_id: 'bank_2', pin: '223344', name: 'Priya Deshpande', bank_name: 'Meghalaya Regional Bank' },
      'MGR-UPG-001': { bank_id: 'bank_3', pin: '334455', name: 'Suresh Yadav', bank_name: 'UP Gramin Bank' },
    };

    const cred = OFFLINE_CREDS[managerId];
    if (cred && cred.bank_id === bankId && cred.pin === pin) {
      const token = `tok_manager_${bankId}`;
      const manager = { manager_id: managerId, bank_id: bankId, bank_name: cred.bank_name, name: cred.name };
      localStorage.setItem('fs_manager_token', token);
      localStorage.setItem('fs_manager_info', JSON.stringify(manager));
      Router.navigate('/manager');
      return;
    }

    _showErr('Invalid Manager ID or PIN. Please try again.');
    _resetBtn();

    function _showErr(msg) {
      if (errEl && errText) { errText.textContent = msg; errEl.classList.remove('hidden'); }
    }
    function _resetBtn() {
      if (btn) { btn.disabled = false; btn.innerHTML = '<span>Access Manager Portal</span><span class="material-symbols-outlined text-[20px]">arrow_forward</span>'; }
    }
  }
};
