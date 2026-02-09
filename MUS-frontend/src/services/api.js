import axios from "axios";

const rawBaseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const normalizeBaseURL = (url) => {
  const clean = String(url || "").trim().replace(/\/+$/, "");
  if (!clean) return "http://localhost:5000/api";

  const withProtocol = /^https?:\/\//i.test(clean) ? clean : `http://${clean}`;
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

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Skip redirect for:
      // 1. Email verification requests (skipAuthRedirect flag)
      // 2. Login endpoint (to show error message instead of redirecting)
      // 3. Register endpoint (to show error message instead of redirecting)
      // 4. Already on login or register pages (public auth pages)
      const skipRedirect = error.config?.skipAuthRedirect || 
                          error.config?.url?.includes('/login') ||
                          error.config?.url?.includes('/register');
      
      const isOnPublicAuthPage = window.location.pathname === '/login' || 
                                 window.location.pathname === '/register';
      
      if (!skipRedirect && !isOnPublicAuthPage) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRoles');
        localStorage.removeItem('userData');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
