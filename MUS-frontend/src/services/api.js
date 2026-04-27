import axios from "axios";

const rawBaseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const normalizeBaseURL = (url) => {
  const clean = String(url || "").trim().replace(/\/+$/, "");
  if (!clean) return "http://localhost:5000/api";

  const withProtocol = /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
  return withProtocol.endsWith("/api") ? withProtocol : `${withProtocol}/api`;
};

const baseURL = normalizeBaseURL(rawBaseURL);

const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const shouldTrackDiscoverRequest = () => {
  try {
    return window.location.pathname.startsWith('/discover');
  } catch {
    return false;
  }
};

const pushDiscoverTrace = (entry) => {
  if (!shouldTrackDiscoverRequest()) return;
  if (typeof window === 'undefined') return;

  const store = Array.isArray(window.__musDiscoverApiTrace) ? window.__musDiscoverApiTrace : [];
  store.push(entry);
  window.__musDiscoverApiTrace = store;

  if (import.meta.env.DEV) {
    const row = {
      method: entry.method,
      url: entry.url,
      status: entry.status,
      duration_ms: entry.duration_ms,
      request_id: entry.request_id || '-',
    };
    console.debug('[discover-api]', row);
  }
};

apiClient.interceptors.request.use(
  (config) => {
    config.metadata = {
      ...(config.metadata || {}),
      startTime: Date.now(),
    };

    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    const startTime = Number(response?.config?.metadata?.startTime || Date.now());
    pushDiscoverTrace({
      method: String(response?.config?.method || 'GET').toUpperCase(),
      url: response?.config?.url || '',
      status: Number(response?.status || 0),
      duration_ms: Math.max(Date.now() - startTime, 0),
      request_id: response?.headers?.['x-request-id'] || null,
    });
    return response;
  },
  (error) => {
    const startTime = Number(error?.config?.metadata?.startTime || Date.now());
    pushDiscoverTrace({
      method: String(error?.config?.method || 'GET').toUpperCase(),
      url: error?.config?.url || '',
      status: Number(error?.response?.status || 0),
      duration_ms: Math.max(Date.now() - startTime, 0),
      request_id: error?.response?.headers?.['x-request-id'] || null,
    });

    if (error.response?.status === 401) {
      // Skip redirect for:
      // 1. Email verification requests (skipAuthRedirect flag)
      // 2. Login endpoint (to show error message instead of redirecting)
      // 3. Register endpoint (to show error message instead of redirecting)
      // 4. Already on public pages (home/login/register)
      const skipRedirect = error.config?.skipAuthRedirect ||
        error.config?.url?.includes('/login') ||
        error.config?.url?.includes('/register');

      const isOnPublicPage =
        window.location.pathname === '/' ||
        window.location.pathname === '/login' ||
        window.location.pathname === '/register';

      if (!skipRedirect && !isOnPublicPage) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRoles');
        localStorage.removeItem('userData');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
