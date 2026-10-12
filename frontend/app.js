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
  Router.add('/ticket-status', window.TicketStatusPage);
  Router.add('/profile', window.ProfilePage);
  
  // Fallback route
  Router.add('/not-found', {
    protected: false,
    render: async () => {
      const div = document.createElement('div');
      div.className = "flex h-screen items-center justify-center";
      div.innerHTML = `<h1 class="text-2xl">404 - Not Found</h1><a href="/landing" class="ml-4 text-primary underline" data-path="/landing">Go Home</a>`;
      return div;
    }
  });

  // Initialize App
  Router.init();
});
