import { patch, get } from "@/services/http";

const NOTIFICATIONS_BASE = "/notifications";

const rawBaseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const normalizeApiBaseURL = (url) => {
  const clean = String(url || "").trim().replace(/\/+$/, "");
  if (!clean) return "http://localhost:5000/api";
  const withProtocol = /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
  return withProtocol.endsWith("/api") ? withProtocol : `${withProtocol}/api`;
};

const apiBaseURL = normalizeApiBaseURL(rawBaseURL);

const toBoolParam = (value) => (value ? "true" : "false");

const notificationService = {
  list: async ({ unreadOnly = false, page = 1, limit = 20 } = {}) => {
    const response = await get(NOTIFICATIONS_BASE, {
      params: {
        unread_only: toBoolParam(Boolean(unreadOnly)),
        page,
        limit,
      },
    });

    const data = response?.data || {};
    return {
      page: Number(data.page || page),
      limit: Number(data.limit || limit),
      rows: Array.isArray(data.rows) ? data.rows : [],
    };
  },

  markRead: async (notificationId) => {
    const response = await patch(`${NOTIFICATIONS_BASE}/${notificationId}/read`);
    return response?.data || null;
  },

  clearAll: async () => {
    const response = await patch(`${NOTIFICATIONS_BASE}/clear`);
    return response?.data || { cleared_count: 0 };
  },

  openStream: ({ onNotification, onError } = {}) => {
    if (typeof window === "undefined" || typeof EventSource === "undefined") {
      return () => {};
    }

    const source = new EventSource(`${apiBaseURL}/notifications/stream`, {
      withCredentials: true,
    });

    const handleNotification = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        onNotification?.(parsed);
      } catch {
        // Ignore malformed events
      }
    };

    const handleError = () => {
      onError?.();
    };

    source.addEventListener("notification", handleNotification);
    source.addEventListener("error", handleError);

    return () => {
      source.removeEventListener("notification", handleNotification);
      source.removeEventListener("error", handleError);
      source.close();
    };
  },
};

export default notificationService;
