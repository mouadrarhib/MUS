import authService from "@/services/authService";
import { get, patch } from "@/services/http";

const ADMIN = {
  USERS_OVERVIEW: "/admin/users/overview",
  STUDENTS_SEARCH: "/admin/students/search",
  TOGGLE_STATUS: "/admin/users",
};

const toUsersArray = (payload) => {
  const users = payload?.data?.users;
  if (Array.isArray(users)) return users;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const usersService = {
  getAllUsers: async () => {
    const response = await get(ADMIN.USERS_OVERVIEW);
    return toUsersArray(response);
  },

  getUserById: async (userId) => {
    const response = await authService.getUserById(userId);
    return response?.data?.user || response?.data || null;
  },

  updateUser: async (userId, updatedData) => {
    const response = await authService.updateUserById(userId, updatedData);
    return response?.data?.user || response?.data || null;
  },

  deleteUser: async (userId) => {
    const existing = await usersService.getUserById(userId).catch(() => null);
    await authService.removeUserById(userId);
    return existing;
  },

  createUser: async (userData) => {
    const fullName = userData.full_name || userData.fullName || "New User";
    const password = userData.password || "TempPass123!";
    const response = await authService.register(userData.email, password, fullName);
    return response?.data?.user || response?.data || null;
  },

  toggleUserStatus: async (userId, isActive) => {
    const response = await patch(`${ADMIN.TOGGLE_STATUS}/${userId}/toggle-status`, {
      is_active: isActive,
    });
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
