import authService from "@/services/authService";
import { get, patch } from "@/services/http";

const ADMIN = {
  USERS_OVERVIEW: "/admin/users/overview",
  STUDENTS_SEARCH: "/admin/students/search",
  TOGGLE_STATUS: "/admin/users",
};

const USERS_CACHE_TTL_MS = 5000;
let usersOverviewInFlight = null;
let usersOverviewCache = {
  ts: 0,
  data: null,
};

const clearUsersOverviewCache = () => {
  usersOverviewCache = { ts: 0, data: null };
};

const normalizeUser = (item) => {
  if (!item) return item;

  const rolesValue = Array.isArray(item.roles)
    ? item.roles.join(",")
    : Array.isArray(item.user_roles)
      ? item.user_roles.join(",")
      : item.roles || item.user_roles || "";

  return {
    ...item,
    user_id: item.user_id || item.id,
    full_name: item.full_name || item.name,
    user_created_at: item.user_created_at || item.created_at || item.createdAt,
    roles: rolesValue,
  };
};

const toUsersArray = (payload) => {
  const users = payload?.data?.users;
  if (Array.isArray(users)) return users.map(normalizeUser);
  if (Array.isArray(payload?.data)) return payload.data.map(normalizeUser);
  return [];
};

export const usersService = {
  getAllUsers: async (options = {}) => {
    const { force = false } = options;
    const now = Date.now();

    if (!force && usersOverviewCache.data && now - usersOverviewCache.ts < USERS_CACHE_TTL_MS) {
      return usersOverviewCache.data;
    }

    if (!force && usersOverviewInFlight) {
      return usersOverviewInFlight;
    }

    usersOverviewInFlight = get(ADMIN.USERS_OVERVIEW)
      .then((response) => {
        const data = toUsersArray(response);
        usersOverviewCache = { ts: Date.now(), data };
        return data;
      })
      .finally(() => {
        usersOverviewInFlight = null;
      });

    return usersOverviewInFlight;
  },

  getUserById: async (userId) => {
    const response = await authService.getUserById(userId);
    return normalizeUser(response?.data?.user || response?.data || null);
  },

  updateUser: async (userId, updatedData) => {
    const response = await authService.updateUserById(userId, updatedData);
    clearUsersOverviewCache();
    return normalizeUser(response?.data?.user || response?.data || null);
  },

  deleteUser: async (userId) => {
    const existing = await usersService.getUserById(userId).catch(() => null);
    await authService.removeUserById(userId);
    clearUsersOverviewCache();
    return existing;
  },

  createUser: async (userData) => {
    const fullName = userData.full_name || userData.fullName || "New User";
    const password = userData.password || "TempPass123!";
    const response = await authService.register(userData.email, password, fullName);
    clearUsersOverviewCache();
    return normalizeUser(response?.data?.user || response?.data || null);
  },

  toggleUserStatus: async (userId, isActive) => {
    const response = await patch(`${ADMIN.TOGGLE_STATUS}/${userId}/toggle-status`, {
      is_active: isActive,
    });
    clearUsersOverviewCache();
    return response?.data || null;
  },

  getUserCountByRole: async () => {
    const users = await usersService.getAllUsers();
    return {
      admin: users.filter((u) => String(u.roles || "").toLowerCase().includes("admin")).length,
      teacher: users.filter((u) => String(u.roles || "").toLowerCase().includes("teacher")).length,
      student: users.filter((u) => String(u.roles || "").toLowerCase().includes("student")).length,
    };
  },

  getUserCountByStatus: async () => {
    const users = await usersService.getAllUsers();
    return {
      active: users.filter((u) => Boolean(u.is_active)).length,
      inactive: users.filter((u) => !u.is_active).length,
    };
  },

  searchUsers: async (query) => {
    const response = await get(ADMIN.STUDENTS_SEARCH, { params: { q: query } });
    return response?.data?.students || response?.data || [];
  },
};

export default usersService;
