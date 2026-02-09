import { del, get, patch, post } from "@/services/http";

const ROLES = "/roles";

export const roleService = {
  createRole: (payload) => post(ROLES, payload),
  getAllRoles: () => get(ROLES),
  getRoleById: (id) => get(`${ROLES}/${id}`),
  updateRole: (id, payload) => patch(`${ROLES}/${id}`, payload),
  deleteRole: (id) => del(`${ROLES}/${id}`),
};

export default roleService;
