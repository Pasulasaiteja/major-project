/**
 * api.js — Federated Sentinel API Client
 * Connects to the FastAPI backend (main.py on :8000, bank_edge_api on :8001)
 */

const API = (() => {
  const CENTRAL_URL = 'http://127.0.0.1:8000';
  const EDGE_URL = 'http://127.0.0.1:8001';

  let _token = null;
  let _user = null;

  function setAuth(token, user) {
    _token = token;
    _user = user;
    localStorage.setItem('fs_token', token);
    localStorage.setItem('fs_user', JSON.stringify(user));
  }

  function getAuth() {
    if (!_token) {
      _token = localStorage.getItem('fs_token');
      const u = localStorage.getItem('fs_user');
      if (u) _user = JSON.parse(u);
    }
    return { token: _token, user: _user };
  }

  function clearAuth() {
    _token = null;
    _user = null;
    localStorage.removeItem('fs_token');
    localStorage.removeItem('fs_user');
  }

  function isLoggedIn() {
    return !!getAuth().token;
  }

  async function request(baseUrl, path, options = {}) {
    const url = `${baseUrl}${path}`;
    const defaults = {
      headers: { 'Content-Type': 'application/json' },
    };
    if (_token) {
      defaults.headers['Authorization'] = `Bearer ${_token}`;
    }
    const config = { ...defaults, ...options, headers: { ...defaults.headers, ...options.headers } };

    try {
      const res = await fetch(url, config);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      if (err.message === 'Failed to fetch') {
        throw new Error('Backend not reachable. Start the API server first.');
      }
      throw err;
    }
  }

  // ── Auth ──
  async function register(phone, name, pin) {
    const data = await request(EDGE_URL, '/register', {
      method: 'POST',
      body: JSON.stringify({ phone, name, pin })
    });
    if (data.success) {
      setAuth(data.token, data.user);
    }
    return data;
  }

  async function login(accountNumber, pin) {
    const data = await request(EDGE_URL, '/login', {
      method: 'POST',
      body: JSON.stringify({ account_number: accountNumber, pin })
    });
    if (data.success) {
      setAuth(data.token, data.user);
    }
    return data;
  }

  async function getUsers() {
    try {
      return await request(EDGE_URL, '/users');
    } catch (e) {
      console.warn('Could not fetch registered users from edge node:', e);
      return [];
    }
  }

  function logout() {
    clearAuth();
  }

  // ── Transactions ──
  async function getTransactions(phone) {
    const activeUser = getAuth().user;
    const userPhone = phone || (activeUser ? (activeUser.phone || activeUser.account_number) : '');
    const query = userPhone ? `?phone=${userPhone}` : '';
    return request(EDGE_URL, `/transactions${query}`);
  }

  // ── Predictions (Edge) ──
  async function predictTransaction(txData) {
    return request(EDGE_URL, '/predict', {
      method: 'POST',
      body: JSON.stringify(txData)
    });
  }

  // ── Alerts ──
  async function getAlerts(bankId, status) {
    let query = '';
    const params = [];
    if (bankId) params.push(`bank_id=${bankId}`);
    if (status) params.push(`status=${status}`);
    if (params.length) query = '?' + params.join('&');
    return request(EDGE_URL, `/alerts${query}`);
  }

  async function resolveAlert(transactionId) {
    try {
      return await request(EDGE_URL, `/alerts/${transactionId}/resolve`, { method: 'PATCH' });
    } catch (e) {
      return await request(CENTRAL_URL, `/alerts/${transactionId}/resolve`, { method: 'PATCH' });
    }
  }

  // ── Central API: Metrics ──
  async function getSystemSummary() {
    return request(CENTRAL_URL, '/summary');
  }

  async function getFederatedMetrics() {
    return request(CENTRAL_URL, '/metrics/federated');
  }

  async function getDPMetrics() {
    return request(CENTRAL_URL, '/metrics/dp');
  }

  async function getNodes() {
    return request(CENTRAL_URL, '/nodes');
  }

  async function getEdgeNodeStatus() {
    return request(CENTRAL_URL, '/nodes/edge-status');
  }

  async function getEdgeModelInfo() {
    return request(EDGE_URL, '/model-info');
  }

  // ── Health ──
  async function healthCheck() {
    return request(CENTRAL_URL, '/');
  }

  async function edgeHealthCheck() {
    return request(EDGE_URL, '/');
  }

  return {
    register, login, logout, isLoggedIn, getAuth, clearAuth, getUsers,
    getTransactions, predictTransaction,
    getAlerts, resolveAlert,
    getSystemSummary, getFederatedMetrics, getDPMetrics,
    getNodes, getEdgeNodeStatus, getEdgeModelInfo,
    healthCheck, edgeHealthCheck
  };
})();
