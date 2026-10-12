window.RegisterPage = {
  protected: false,
  render: async () => {
    const div = document.createElement('div');
    div.className = "min-h-screen bg-surface flex flex-col items-center justify-center p-4 relative overflow-hidden page-enter";
    div.innerHTML = `
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

      <div class="w-full max-w-[420px] bg-surface-container-lowest rounded-[24px] shadow-[0_8px_30px_rgba(45,42,58,0.06)] border border-outline-variant/30 p-8 md:p-10 relative">
        <div class="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-primary/5 rounded-full blur-2xl"></div>
        
        <div class="text-center mb-8 relative z-10">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed font-label-mono-sm text-label-mono-sm uppercase font-semibold tracking-wider mb-5">
            <span class="w-1.5 h-1.5 rounded-full bg-primary pulse-dot"></span>
            Register Account
          </div>
          <h1 class="font-display-lg text-[28px] leading-tight text-on-surface mb-2 font-normal">Create Account</h1>
          <p class="font-body-sm text-body-sm text-on-surface-variant">Setup your secure banking profile.</p>
        </div>

        <form id="registerForm" class="space-y-5">
          <!-- Phone Number -->
          <div class="flex flex-col text-left">
            <label class="font-label-mono-sm text-label-mono-sm text-on-surface uppercase tracking-wider font-bold mb-1">Phone Number</label>
            <div class="relative flex items-center">
              <span class="absolute left-4 font-body-md text-on-surface-variant">+91</span>
              <input type="tel" id="regPhone" required maxlength="10" pattern="[0-9]{10}" class="w-full h-12 pl-12 pr-4 bg-surface-container rounded-xl border border-outline-variant/50 text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all font-body-md" placeholder="Enter 10 digit number">
            </div>
          </div>

          <!-- Select Bank -->
          <div class="flex flex-col text-left">
            <label class="font-label-mono-sm text-label-mono-sm text-on-surface uppercase tracking-wider font-bold mb-1">Select Your Bank</label>
            <div class="relative">
              <select id="regBank" required class="w-full h-12 px-4 appearance-none bg-surface-container rounded-xl border border-outline-variant/50 text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all font-body-md cursor-pointer">
                <option value="" disabled selected>Select Bank</option>
                <option value="bank_1">Nagaland Regional Bank</option>
                <option value="bank_2">Meghalaya Regional Bank</option>
                <option value="bank_3">UP Gramin Bank</option>
              </select>
              <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">arrow_drop_down</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- Create MPIN -->
            <div class="flex flex-col text-left">
              <label class="font-label-mono-sm text-label-mono-sm text-on-surface uppercase tracking-wider font-bold mb-1">Create MPIN</label>
              <input type="password" id="regPin" required maxlength="4" pattern="[0-9]{4}" class="w-full h-12 px-4 bg-surface-container rounded-xl border border-outline-variant/50 text-on-surface font-display-lg text-[20px] tracking-widest text-center focus:outline-none focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all" placeholder="••••">
            </div>

            <!-- Confirm MPIN -->
            <div class="flex flex-col text-left">
              <label class="font-label-mono-sm text-label-mono-sm text-on-surface uppercase tracking-wider font-bold mb-1">Confirm MPIN</label>
              <input type="password" id="regConfirmPin" required maxlength="4" pattern="[0-9]{4}" class="w-full h-12 px-4 bg-surface-container rounded-xl border border-outline-variant/50 text-on-surface font-display-lg text-[20px] tracking-widest text-center focus:outline-none focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all" placeholder="••••">
            </div>
          </div>
          
          <div id="regError" class="text-error font-body-sm text-[12px] h-4 mt-2 hidden text-center"></div>
          <div id="regSuccess" class="text-emerald-600 font-body-sm text-[12px] h-4 mt-2 hidden text-center">Account created successfully! Redirecting...</div>

          <button type="submit" class="w-full py-4 mt-2 rounded-xl bg-primary text-on-primary font-body-md text-body-md font-semibold shadow-[0_4px_12px_rgba(84,63,213,0.24)] hover:bg-primary-container hover:shadow-[0_6px_16px_rgba(84,63,213,0.32)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 btn-sheen group">
            <span>Create Account</span>
            <span class="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="font-body-sm text-[13px] text-on-surface-variant">
            Already have an account? 
            <a href="#" onclick="Router.navigate('/login'); return false;" class="text-primary font-semibold hover:underline">Login</a>
          </p>
        </div>

        <div class="mt-8 pt-6 border-t border-outline-variant/30 flex items-center justify-center gap-2 text-on-surface-variant font-label-mono-sm text-[10px] uppercase">
          <span class="material-symbols-outlined text-[14px]">lock</span>
          <span>End-to-End Encrypted via Federated Sentinel</span>
        </div>
      </div>
    `;
    return div;
  },
  afterRender: async () => {
    const form = document.getElementById('registerForm');
    const phoneInput = document.getElementById('regPhone');
    
    // Allow only numeric input for phone and MPINs
    const numericInputs = ['regPhone', 'regPin', 'regConfirmPin'];
    numericInputs.forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.addEventListener('input', function() {
                this.value = this.value.replace(/[^0-9]/g, '');
            });
        }
    });

    if (phoneInput) setTimeout(() => phoneInput.focus(), 100);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const phone = document.getElementById('regPhone').value;
      const bank = document.getElementById('regBank').value;
      const pin = document.getElementById('regPin').value;
      const confirmPin = document.getElementById('regConfirmPin').value;
      const errorDiv = document.getElementById('regError');
      const successDiv = document.getElementById('regSuccess');
      const btn = form.querySelector('button');

      errorDiv.classList.add('hidden');
      successDiv.classList.add('hidden');

      // Validation
      if (phone.length !== 10) {
        errorDiv.textContent = "Please enter a valid 10-digit mobile number.";
        errorDiv.classList.remove('hidden');
        return;
      }
      
      if (pin.length !== 4) {
        errorDiv.textContent = "MPIN must be exactly 4 digits.";
        errorDiv.classList.remove('hidden');
        return;
      }

      if (pin !== confirmPin) {
        errorDiv.textContent = "MPINs do not match. Please try again.";
        errorDiv.classList.remove('hidden');
        return;
      }

      const name = "User " + phone.substring(6);

      // Resolve bank ID to display name
      const bankNames = {
        'bank_1': 'Nagaland Regional Bank',
        'bank_2': 'Meghalaya Regional Bank',
        'bank_3': 'UP Gramin Bank'
      };
      const bankDisplayName = bankNames[bank] || bank;

      // UI Processing Feedback
      const originalText = btn.innerHTML;
      btn.innerHTML = '<span class="material-symbols-outlined spinner text-[20px]">sync</span> Registering...';
      btn.disabled = true;

      try {
        // Register in backend SQLite database
        const res = await API.register(phone, name, pin);
        
        // Also sync local cache for smooth offline fallback
        const existingAccountsStr = localStorage.getItem('fs_accounts') || '{}';
        const existingAccounts = JSON.parse(existingAccountsStr);
        existingAccounts[phone] = { phone, bank, pin, name, bankDisplayName };
        localStorage.setItem('fs_accounts', JSON.stringify(existingAccounts));
        localStorage.setItem('fs_active_phone', phone);

        btn.innerHTML = '<span class="material-symbols-outlined text-[20px]">check_circle</span> Account Created';
        btn.classList.add('bg-emerald-600', 'hover:bg-emerald-700');
        successDiv.classList.remove('hidden');

        setTimeout(() => {
          Router.navigate('/login');
        }, 1200);
      } catch (err) {
        // Fallback to local offline registration if API backend server is offline
        const existingAccountsStr = localStorage.getItem('fs_accounts') || '{}';
        const existingAccounts = JSON.parse(existingAccountsStr);
        
        if (existingAccounts[phone]) {
          errorDiv.textContent = "An account with this phone number already exists.";
          errorDiv.classList.remove('hidden');
          btn.innerHTML = originalText;
          btn.disabled = false;
          return;
        }

        existingAccounts[phone] = { phone, bank, pin, name, bankDisplayName };
        localStorage.setItem('fs_accounts', JSON.stringify(existingAccounts));
        localStorage.setItem('fs_active_phone', phone);

        btn.innerHTML = '<span class="material-symbols-outlined text-[20px]">check_circle</span> Account Created';
        btn.classList.add('bg-emerald-600', 'hover:bg-emerald-700');
        successDiv.classList.remove('hidden');

        setTimeout(() => {
          Router.navigate('/login');
        }, 1200);
      }
    });
  }
};
