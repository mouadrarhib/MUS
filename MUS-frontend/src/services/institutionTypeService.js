import { del, get, patch, post } from "@/services/http";

const INSTITUTION_TYPES = "/institution-types";

export const institutionTypeService = {
  createInstitutionType: (name) => post(INSTITUTION_TYPES, { name }),
  getAllInstitutionTypes: () => get(INSTITUTION_TYPES),
  getInstitutionTypeById: (id) => get(`${INSTITUTION_TYPES}/${id}`),
  updateInstitutionType: (id, payload) => patch(`${INSTITUTION_TYPES}/${id}`, payload),
  deleteInstitutionType: (id) => del(`${INSTITUTION_TYPES}/${id}`),
};

export default institutionTypeService;
