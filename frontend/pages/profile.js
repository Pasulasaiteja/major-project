window.ProfilePage = {
  protected: true,
  render: async () => {
    const auth = API.getAuth();
    const user = auth.user || {};
    const name = user.name || "User Account";
    const phone = user.phone || user.account_number || "N/A";
    const bankName = user.bank_name || user.bank || "Regional Partner Bank";
    
    // Calculate Initials
    const nameParts = name.trim().split(' ');
    const initials = nameParts.length >= 2 
      ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();

    const isDarkMode = document.documentElement.classList.contains('dark');

    const div = document.createElement('div');
    div.className = "min-h-screen bg-surface dark:bg-inverse-surface flex flex-col page-enter transition-colors duration-200";
    div.innerHTML = `
      <!-- Header -->
      <header class="sticky top-0 z-50 bg-surface/80 dark:bg-inverse-surface/80 backdrop-blur-lg border-b border-outline-variant/30 px-margin lg:px-margin-desktop h-16 flex items-center justify-between">
        <div class="flex items-center gap-space-sm cursor-pointer" onclick="Router.navigate('/dashboard')">
          <div class="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center">
            <span class="material-symbols-outlined text-primary text-[18px]">policy</span>
          </div>
          <span class="font-headline-sm text-headline-sm text-on-surface dark:text-inverse-on-surface">FEDERATED SENTINEL</span>
        </div>
        
        <button onclick="Router.navigate('/dashboard')" class="px-4 py-2 rounded-xl bg-surface-container-high dark:bg-surface-container-highest text-on-surface dark:text-inverse-on-surface font-label-mono-sm text-label-mono-sm hover:bg-primary/10 transition-colors flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back to Dashboard</span>
        </button>
      </header>

      <!-- Main Profile Container -->
      <main class="flex-1 w-full max-w-3xl mx-auto px-margin lg:px-margin-desktop py-10">
        <div class="mb-8">
          <h1 class="font-display-lg text-[32px] text-on-surface dark:text-inverse-on-surface leading-tight">Account & Profile Settings</h1>
          <p class="font-body-sm text-on-surface-variant dark:text-outline-variant mt-1">Manage your identity, security preferences, and active session.</p>
        </div>

        <!-- User Identity Card -->
        <div class="bg-surface-container-lowest dark:bg-surface-container-low rounded-[24px] border border-outline-variant/30 p-6 md:p-8 shadow-sm mb-8 relative overflow-hidden">
          <div class="absolute -right-12 -bottom-12 w-48 h-48 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div class="flex flex-col sm:flex-row items-center gap-6 relative z-10">
            <div class="w-20 h-20 rounded-full bg-primary-container text-on-primary font-display-lg text-[32px] flex items-center justify-center shrink-0 shadow-md">
              ${initials}
            </div>
            
            <div class="flex-1 text-center sm:text-left space-y-1">
              <div class="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
                <h2 class="font-headline-lg text-headline-lg text-on-surface dark:text-inverse-on-surface font-bold">${name}</h2>
                <span class="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-label-mono-sm text-[11px] font-bold uppercase tracking-wider border border-emerald-500/20">Active Client</span>
              </div>
              <p class="font-label-mono-md text-label-mono-md text-on-surface-variant dark:text-outline-variant">Registered Mobile: <span class="font-bold text-on-surface dark:text-inverse-on-surface">+91 ${phone}</span></p>
              <p class="font-body-sm text-body-sm text-on-surface-variant dark:text-outline-variant">${bankName}</p>
            </div>
          </div>
        </div>

        <!-- Settings Options Grid -->
        <div class="space-y-6">
          
          <!-- Section 1: Appearance & Theme -->
          <div class="bg-surface-container-lowest dark:bg-surface-container-low rounded-[20px] border border-outline-variant/30 p-6 shadow-sm">
            <h3 class="font-label-mono-sm text-label-mono-sm uppercase text-primary font-bold tracking-wider mb-4">Appearance</h3>
            
            <div class="flex items-center justify-between py-2">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-secondary-container/50 text-on-secondary-container flex items-center justify-center">
                  <span class="material-symbols-outlined text-[22px]" id="themeIcon">${isDarkMode ? 'dark_mode' : 'light_mode'}</span>
                </div>
                <div>
                  <h4 class="font-headline-sm text-headline-sm text-on-surface dark:text-inverse-on-surface">Theme Mode</h4>
                  <p class="font-body-sm text-[12px] text-on-surface-variant dark:text-outline-variant">Switch between Light Mode and Dark Mode interface</p>
                </div>
              </div>

              <!-- Theme Toggle Button -->
              <button id="themeToggleBtn" class="px-4 py-2.5 rounded-xl border border-outline-variant/50 hover:border-primary bg-surface-container dark:bg-surface-container-high text-on-surface dark:text-inverse-on-surface font-label-mono-sm text-label-mono-sm flex items-center gap-2 transition-all">
                <span id="themeLabel">${isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
                <span class="material-symbols-outlined text-[18px]">sync</span>
              </button>
            </div>
          </div>

          <!-- Section 2: Security & Edge AI Protection -->
          <div class="bg-surface-container-lowest dark:bg-surface-container-low rounded-[20px] border border-outline-variant/30 p-6 shadow-sm">
            <h3 class="font-label-mono-sm text-label-mono-sm uppercase text-primary font-bold tracking-wider mb-4">Privacy & Security</h3>
            
            <div class="space-y-4">
              <div class="flex items-center justify-between py-2">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center">
                    <span class="material-symbols-outlined text-[22px]">shield_person</span>
                  </div>
                  <div>
                    <h4 class="font-headline-sm text-headline-sm text-on-surface dark:text-inverse-on-surface">Federated Edge Protection</h4>
                    <p class="font-body-sm text-[12px] text-on-surface-variant dark:text-outline-variant">On-premise model inference on local node without data sharing</p>
                  </div>
                </div>
                <span class="px-3 py-1 rounded-full bg-primary/10 text-primary font-label-mono-sm text-[11px] font-semibold">Enabled</span>
              </div>

              <div class="flex items-center justify-between py-2 border-t border-outline-variant/20">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-xl bg-secondary-container/20 text-secondary flex items-center justify-center">
                    <span class="material-symbols-outlined text-[22px]">fingerprint</span>
                  </div>
                  <div>
                    <h4 class="font-headline-sm text-headline-sm text-on-surface dark:text-inverse-on-surface">MPIN Authentication</h4>
                    <p class="font-body-sm text-[12px] text-on-surface-variant dark:text-outline-variant">4-digit MPIN for local session encryption</p>
                  </div>
                </div>
                <span class="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-label-mono-sm text-[11px] font-semibold">Protected</span>
              </div>
            </div>
          </div>

          <!-- Section 3: Session Actions (Log Out) -->
          <div class="bg-surface-container-lowest dark:bg-surface-container-low rounded-[20px] border border-outline-variant/30 p-6 shadow-sm">
            <h3 class="font-label-mono-sm text-label-mono-sm uppercase text-error font-bold tracking-wider mb-4">Session Actions</h3>
            
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <h4 class="font-headline-sm text-headline-sm text-on-surface dark:text-inverse-on-surface">Sign Out of Account</h4>
                <p class="font-body-sm text-[12px] text-on-surface-variant dark:text-outline-variant">Safely end your current session on this device</p>
              </div>

              <button id="logoutBtn" class="px-6 py-3 rounded-xl bg-error/10 hover:bg-error text-error hover:text-on-error font-body-md font-semibold transition-all flex items-center justify-center gap-2 border border-error/30 shadow-sm">
                <span class="material-symbols-outlined text-[20px]">logout</span>
                <span>Log Out</span>
              </button>
            </div>
          </div>

        </div>
      </main>
    `;

    return div;
  },
  afterRender: async () => {
    // Theme Toggle Handler
    const themeBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');
    const themeLabel = document.getElementById('themeLabel');

    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('fs_theme', isDark ? 'dark' : 'light');
        if (themeIcon) themeIcon.textContent = isDark ? 'dark_mode' : 'light_mode';
        if (themeLabel) themeLabel.textContent = isDark ? 'Dark Mode' : 'Light Mode';
      });
    }

    // Logout Handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        API.logout();
        localStorage.removeItem('fs_active_phone');
        Router.navigate('/login');
      });
    }
  }
};
