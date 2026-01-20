import { sequelize } from "../models/index.js";
import AppError from "../helpers/appError.js";
import { SQL } from "../snippets/index.js";
import { Institution, InstitutionType } from "../models/index.js";

/**
 * Creates a new institution.
 * @param {object} data - The institution data.
 * @param {string} data.name - The name of the institution.
 * @param {number} data.institution_type_id - The ID of the institution type.
 * @param {string} [data.country] - The country of the institution.
 * @param {string} [data.city] - The city of the institution.
 * @returns {Promise<object>} The newly created institution.
 * @throws {AppError} If required fields are missing or if the institution already exists.
 */
export const createInstitution = async ({
  name,
  institution_type_id,
  country,
  city,
}) => {
  if (!name || !institution_type_id) {
    throw new AppError("Name and institution type ID are required", 400);
  }

  try {
    const [rows] = await sequelize.query(SQL.INSTITUTION.CREATE, {
      replacements: { name, institution_type_id, country, city },
    });
    return rows[0];
  } catch (error) {
    if (error.original?.code === "23505") {
      throw new AppError("Institution already exists", 409);
    }
    throw error;
  }
};

/**
 * Retrieves all institutions.
 * @returns {Promise<Array<object>>} A list of all institutions.
 */
export const getAllInstitutions = async () => {
  try {
    const [rows] = await sequelize.query(SQL.INSTITUTION.GET_ALL);
    return rows;
  } catch (error) {
    if (error.original?.code === "42883") {
      return Institution.findAll({
        include: [{ model: InstitutionType, as: "institutionType" }],
        order: [["name", "ASC"]],
      });
    }
    throw error;
  }
};

/**
 * Retrieves an institution by its ID.
 * @param {number} id - The ID of the institution.
 * @returns {Promise<object>} The institution object.
 * @throws {AppError} If the institution is not found.
 */
export const getInstitutionById = async (id) => {
  try {
    const [rows] = await sequelize.query(SQL.INSTITUTION.GET_BY_ID, {
      replacements: { id },
    });
    if (rows.length > 0) {
      return rows[0];
    }
  } catch (error) {
    if (error.original?.code !== "42883") {
      throw error;
    }
  }

  const institution = await Institution.findByPk(id, {
    include: [{ model: InstitutionType, as: "institutionType" }],
  });
  if (!institution) {
    throw new AppError("Institution not found", 404);
  }
  return institution.get({ plain: true });
};

/**
 * Updates an institution by its ID.
 * @param {number} id - The ID of the institution.
 * @param {object} updateData - The data to update.
 * @returns {Promise<object>} The updated institution.
 * @throws {AppError} If the institution is not found.
 */
export const updateInstitutionById = async (
  id,
  { name, institution_type_id, country, city }
) => {
  try {
    const [rows] = await sequelize.query(SQL.INSTITUTION.UPDATE, {
      replacements: { id, name, institution_type_id, country, city },
    });
    if (rows.length > 0) {
      return rows[0];
    }
  } catch (error) {
    if (error.original?.code !== "42883") {
      throw error;
    }
  }

  const institution = await Institution.findByPk(id);
  if (!institution) {
    throw new AppError("Institution not found", 404);
  }

  await institution.update({ name, institutionTypeId: institution_type_id, country, city });
  return institution.get({ plain: true });
};

/**
 * Deletes an institution by its ID.
 * @param {number} id - The ID of the institution.
 * @returns {Promise<{message: string}>} A success message.
 * @throws {AppError} If the institution is not found.
 */
export const deleteInstitutionById = async (id) => {
  try {
    await sequelize.query(SQL.INSTITUTION.DELETE, {
      replacements: { id },
    });
    return { message: "Institution deleted successfully" };
  } catch (error) {
    if (error.original?.code !== "42883") {
      throw error;
    }
  }

  const institution = await Institution.findByPk(id);
  if (!institution) {
    throw new AppError("Institution not found", 404);
  }

  await institution.destroy();
  return { message: "Institution deleted successfully" };
};
