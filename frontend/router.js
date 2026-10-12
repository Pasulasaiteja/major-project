/**
 * router.js — Simple SPA Router (refresh-safe)
 */

const Router = (() => {
  const routes = {};
  let currentPath = '';
  let _initialLoad = true;

  function add(path, component) {
    routes[path] = component;
  }

  async function navigate(path, force = false) {
    // Allow re-navigation to same path only on the initial page load or when forced
    if (path === currentPath && !_initialLoad && !force) return;
    _initialLoad = false;

    currentPath = path;
    window.history.pushState({}, '', path);

    const appDiv = document.getElementById('app');
    appDiv.innerHTML = '';

    const component = routes[path] || routes['/not-found'];

    if (component) {
      // Re-read auth state fresh from localStorage on every navigation
      const loggedIn = !!(localStorage.getItem('fs_token'));

      if (component.protected && !loggedIn) {
        console.warn('Unauthorized — redirecting to /login');
        currentPath = '/login';
        window.history.replaceState({}, '', '/login');
        const loginComp = routes['/login'];
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
    }
  }

  function refresh() {
    return navigate(currentPath || window.location.pathname, true);
  }

  function init() {
    window.addEventListener('popstate', () => {
      _initialLoad = true; // treat browser back/forward like a fresh load
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

    // Initial route — always treat as fresh load
    _initialLoad = true;
    const path = window.location.pathname;
    navigate(path === '/' || path === '/index.html' ? '/landing' : path);
  }

  return { add, navigate, init, refresh };
})();
