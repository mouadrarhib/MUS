import { get, patch, post } from "@/services/http";

const USER_ROLES = "/user-roles";

export const userRoleService = {
  assignUserRole: (userId, roleId) => post(`${USER_ROLES}/assign`, { userId, roleId }),
  removeUserRole: (userId, roleId) => post(`${USER_ROLES}/remove`, { userId, roleId }),
  getUserRoles: (userId) => get(`${USER_ROLES}/${userId}`),
  updateUserRole: (userId, oldRoleId, newRoleId) =>
    patch(`${USER_ROLES}/${userId}`, { oldRoleId, newRoleId }),
};

export default userRoleService;
