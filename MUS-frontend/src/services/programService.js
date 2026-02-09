import { del, get, patch, post } from "@/services/http";

const PROGRAMS = "/programs";

export const programService = {
  createProgram: (payload) => post(PROGRAMS, payload),
  getAllPrograms: () => get(PROGRAMS),
  getProgramById: (id) => get(`${PROGRAMS}/${id}`),
  updateProgram: (id, payload) => patch(`${PROGRAMS}/${id}`, payload),
  deleteProgram: (id) => del(`${PROGRAMS}/${id}`),
};

export default programService;
