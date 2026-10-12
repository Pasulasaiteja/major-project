window.AccessRestoredPage = {
  protected: true,
  render: async () => {
    const div = document.createElement('div');
    div.className = "min-h-screen bg-surface flex flex-col items-center justify-center p-4 relative overflow-hidden page-enter";
    div.innerHTML = `
      <!-- Success Background Glow -->
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-surface to-surface -z-10"></div>
      
      <div class="w-full max-w-md text-center flex flex-col items-center">
        <!-- Animated Success Icon -->
        <div class="relative w-24 h-24 mb-8">
          <div class="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
          <div class="absolute inset-2 bg-emerald-100 rounded-full flex items-center justify-center shadow-lg border-2 border-emerald-500">
            <span class="material-symbols-outlined text-emerald-600 text-[48px]">check_circle</span>
          </div>
        </div>

        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-mono-sm text-label-mono-sm uppercase tracking-wider mb-4">
          <span class="material-symbols-outlined text-[14px]">lock_open</span> Hold Lifted
        </div>

        <h1 class="font-display-lg text-[36px] leading-tight text-on-surface mb-3">Access Restored</h1>
        
        <p class="font-body-md text-body-md text-on-surface-variant mb-8 max-w-sm">
          Thank you for verifying your identity. The protective hold has been removed and your transaction is now processing normally.
        </p>

        <div class="w-full p-4 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 text-left mb-8 space-y-2">
          <div class="flex justify-between font-label-mono-sm text-[12px] border-b border-outline-variant/20 pb-2">
            <span class="text-on-surface-variant">Federated Model Update</span>
            <span class="text-emerald-600 font-bold">Safe Pattern Learned</span>
          </div>
          <p class="font-body-sm text-[11px] text-on-surface-variant leading-relaxed">
            Your local AI profile has securely learned from this verification. Similar future transactions will process without interruption, all while maintaining absolute data privacy.
          </p>
        </div>

        <button class="w-full py-4 rounded-xl bg-primary text-on-primary font-body-md text-body-md font-semibold shadow-[0_4px_12px_rgba(84,63,213,0.24)] hover:bg-primary-container hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2" onclick="Router.navigate('/dashboard')">
          <span>Return to Dashboard</span>
          <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    `;
    return div;
  }
};
