window.LandingPage = {
  protected: false,
  render: async () => {
    const div = document.createElement('div');
    div.className = "min-h-screen bg-surface flex flex-col page-enter";
    div.innerHTML = `
      <header class="fixed top-0 left-0 w-full z-50 bg-surface/85 backdrop-blur-xl shadow-sm border-b border-outline-variant/20">
        <div class="h-20 max-w-7xl mx-auto px-margin lg:px-margin-desktop flex items-center justify-between">
          <div class="flex items-center gap-space-md shrink-0">
            <div class="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
              <span class="material-symbols-outlined text-primary text-[22px]">policy</span>
            </div>
            <div class="flex flex-col">
              <span class="font-headline-sm text-headline-sm text-on-surface tracking-tight leading-none">FEDERATED SENTINEL</span>
              <span class="font-label-mono-sm text-label-mono-sm text-on-surface-variant uppercase tracking-wider mt-1">Account & Fraud Monitor</span>
            </div>
          </div>
          
          <div class="flex items-center gap-4">
            <button onclick="Router.navigate('/manager-login')" class="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container-high text-on-surface font-label-mono-md hover:bg-surface-container-highest transition-colors cursor-pointer">
              <span class="material-symbols-outlined text-[18px] text-primary">admin_panel_settings</span>
              Manager Login
            </button>
            <button onclick="Router.navigate('/login')" class="px-6 py-2.5 rounded-full bg-primary text-on-primary font-body-md font-semibold hover:bg-primary-container shadow-md transition-all">
              Client Login
            </button>
          </div>
        </div>
      </header>

      <main class="w-full pt-28 flex-1">
        <section class="max-w-7xl mx-auto px-margin lg:px-margin-desktop py-12 md:py-20 text-center">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-container/40 text-on-secondary-container mb-6">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span class="font-label-mono-sm font-semibold uppercase tracking-wider">Privacy-First AI Fraud Detection</span>
          </div>
          
          <h1 class="font-display-lg text-[40px] sm:text-[56px] leading-[1.1] text-on-surface max-w-4xl mx-auto mb-6">
            Collaborative Security. <br/> <span class="text-primary italic">Absolute Privacy.</span>
          </h1>
          
          <p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10">
            Federated Sentinel leverages edge AI and federated learning to stop fraud in real-time across institutions—without ever sharing your raw financial data.
          </p>

          <div class="flex justify-center gap-4 flex-wrap">
            <button onclick="Router.navigate('/login')" class="px-8 py-4 rounded-full bg-primary text-on-primary font-body-md font-bold shadow-lg hover:-translate-y-1 transition-transform flex items-center gap-2 cursor-pointer">
              Access Client Portal <span class="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </div>

          <!-- Feature Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-left">
            <div class="bg-surface-container-lowest p-8 rounded-[24px] shadow-sm border border-outline-variant/30 hover-lift">
              <div class="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center mb-6">
                <span class="material-symbols-outlined text-[24px]">model_training</span>
              </div>
              <h3 class="font-headline-md text-headline-md text-on-surface mb-3">Federated Learning</h3>
              <p class="font-body-sm text-on-surface-variant">Models train locally on edge devices. Only encrypted weight updates are shared centrally, keeping raw data strictly private.</p>
            </div>
            
            <div class="bg-surface-container-lowest p-8 rounded-[24px] shadow-sm border border-outline-variant/30 hover-lift">
              <div class="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mb-6">
                <span class="material-symbols-outlined text-[24px]">psychology</span>
              </div>
              <h3 class="font-headline-md text-headline-md text-on-surface mb-3">Plain English Explainability</h3>
              <p class="font-body-sm text-on-surface-variant">Using SHAP values, complex neural network decisions are translated into clear, actionable explanations for clients.</p>
            </div>
            
            <div class="bg-surface-container-lowest p-8 rounded-[24px] shadow-sm border border-outline-variant/30 hover-lift">
              <div class="w-12 h-12 rounded-full bg-error-container text-error flex items-center justify-center mb-6">
                <span class="material-symbols-outlined text-[24px]">bolt</span>
              </div>
              <h3 class="font-headline-md text-headline-md text-on-surface mb-3">Instant Resolution</h3>
              <p class="font-body-sm text-on-surface-variant">Clients can review and resolve protective holds instantly without calling support, directly from their dashboard.</p>
            </div>
          </div>
        </section>
      </main>
    `;
    return div;
  }
};
