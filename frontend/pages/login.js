/**
 * login.js — Login Page for Federated Sentinel
 * Supports saved profile MPIN authentication, seamless account switching modal,
 * and direct phone number login.
 */

window.LoginPage = {
  protected: false,
  render: async () => {
    const manualMode = sessionStorage.getItem('fs_login_mode') === 'manual';
    let activePhone = localStorage.getItem('fs_active_phone');
    
    // Load accounts from localStorage
    let existingAccounts = {};
    try {
      existingAccounts = JSON.parse(localStorage.getItem('fs_accounts') || '{}');
    } catch (e) {
      existingAccounts = {};
    }

    // Default known accounts if empty
    if (Object.keys(existingAccounts).length === 0) {
      existingAccounts['9874561230'] = {
        phone: '9874561230',
        name: 'User 1230',
        bank: 'bank_1',
        bankDisplayName: 'Nagaland Regional Bank',
        pin: '4444'
      };
      existingAccounts['9988776655'] = {
        phone: '9988776655',
        name: 'Rajesh Sharma',
        bank: 'bank_1',
        bankDisplayName: 'Nagaland Regional Bank',
        pin: '4321'
      };
      localStorage.setItem('fs_accounts', JSON.stringify(existingAccounts));
    }

    // Migrate: ensure all accounts have bankDisplayName (backfill from bank ID)
    const bankIdToName = { 'bank_1': 'Nagaland Regional Bank', 'bank_2': 'Meghalaya Regional Bank', 'bank_3': 'UP Gramin Bank' };
    let migrated = false;
    Object.values(existingAccounts).forEach(acc => {
      if (!acc.bankDisplayName) {
        // If bank is an ID like "bank_1", resolve it; otherwise use the raw value as display name
        acc.bankDisplayName = bankIdToName[acc.bank] || acc.bank || 'Nagaland Regional Bank';
        migrated = true;
      }
    });
    if (migrated) localStorage.setItem('fs_accounts', JSON.stringify(existingAccounts));

    // If no active phone is set, pick the first saved account
    if (!activePhone && Object.keys(existingAccounts).length > 0) {
      activePhone = Object.keys(existingAccounts)[0];
      localStorage.setItem('fs_active_phone', activePhone);
    }

    // Determine if we should show the saved user MPIN screen or the manual phone login
    const savedUser = (!manualMode && activePhone && existingAccounts[activePhone]) ? existingAccounts[activePhone] : null;
    const hasSavedUser = !!savedUser;

    const div = document.createElement('div');
    div.className = "min-h-screen bg-surface flex flex-col items-center justify-center p-4 relative overflow-hidden page-enter";
    
    let innerHTML = `
      <!-- Background Elements -->
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface-container-high/40 via-surface to-surface -z-10"></div>
      <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary-container to-secondary opacity-80"></div>
      
      <!-- Top Branding -->
      <div class="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-space-xs">
        <div class="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center shadow-sm">
          <span class="material-symbols-outlined text-primary text-[18px]">policy</span>
        </div>
        <span class="font-headline-sm text-headline-sm text-on-surface tracking-tight leading-none">FEDERATED SENTINEL</span>
      </div>

      <div class="w-full max-w-[430px] bg-surface-container-lowest rounded-[24px] shadow-[0_8px_30px_rgba(45,42,58,0.06)] border border-outline-variant/30 p-8 md:p-10 relative">
        <div class="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-primary/5 rounded-full blur-2xl"></div>
    `;

    if (hasSavedUser && savedUser) {
        const initials = (savedUser.name || 'User').split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
        const masked = (savedUser.phone || '').slice(-4) || 'XXXX';

        innerHTML += `
        <div class="text-center mb-7 relative z-10">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed font-label-mono-sm text-label-mono-sm uppercase font-semibold tracking-wider mb-4">
            <span class="w-1.5 h-1.5 rounded-full bg-primary pulse-dot"></span>
            Welcome Back
          </div>
          <h1 class="font-display-lg text-[28px] leading-tight text-on-surface mb-2 font-normal">Enter MPIN</h1>
          <p class="font-body-sm text-body-sm text-on-surface-variant">Sign in securely using your 4-digit PIN.</p>
        </div>

        <!-- User Identity Card with Change User Button -->
        <div class="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 mb-7 shadow-sm">
          <div class="flex items-center gap-3 min-w-0 pr-2">
            <div class="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm font-semibold">
              <span class="font-headline-sm text-[15px] leading-none">${initials}</span>
            </div>
            <div class="flex flex-col text-left truncate">
              <span class="font-label-mono-md text-label-mono-md font-bold text-on-surface truncate" title="${savedUser.name}">${savedUser.name}</span>
              <span class="font-body-sm text-[12px] text-on-surface-variant">Account &bull;&bull;${masked}</span>
              <span class="font-body-sm text-[11px] text-on-surface-variant/70 flex items-center gap-1 mt-0.5">
                <span class="material-symbols-outlined text-[12px]">account_balance</span>
                <span>${savedUser.bankDisplayName || savedUser.bank || 'Nagaland Regional Bank'}</span>
              </span>
            </div>
          </div>
          <button type="button" id="changeUserBtn" class="shrink-0 text-[12px] font-label-mono-sm font-semibold text-primary hover:text-on-primary hover:bg-primary px-3 py-1.5 rounded-lg border border-primary/30 transition-all flex items-center gap-1 cursor-pointer shadow-sm">
            <span>Change User</span>
            <span class="material-symbols-outlined text-[15px]">swap_horiz</span>
          </button>
        </div>

        <form id="loginForm" class="space-y-6">
          <input type="hidden" id="accountNumber" value="${savedUser.phone}">
          <div class="space-y-4">
            <div class="flex justify-between items-center px-1">
              <label class="font-label-mono-sm text-label-mono-sm text-on-surface uppercase tracking-wider font-bold">Secure MPIN</label>
              <a href="#" onclick="alert('Default demo MPINs: User 1230 is 4444, Rajesh Sharma is 4321.'); return false;" class="font-label-mono-sm text-label-mono-sm text-primary hover:underline transition-colors">Forgot?</a>
            </div>
            
            <div class="flex justify-between gap-3 sm:gap-4" id="pinContainer">
              <input type="password" maxlength="1" class="pin-box w-12 h-14 sm:w-14 sm:h-16 text-center font-display-lg text-[24px] bg-surface-container rounded-xl border border-outline-variant/50 text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all" autocomplete="off" inputmode="numeric">
              <input type="password" maxlength="1" class="pin-box w-12 h-14 sm:w-14 sm:h-16 text-center font-display-lg text-[24px] bg-surface-container rounded-xl border border-outline-variant/50 text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all" autocomplete="off" inputmode="numeric">
              <input type="password" maxlength="1" class="pin-box w-12 h-14 sm:w-14 sm:h-16 text-center font-display-lg text-[24px] bg-surface-container rounded-xl border border-outline-variant/50 text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all" autocomplete="off" inputmode="numeric">
              <input type="password" maxlength="1" class="pin-box w-12 h-14 sm:w-14 sm:h-16 text-center font-display-lg text-[24px] bg-surface-container rounded-xl border border-outline-variant/50 text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all" autocomplete="off" inputmode="numeric">
            </div>
            <div id="loginError" class="text-error font-body-sm text-[12px] h-4 mt-2 hidden text-center"></div>
          </div>

          <button type="submit" class="w-full py-4 rounded-xl bg-primary text-on-primary font-body-md text-body-md font-semibold shadow-[0_4px_12px_rgba(84,63,213,0.24)] hover:bg-primary-container hover:shadow-[0_6px_16px_rgba(84,63,213,0.32)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 btn-sheen group cursor-pointer">
            <span>Unlock Dashboard</span>
            <span class="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="font-body-sm text-[13px] text-on-surface-variant">
            Don't have an account? 
            <a href="#" onclick="Router.navigate('/register'); return false;" class="text-primary font-semibold hover:underline">Create Account</a>
          </p>
        </div>
        `;
    } else {
        // Render phone number input login form
        const hasAnySaved = Object.keys(existingAccounts).length > 0;
        const firstAccount = hasAnySaved ? Object.values(existingAccounts)[0] : null;

        innerHTML += `
        ${hasAnySaved && firstAccount ? `
        <div class="mb-4 text-left">
          <button type="button" id="backToSavedUserBtn" class="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-full transition-all cursor-pointer border border-primary/20">
            <span class="material-symbols-outlined text-[15px]">arrow_back</span>
            <span>Back to saved profile (${firstAccount.name})</span>
          </button>
        </div>` : ''}

        <div class="text-center mb-8 relative z-10">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed font-label-mono-sm text-label-mono-sm uppercase font-semibold tracking-wider mb-5">
            <span class="w-1.5 h-1.5 rounded-full bg-primary pulse-dot"></span>
            Welcome
          </div>
          <h1 class="font-display-lg text-[28px] leading-tight text-on-surface mb-2 font-normal">Login</h1>
          <p class="font-body-sm text-body-sm text-on-surface-variant">Sign in securely using your phone number & MPIN.</p>
        </div>

        <form id="loginForm" class="space-y-6">
          <div class="flex flex-col text-left">
            <label class="font-label-mono-sm text-label-mono-sm text-on-surface uppercase tracking-wider font-bold mb-1.5">Phone Number</label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">call</span>
              <input type="tel" id="accountNumber" required maxlength="10" pattern="[0-9]{10}" class="w-full h-12 pl-11 pr-4 bg-surface-container rounded-xl border border-outline-variant/50 text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all font-body-md" placeholder="10-digit mobile number">
            </div>
          </div>
          
          <div class="space-y-4">
            <div class="flex justify-between items-center px-1">
              <label class="font-label-mono-sm text-label-mono-sm text-on-surface uppercase tracking-wider font-bold">Secure MPIN</label>
            </div>
            
            <div class="flex justify-between gap-3 sm:gap-4" id="pinContainer">
              <input type="password" maxlength="1" class="pin-box w-12 h-14 sm:w-14 sm:h-16 text-center font-display-lg text-[24px] bg-surface-container rounded-xl border border-outline-variant/50 text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all" autocomplete="off" inputmode="numeric">
              <input type="password" maxlength="1" class="pin-box w-12 h-14 sm:w-14 sm:h-16 text-center font-display-lg text-[24px] bg-surface-container rounded-xl border border-outline-variant/50 text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all" autocomplete="off" inputmode="numeric">
              <input type="password" maxlength="1" class="pin-box w-12 h-14 sm:w-14 sm:h-16 text-center font-display-lg text-[24px] bg-surface-container rounded-xl border border-outline-variant/50 text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all" autocomplete="off" inputmode="numeric">
              <input type="password" maxlength="1" class="pin-box w-12 h-14 sm:w-14 sm:h-16 text-center font-display-lg text-[24px] bg-surface-container rounded-xl border border-outline-variant/50 text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all" autocomplete="off" inputmode="numeric">
            </div>
            <div id="loginError" class="text-error font-body-sm text-[12px] h-4 mt-2 hidden text-center"></div>
          </div>

          <button type="submit" class="w-full py-4 rounded-xl bg-primary text-on-primary font-body-md text-body-md font-semibold shadow-[0_4px_12px_rgba(84,63,213,0.24)] hover:bg-primary-container hover:shadow-[0_6px_16px_rgba(84,63,213,0.32)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 btn-sheen group cursor-pointer">
            <span>Login</span>
            <span class="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="font-body-sm text-[13px] text-on-surface-variant">
            Don't have an account? 
            <a href="#" onclick="Router.navigate('/register'); return false;" class="text-primary font-semibold hover:underline">Create Account</a>
          </p>
        </div>
        `;
    }

    innerHTML += `
        <div class="mt-8 pt-5 border-t border-outline-variant/30 flex flex-col items-center gap-3">
          <a href="/manager-login" data-path="/manager-login" onclick="event.preventDefault(); Router.navigate('/manager-login');" 
            class="text-[12px] text-on-surface-variant hover:text-primary transition-colors font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-surface-container">
            <span class="material-symbols-outlined text-[16px] text-amber-500">admin_panel_settings</span>
            <span>Bank Manager Portal Access</span>
            <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
          </a>
          <div class="flex items-center justify-center gap-2 text-on-surface-variant font-label-mono-sm text-[10px] uppercase">
            <span class="material-symbols-outlined text-[14px]">lock</span>
            <span>End-to-End Encrypted via Federated Sentinel</span>
          </div>
        </div>
      </div>

      <!-- Switch Account Modal Dialog -->
      <div id="switchUserModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm hidden opacity-0 transition-opacity duration-200">
        <div class="w-full max-w-[420px] bg-surface-container-lowest rounded-[24px] p-6 sm:p-7 shadow-2xl border border-outline-variant/40 relative transform scale-95 transition-all duration-200" id="switchUserModalCard">
          <!-- Modal Header -->
          <div class="flex items-center justify-between pb-3.5 border-b border-outline-variant/30 mb-4">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span class="material-symbols-outlined text-[18px]">switch_account</span>
              </div>
              <div class="text-left">
                <h3 class="font-headline-sm text-[18px] text-on-surface font-semibold leading-tight">Switch User</h3>
                <p class="font-body-sm text-[11px] text-on-surface-variant">Choose a profile or use another phone number</p>
              </div>
            </div>
            <button type="button" id="closeSwitchModalBtn" class="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <!-- Saved Accounts List -->
          <div class="space-y-2.5 max-h-60 overflow-y-auto pr-1 mb-5" id="savedAccountsList">
            <!-- Dynamically populated in afterRender -->
          </div>

          <!-- Actions -->
          <div class="space-y-2.5 pt-3 border-t border-outline-variant/30">
            <button type="button" id="modalUseDifferentPhoneBtn" class="w-full py-3 px-4 rounded-xl border border-outline-variant/60 hover:border-primary/50 hover:bg-surface-container font-body-sm text-[13px] font-semibold text-on-surface flex items-center justify-center gap-2 transition-all cursor-pointer">
              <span class="material-symbols-outlined text-primary text-[18px]">phone_iphone</span>
              <span>Log in with another phone number</span>
            </button>
            
            <button type="button" id="modalCreateNewAccountBtn" class="w-full py-2.5 px-4 rounded-xl hover:bg-surface-container/60 font-body-sm text-[12px] font-medium text-primary flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
              <span class="material-symbols-outlined text-[16px]">person_add</span>
              <span>Create a new account</span>
            </button>
          </div>
        </div>
      </div>
    `;

    div.innerHTML = innerHTML;
    return div;
  },

  afterRender: async () => {
    // Sync backend database users in background
    try {
      if (typeof API !== 'undefined' && API.getUsers) {
        const dbUsers = await API.getUsers();
        if (Array.isArray(dbUsers) && dbUsers.length > 0) {
          const currentAccs = JSON.parse(localStorage.getItem('fs_accounts') || '{}');
          let updated = false;
          dbUsers.forEach(u => {
            if (u.phone && !currentAccs[u.phone]) {
              currentAccs[u.phone] = {
                phone: u.phone,
                name: u.name,
                bank: u.bank_id || 'bank_1',
                bankDisplayName: u.bank_name || 'Nagaland Regional Bank',
                pin: u.phone === '9874561230' ? '4444' : (u.phone === '9988776655' ? '4321' : '1234')
              };
              updated = true;
            }
          });
          if (updated) {
            localStorage.setItem('fs_accounts', JSON.stringify(currentAccs));
          }
        }
      }
    } catch (e) {
      console.warn('Backend users sync skipped:', e);
    }

    // Modal elements
    const switchModal = document.getElementById('switchUserModal');
    const switchModalCard = document.getElementById('switchUserModalCard');
    const closeSwitchModalBtn = document.getElementById('closeSwitchModalBtn');
    const changeUserBtn = document.getElementById('changeUserBtn');
    const modalUseDifferentPhoneBtn = document.getElementById('modalUseDifferentPhoneBtn');
    const modalCreateNewAccountBtn = document.getElementById('modalCreateNewAccountBtn');
    const backToSavedUserBtn = document.getElementById('backToSavedUserBtn');
    const savedAccountsList = document.getElementById('savedAccountsList');

    function openModal() {
      if (!switchModal) return;
      populateAccountsList();
      switchModal.classList.remove('hidden');
      setTimeout(() => {
        switchModal.classList.remove('opacity-0');
        if (switchModalCard) {
          switchModalCard.classList.remove('scale-95');
          switchModalCard.classList.add('scale-100');
        }
      }, 10);
    }

    function closeModal() {
      if (!switchModal) return;
      switchModal.classList.add('opacity-0');
      if (switchModalCard) {
        switchModalCard.classList.remove('scale-100');
        switchModalCard.classList.add('scale-95');
      }
      setTimeout(() => switchModal.classList.add('hidden'), 200);
    }

    function populateAccountsList() {
      if (!savedAccountsList) return;
      const accs = JSON.parse(localStorage.getItem('fs_accounts') || '{}');
      const active = localStorage.getItem('fs_active_phone');
      const entries = Object.entries(accs);

      if (entries.length === 0) {
        savedAccountsList.innerHTML = `
          <div class="py-6 text-center text-on-surface-variant font-body-sm text-[13px]">
            No saved profiles found.
          </div>
        `;
        return;
      }

      savedAccountsList.innerHTML = entries.map(([phone, acc]) => {
        const isActive = (phone === active);
        const initials = (acc.name || 'User').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const masked = phone.slice(-4) || 'XXXX';
        const bankName = acc.bankDisplayName || acc.bank || 'Nagaland Regional Bank';

        return `
          <div class="flex items-center justify-between p-3 rounded-xl border ${isActive ? 'border-primary/50 bg-primary/5' : 'border-outline-variant/30 hover:bg-surface-container-low'} transition-all group">
            <div class="flex items-center gap-3 cursor-pointer select-account-row flex-1 min-w-0" data-phone="${phone}">
              <div class="w-10 h-10 rounded-full ${isActive ? 'bg-primary text-on-primary' : 'bg-primary-container text-on-primary'} flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                ${initials}
              </div>
              <div class="flex flex-col text-left min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-label-mono-md text-[13px] font-bold text-on-surface truncate">${acc.name}</span>
                  ${isActive ? '<span class="text-[9px] font-label-mono-sm px-1.5 py-0.5 rounded bg-primary text-on-primary font-semibold uppercase shrink-0">Active</span>' : ''}
                </div>
                <span class="font-body-sm text-[11px] text-on-surface-variant">Account &bull;&bull;${masked}</span>
                <span class="flex items-center gap-1 mt-0.5">
                  <span class="material-symbols-outlined text-[11px] text-on-surface-variant/60">account_balance</span>
                  <span class="font-body-sm text-[10px] text-on-surface-variant/70 truncate">${bankName}</span>
                </span>
              </div>
            </div>
            <div class="flex items-center gap-1 shrink-0 pl-2">
              ${!isActive ? `
                <button type="button" class="select-btn text-[12px] font-label-mono-sm font-semibold text-primary hover:bg-primary hover:text-on-primary px-2.5 py-1.5 rounded-lg border border-primary/30 transition-all" data-phone="${phone}">
                  Switch
                </button>
              ` : ''}
              <button type="button" class="delete-account-btn text-on-surface-variant/40 hover:text-error hover:bg-error/10 p-1.5 rounded-lg transition-colors" data-phone="${phone}" title="Remove profile">
                <span class="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>
          </div>
        `;
      }).join('');

      // Attach account row selection listeners
      savedAccountsList.querySelectorAll('.select-account-row, .select-btn').forEach(el => {
        el.addEventListener('click', (e) => {
          const phone = el.getAttribute('data-phone');
          if (phone) {
            localStorage.setItem('fs_active_phone', phone);
            sessionStorage.removeItem('fs_login_mode');
            closeModal();
            Router.refresh();
          }
        });
      });

      // Attach delete account listeners
      savedAccountsList.querySelectorAll('.delete-account-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const phone = btn.getAttribute('data-phone');
          if (phone) {
            const currentAccs = JSON.parse(localStorage.getItem('fs_accounts') || '{}');
            delete currentAccs[phone];
            localStorage.setItem('fs_accounts', JSON.stringify(currentAccs));

            // If deleted the active account, pick another or clear
            if (localStorage.getItem('fs_active_phone') === phone) {
              const remaining = Object.keys(currentAccs);
              if (remaining.length > 0) {
                localStorage.setItem('fs_active_phone', remaining[0]);
              } else {
                localStorage.removeItem('fs_active_phone');
                sessionStorage.setItem('fs_login_mode', 'manual');
              }
            }

            populateAccountsList();
            Router.refresh();
          }
        });
      });
    }

    // Change User button click handler
    if (changeUserBtn) {
      changeUserBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
      });
    }

    if (closeSwitchModalBtn) {
      closeSwitchModalBtn.addEventListener('click', closeModal);
    }

    if (switchModal) {
      switchModal.addEventListener('click', (e) => {
        if (e.target === switchModal) closeModal();
      });
    }

    if (modalUseDifferentPhoneBtn) {
      modalUseDifferentPhoneBtn.addEventListener('click', () => {
        sessionStorage.setItem('fs_login_mode', 'manual');
        closeModal();
        Router.refresh();
      });
    }

    if (modalCreateNewAccountBtn) {
      modalCreateNewAccountBtn.addEventListener('click', () => {
        closeModal();
        Router.navigate('/register');
      });
    }

    if (backToSavedUserBtn) {
      backToSavedUserBtn.addEventListener('click', () => {
        sessionStorage.removeItem('fs_login_mode');
        Router.refresh();
      });
    }

    // LOGIN FORM LOGIC
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      const inputs = document.querySelectorAll('.pin-box');
      inputs.forEach((input, index) => {
        input.addEventListener('input', function() {
          if (this.value.length === 1 && index < inputs.length - 1) inputs[index + 1].focus();
        });
        input.addEventListener('keydown', function(e) {
          if (e.key === 'Backspace' && !this.value && index > 0) inputs[index - 1].focus();
        });
      });
      if (inputs.length > 0) setTimeout(() => inputs[0].focus(), 100);

      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pin = Array.from(inputs).map(i => i.value).join('');
        const accInput = document.getElementById('accountNumber');
        const activePhoneFallback = localStorage.getItem('fs_active_phone');
        const acc = (accInput && accInput.value) ? accInput.value : activePhoneFallback;
        const errorDiv = document.getElementById('loginError');
        const btn = loginForm.querySelector('button');
        
        if (pin.length !== 4) {
          errorDiv.textContent = "Please enter a 4-digit PIN.";
          errorDiv.classList.remove('hidden');
          return;
        }

        errorDiv.classList.add('hidden');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="material-symbols-outlined spinner text-[20px]">sync</span> Authenticating...';
        btn.disabled = true;

        try {
          // Verify against backend SQLite Database via API
          try {
            const res = await API.login(acc, pin);
            localStorage.setItem('fs_active_phone', acc);
            sessionStorage.removeItem('fs_login_mode');
            
            // Save in cached accounts
            const existingAccounts = JSON.parse(localStorage.getItem('fs_accounts') || '{}');
            if (res.user) {
              existingAccounts[acc] = {
                phone: acc,
                name: res.user.name || `User ${acc.slice(-4)}`,
                bank: res.user.bank_name || 'Nagaland Regional Bank',
                pin: pin
              };
              localStorage.setItem('fs_accounts', JSON.stringify(existingAccounts));
            }

            btn.innerHTML = '<span class="material-symbols-outlined text-[20px]">check_circle</span> Success';
            btn.classList.add('bg-emerald-600', 'hover:bg-emerald-700');
            setTimeout(() => Router.navigate('/dashboard'), 800);
            return;
          } catch (apiErr) {
            // Fallback to local accounts if API unavailable or offline
            const existingAccounts = JSON.parse(localStorage.getItem('fs_accounts') || '{}');
            const user = existingAccounts[acc];

            if (user && user.pin === pin) {
              localStorage.setItem('fs_token', 'mock_prototype_token_123');
              localStorage.setItem('fs_user', JSON.stringify(user));
              localStorage.setItem('fs_active_phone', acc);
              sessionStorage.removeItem('fs_login_mode');
              btn.innerHTML = '<span class="material-symbols-outlined text-[20px]">check_circle</span> Success';
              btn.classList.add('bg-emerald-600', 'hover:bg-emerald-700');
              setTimeout(() => Router.navigate('/dashboard'), 800);
              return;
            }
            throw new Error(apiErr.message || "Incorrect MPIN. Please try again.");
          }
        } catch (err) {
          errorDiv.textContent = err.message || "Invalid PIN. Please try again.";
          errorDiv.classList.remove('hidden');
          btn.innerHTML = originalText;
          btn.disabled = false;
          inputs.forEach(i => { i.classList.add('border-error', 'text-error'); i.value = ''; });
          setTimeout(() => { inputs.forEach(i => i.classList.remove('border-error', 'text-error')); inputs[0].focus(); }, 800);
        }
      });
    }
  }
};
