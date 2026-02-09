import { get, post } from "@/services/http";

const INSTITUTION_PROGRAMS = "/institution-programs";

export const institutionProgramService = {
  addAssociation: (institution_id, program_id) =>
    post(`${INSTITUTION_PROGRAMS}/add`, { institution_id, program_id }),

  removeAssociation: (institution_id, program_id) =>
    post(`${INSTITUTION_PROGRAMS}/remove`, { institution_id, program_id }),

  getProgramsByInstitution: (institutionId) =>
    get(`${INSTITUTION_PROGRAMS}/institutions/${institutionId}/programs`),

  getInstitutionsByProgram: (programId) =>
    get(`${INSTITUTION_PROGRAMS}/programs/${programId}/institutions`),
};

export default institutionProgramService;
