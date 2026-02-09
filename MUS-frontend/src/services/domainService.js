import { del, get, patch, post } from "@/services/http";

const DOMAINS = "/domains";

export const domainService = {
  createDomain: (name) => post(DOMAINS, { name }),
  getAllDomains: () => get(DOMAINS),
  getDomainById: (id) => get(`${DOMAINS}/${id}`),
  updateDomain: (id, payload) => patch(`${DOMAINS}/${id}`, payload),
  deleteDomain: (id) => del(`${DOMAINS}/${id}`),

  getDomainByName: (name) => get(`${DOMAINS}/name/${encodeURIComponent(name)}`),
  searchDomains: (searchTerm) => get(`${DOMAINS}/search/${encodeURIComponent(searchTerm)}`),
  getDomainsWithProgramCount: () => get(`${DOMAINS}/with-program-count`),
  getDomainWithPrograms: (id) => get(`${DOMAINS}/${id}/with-programs`),
  getDomainPrograms: (id) => get(`${DOMAINS}/${id}/programs`),
  countDomainPrograms: (id) => get(`${DOMAINS}/${id}/programs/count`),
};

export default domainService;
