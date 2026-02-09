import { del, get, patch, post } from "@/services/http";

const INSTITUTIONS = "/institutions";

export const institutionService = {
  createInstitution: (payload) => post(INSTITUTIONS, payload),
  getAllInstitutions: () => get(INSTITUTIONS),
  getInstitutionById: (id) => get(`${INSTITUTIONS}/${id}`),
  updateInstitution: (id, payload) => patch(`${INSTITUTIONS}/${id}`, payload),
  deleteInstitution: (id) => del(`${INSTITUTIONS}/${id}`),
};

export default institutionService;
