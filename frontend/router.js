/**
 * router.js — Robust SPA Router (refresh-safe with path normalization & aliases)
 */

const Router = (() => {
  const routes = {};
  let currentPath = '';
  let _initialLoad = true;

  function normalize(path) {
    if (!path) return '/landing';
    // Remove query params and hashes
    let p = path.split('?')[0].split('#')[0].trim().toLowerCase();
    // Remove .html suffix if present
    if (p.endsWith('.html')) {
      p = p.slice(0, -5);
    }
    // Remove trailing slash if longer than 1 character
    if (p.length > 1 && p.endsWith('/')) {
      p = p.slice(0, -1);
    }
    if (p === '' || p === '/' || p === '/index') {
      return '/landing';
    }
    return p;
  }

  function add(path, component) {
    const key = normalize(path);
    routes[key] = component;
  }

  function resolveComponent(path) {
    const key = normalize(path);

    // Direct match
    if (routes[key]) return { component: routes[key], resolvedPath: key };

    // Intelligent aliases / fuzzy fallbacks
    if (key.includes('ticket-status') || key === '/tickets' || key === '/ticket' || 
        key === '/my-tickets' || key.includes('ticketstatus') || key.includes('ticket_status') ||
        key === '/ticket/status' || key === '/tickets/status') {
      const comp = routes['/ticket-status'] || window.TicketStatusPage;
      if (comp) return { component: comp, resolvedPath: '/ticket-status' };
    }

    if (key === '/raise' || key === '/new-ticket' || key === '/dispute') {
      const comp = routes['/raise-ticket'] || window.RaiseTicketPage;
      if (comp) return { component: comp, resolvedPath: '/raise-ticket' };
    }

    if (key === '/home' || key === '/main') {
      const comp = routes['/dashboard'] || window.DashboardPage;
      if (comp) return { component: comp, resolvedPath: '/dashboard' };
    }

    // Default to /not-found
    return { component: routes['/not-found'], resolvedPath: '/not-found' };
  }

  async function navigate(rawPath, force = false) {
    const { component, resolvedPath } = resolveComponent(rawPath);

    // Avoid duplicate navigation unless initial load or forced
    if (resolvedPath === currentPath && !_initialLoad && !force) return;
    _initialLoad = false;

    currentPath = resolvedPath;
    window.history.pushState({}, '', rawPath || resolvedPath);

    const appDiv = document.getElementById('app');
    if (!appDiv) return;
    appDiv.innerHTML = '';
    document.querySelectorAll('.app-modal').forEach(m => m.remove());
    document.body.style.overflow = '';

    if (component) {
      // Check auth state fresh from localStorage
      const loggedIn = !!(localStorage.getItem('fs_token'));

      if (component.protected && !loggedIn) {
        console.warn('Unauthorized — redirecting to /login');
        currentPath = '/login';
        window.history.replaceState({}, '', '/login');
        const loginComp = routes['/login'] || window.LoginPage;
        if (loginComp) {
          const el = await loginComp.render();
          el.classList.add('page-enter');
          appDiv.appendChild(el);
          if (loginComp.afterRender) await loginComp.afterRender();
        }
        return;
      }

      const el = await component.render();
      el.classList.add('page-enter');
      appDiv.appendChild(el);

      if (component.afterRender) {
        await component.afterRender();
      }
    } else {
      // Fallback if component is null
      appDiv.innerHTML = `
        <div class="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
          <span class="material-symbols-outlined text-[56px] text-primary/40 mb-3">error_outline</span>
          <h1 class="text-2xl font-bold text-on-surface mb-2">Page Not Found</h1>
          <p class="text-on-surface-variant text-sm mb-6">The requested page could not be found.</p>
          <div class="flex gap-3">
            <button onclick="Router.navigate('/dashboard')" class="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-sm">Dashboard</button>
            <button onclick="Router.navigate('/ticket-status')" class="px-5 py-2.5 rounded-xl border border-outline-variant/60 text-on-surface font-semibold text-sm">My Tickets</button>
          </div>
        </div>
      `;
    }
  }

  function refresh() {
    return navigate(currentPath || window.location.pathname, true);
  }

  function init() {
    window.addEventListener('popstate', () => {
      _initialLoad = true;
      navigate(window.location.pathname);
    });

    // Handle link clicks globally
    document.body.addEventListener('click', e => {
      const link = e.target.closest('a[data-path]');
      if (link) {
        e.preventDefault();
        const path = link.getAttribute('data-path');
        if (path) navigate(path);
      }
    });

    // Initial route
    _initialLoad = true;
    const path = window.location.pathname;
    navigate(path);
  }

  return { add, navigate, init, refresh, normalize };
})();
