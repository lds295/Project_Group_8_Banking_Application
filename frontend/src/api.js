// Small fetch-based API helper with token support.
// Usage examples:
//   import api from './api';
//   const res = await api.get('/users/me');
//   console.log(res.data);

const STORAGE_KEY = 'auth_token';
const baseURL = process.env.REACT_APP_API_BASE_URL || ''; // set via env when needed

function getToken() {
  return localStorage.getItem(STORAGE_KEY) || null;
}

function setToken(token) {
  if (token) localStorage.setItem(STORAGE_KEY, token);
  else localStorage.removeItem(STORAGE_KEY);
}

function clearToken() {
  localStorage.removeItem(STORAGE_KEY);
}

function buildUrl(path) {
  // allow passing full URL or relative path like '/users/me'
  if (!path) path = '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  // ensure single slash between baseURL and path
  if (!baseURL) return path;
  return `${baseURL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

async function parseResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  let data = null;
  try {
    if (contentType.includes('application/json')) data = await res.json();
    else data = await res.text();
  } catch (err) {
    data = null;
  }
  return { status: res.status, ok: res.ok, data, headers: res.headers };
}

async function request(method, path, { body = null, headers = {} } = {}) {
  const url = buildUrl(path);
  const token = getToken();

  const fetchOptions = {
    method,
    headers: {
      Accept: 'application/json',
      ...headers
    }
  };

  if (token) fetchOptions.headers['Authorization'] = `Bearer ${token}`;

  if (body != null) {
    // if body is FormData, let fetch set the content-type
    if (body instanceof FormData) {
      fetchOptions.body = body;
    } else {
      fetchOptions.headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(body);
    }
  }

  const res = await fetch(url, fetchOptions);

  // If unauthorized, clear local token (helps client-side state)
  if (res.status === 401) clearToken();

  return parseResponse(res);
}

async function get(path, opts) {
  return request('GET', path, opts);
}
async function post(path, body, opts = {}) {
  return request('POST', path, { ...opts, body });
}
async function put(path, body, opts = {}) {
  return request('PUT', path, { ...opts, body });
}
async function del(path, opts) {
  return request('DELETE', path, opts);
}

// Convenience auth helpers. Endpoints are conventional and can be changed when calling.
async function login(credentials, endpoint = '/auth/login') {
  const res = await post(endpoint, credentials);
  // Expect token in res.data.token (common pattern). Adjust to your backend.
  if (res.ok && res.data && res.data.token) setToken(res.data.token);
  return res;
}

async function signup(details, endpoint = '/auth/register') {
  const res = await post(endpoint, details);
  // Optionally set token if backend returns it
  if (res.ok && res.data && res.data.token) setToken(res.data.token);
  return res;
}

export default {
  getToken,
  setToken,
  clearToken,
  request,
  get,
  post,
  put,
  del,
  login,
  signup,
};