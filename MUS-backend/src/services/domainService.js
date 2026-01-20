import { sequelize } from "../models/index.js";
import { SQL } from "../snippets/index.js";

const Domain = sequelize.models.Domain;

export const createDomain = async (name) => {
    const [results] = await sequelize.query(SQL.DOMAIN.CREATE, {
        replacements: { name },
    });
    return results;
};

export const getAllDomains = async () => {
    const [results] = await sequelize.query(SQL.DOMAIN.GET_ALL);
    return results;
};

export const getDomainById = async (id) => {
    const [results] = await sequelize.query(SQL.DOMAIN.GET_BY_ID, {
        replacements: { id },
    });
    return results.length > 0 ? results[0] : null;
};

export const updateDomain = async (id, name) => {
    const [results] = await sequelize.query(SQL.DOMAIN.UPDATE, {
        replacements: { id, name },
    });
    return results;
};

export const deleteDomain = async (id) => {
    await sequelize.query(SQL.DOMAIN.DELETE, {
        replacements: { id },
    });
};

export const getDomainByName = async (name) => {
    const [results] = await sequelize.query(SQL.DOMAIN.GET_BY_NAME, {
        replacements: { name },
    });
    return results.length > 0 ? results[0] : null;
};

export const searchDomains = async (searchTerm) => {
    const [results] = await sequelize.query(SQL.DOMAIN.SEARCH, {
        replacements: { search_term: searchTerm },
    });
    return results;
};

export const getDomainsWithProgramCount = async () => {
    const [results] = await sequelize.query(SQL.DOMAIN.GET_WITH_PROGRAM_COUNT);
    return results;
};

export const getDomainByIdWithPrograms = async (id) => {
    const [results] = await sequelize.query(SQL.DOMAIN.GET_BY_ID_WITH_PROGRAMS, {
        replacements: { id },
    });
    return results.length > 0 ? results[0] : null;
};

export const getDomainPrograms = async (domainId) => {
    const [results] = await sequelize.query(SQL.DOMAIN.GET_PROGRAMS, {
        replacements: { domain_id: domainId },
    });
    return results;
};

export const countDomainPrograms = async (domainId) => {
    const [results] = await sequelize.query(SQL.DOMAIN.COUNT_PROGRAMS, {
        replacements: { domain_id: domainId },
    });
    return results.length > 0 ? results[0] : null;
};