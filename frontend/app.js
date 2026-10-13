/**
 * app.js — Main Application Entry Point
 */

document.addEventListener('DOMContentLoaded', () => {
  // Register routes
  Router.add('/landing', window.LandingPage);
  Router.add('/register', window.RegisterPage);
  Router.add('/login', window.LoginPage);
  Router.add('/dashboard', window.DashboardPage);
  Router.add('/hold-reason', window.HoldReasonPage);
  Router.add('/access-restored', window.AccessRestoredPage);
  Router.add('/investigation', window.InvestigationPage);
  Router.add('/raise-ticket', window.RaiseTicketPage);
  Router.add('/profile', window.ProfilePage);

  // Register ticket status routes & aliases
  const ticketPage = window.TicketStatusPage;
  Router.add('/ticket-status', ticketPage);
  Router.add('/tickets', ticketPage);
  Router.add('/ticket', ticketPage);
  Router.add('/my-tickets', ticketPage);
  Router.add('/ticket_status', ticketPage);
  Router.add('/tickets-status', ticketPage);
  Router.add('/ticketstatus', ticketPage);
  Router.add('/status', ticketPage);
  
  // Friendly 404 Fallback route with navigation options
  Router.add('/not-found', {
    protected: false,
    render: async () => {
      const div = document.createElement('div');
      div.className = "min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center page-enter";
      div.innerHTML = `
        <div class="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/8 via-surface to-surface -z-10"></div>
        <div class="max-w-md w-full bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 shadow-lg">
          <div class="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <span class="material-symbols-outlined text-[36px]">travel_explore</span>
          </div>
          <h1 class="font-display-lg text-[24px] font-bold text-on-surface mb-2">Page Not Found</h1>
          <p class="font-body-md text-on-surface-variant text-sm mb-6">
            The page you're looking for doesn't exist or may have been moved.
          </p>
          <div class="flex flex-col sm:flex-row gap-3">
            <button onclick="Router.navigate('/dashboard')"
              class="flex-1 py-3 px-4 rounded-xl bg-primary text-on-primary font-headline-sm text-sm hover:bg-primary/90 transition-all shadow-sm cursor-pointer">
              Go to Dashboard
            </button>
            <button onclick="Router.navigate('/ticket-status')"
              class="flex-1 py-3 px-4 rounded-xl border border-outline-variant/60 text-on-surface hover:bg-surface-container font-headline-sm text-sm transition-colors cursor-pointer">
              View Tickets
            </button>
          </div>
        </div>
      `;
      return div;
    }
  });

  // Initialize App
  Router.init();
});
