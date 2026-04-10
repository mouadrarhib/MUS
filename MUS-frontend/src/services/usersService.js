import authService from "@/services/authService";
import { get, patch, post } from "@/services/http";
import roleService from "@/services/roleService";
import userRoleService from "@/services/userRoleService";

const ADMIN = {
  CREATE_USER: "/admin/users",
  USERS_OVERVIEW: "/admin/users/overview",
  USERS_POINTS: "/admin/users/points",
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

const normalizeRoleName = (value) => String(value || "").trim().toLowerCase();

const normalizeRole = (role) => {
  if (!role) return null;
  return {
    ...role,
    id: Number(role.id),
    name: normalizeRoleName(role.name),
  };
};

const toRolesArray = (payload) => {
  const roles = payload?.data;
  if (Array.isArray(roles)) return roles.map(normalizeRole).filter(Boolean);
  return [];
};

const toUserRolesArray = (payload) => {
  const roles = payload?.data;
  if (Array.isArray(roles)) return roles.map(normalizeRole).filter(Boolean);
  return [];
};

const normalizeUser = (item) => {
  if (!item) return item;

  const rolesValue = Array.isArray(item.roles)
    ? item.roles.join(",")
    : Array.isArray(item.user_roles)
      ? item.user_roles.join(",")
      : item.roles || item.user_roles || item.role_name || item.primary_role || "";

  const primaryRole = normalizeRoleName(
    item.primary_role
      || item.role_name
      || (Array.isArray(item.roles) ? item.roles[0] : String(rolesValue || "").split(",")[0])
  );

  return {
    ...item,
    user_id: item.user_id || item.id,
    full_name: item.full_name || item.name,
    user_created_at: item.user_created_at || item.created_at || item.createdAt,
    roles: rolesValue,
    primary_role: primaryRole,
    points: Number(item.points || 0),
    total_resources_created: Number(item.total_resources_created || 0),
    total_favorites_received: Number(item.total_favorites_received || 0),
    total_points_from_events: Number(item.total_points_from_events || 0),
    points_from_downloads: Number(item.points_from_downloads || 0),
    points_from_favorites: Number(item.points_from_favorites || 0),
    points_last_30_days: Number(item.points_last_30_days || 0),
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
    const response = await post(ADMIN.CREATE_USER, {
      email: userData.email,
      password: userData.password,
      full_name: userData.full_name || userData.fullName || "New User",
      role_name: normalizeRoleName(userData.role_name || userData.primary_role || userData.role),
      ...(userData.institution_id ? { institution_id: Number(userData.institution_id) } : {}),
      ...(userData.program_id ? { program_id: Number(userData.program_id) } : {}),
      ...(userData.level_id ? { level_id: Number(userData.level_id) } : {}),
      ...(userData.current_semester_id ? { current_semester_id: Number(userData.current_semester_id) } : {}),
      ...(Array.isArray(userData.preferred_tag_ids) ? { preferred_tag_ids: userData.preferred_tag_ids } : {}),
    });
    clearUsersOverviewCache();
    return normalizeUser(response?.data?.user || response?.data || null);
  },

  createAdminManagedUser: (userData) => usersService.createUser(userData),

  getAllRoles: async () => {
    const response = await roleService.getAllRoles();
    return toRolesArray(response);
  },

  getUserRoles: async (userId) => {
    const response = await userRoleService.getUserRoles(userId);
    return toUserRolesArray(response);
  },

  syncSingleRole: async (userId, nextRoleName) => {
    const [rolesCatalog, currentRoles] = await Promise.all([
      usersService.getAllRoles(),
      usersService.getUserRoles(userId),
    ]);

    const targetRole = rolesCatalog.find((role) => normalizeRoleName(role.name) === normalizeRoleName(nextRoleName));
    if (!targetRole) {
      throw new Error("Target role not found");
    }

    const currentRole = currentRoles[0] || null;
    if (currentRole && Number(currentRole.id) === Number(targetRole.id)) {
      return currentRole;
    }

    if (!currentRole) {
      return userRoleService.assignUserRole(userId, Number(targetRole.id));
    }

    return userRoleService.updateUserRole(userId, Number(currentRole.id), Number(targetRole.id));
  },

  toggleUserStatus: async (userId, isActive) => {
    const response = await patch(`${ADMIN.TOGGLE_STATUS}/${userId}/toggle-status`, {
      is_active: isActive,
    });
    clearUsersOverviewCache();
    return response?.data || null;
  },

  getUsersPointsOverview: async ({ includeAdmin = false } = {}) => {
    const response = await get(ADMIN.USERS_POINTS, {
      params: { include_admin: includeAdmin },
    });
    const users = response?.data?.users;
    return Array.isArray(users) ? users.map(normalizeUser) : [];
  },

  getRewardsAnalytics: async () => {
    const response = await get('/admin/rewards/analytics');
    return {
      overview: response?.data?.overview || {},
      contributors: Array.isArray(response?.data?.contributors) ? response.data.contributors.map(normalizeUser) : [],
      top_resources: Array.isArray(response?.data?.top_resources) ? response.data.top_resources : [],
      recent_activity: Array.isArray(response?.data?.recent_activity) ? response.data.recent_activity : [],
      generated_at: response?.data?.generated_at || null,
    };
  },

  adjustUserPoints: async (userId, { points_delta, note }) => {
    const response = await patch(`${ADMIN.TOGGLE_STATUS}/${userId}/points`, {
      points_delta,
      note,
    });
    clearUsersOverviewCache();
    return response?.data || response || null;
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
