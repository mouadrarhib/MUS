import { sequelize } from "../models/index.js";
import AppError from "../helpers/appError.js";
import { SQL } from "../snippets/index.js";
import { InstitutionType } from "../models/index.js";

/**
 * Creates a new institution type.
 * @param {string} name - The name of the institution type.
 * @returns {Promise<object>} The newly created institution type.
 * @throws {AppError} If the name is not provided or already exists.
 */
export const createInstitutionType = async ({ name }) => {
  if (!name) {
    throw new AppError("Institution type name is required", 400);
  }

  try {
    const [rows] = await sequelize.query(SQL.INSTITUTION_TYPE.CREATE, {
      replacements: { name },
    });
    return rows[0];
  } catch (error) {
    if (error.original?.code === "23505") {
      throw new AppError("Institution type name already exists", 409);
    }
    throw error;
  }
};

/**
 * Retrieves all institution types.
 * @returns {Promise<Array<object>>} A list of all institution types.
 */
export const getAllInstitutionTypes = async () => {
  try {
    const [rows] = await sequelize.query(SQL.INSTITUTION_TYPE.GET_ALL);
    return rows;
  } catch (error) {
    // If stored procedure doesn't exist, fallback to Sequelize
    if (error.original?.code === "42883") {
      return InstitutionType.findAll({ order: [["name", "ASC"]] });
    }
    throw error;
  }
};

/**
 * Retrieves an institution type by its ID.
 * @param {number} id - The ID of the institution type.
 * @returns {Promise<object>} The institution type object.
 * @throws {AppError} If the institution type is not found.
 */
export const getInstitutionTypeById = async (id) => {
  try {
    const [rows] = await sequelize.query(SQL.INSTITUTION_TYPE.GET_BY_ID, {
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

  const institutionType = await InstitutionType.findByPk(id);
  if (!institutionType) {
    throw new AppError("Institution type not found", 404);
  }
  return institutionType.get({ plain: true });
};

/**
 * Updates an institution type by its ID.
 * @param {number} id - The ID of the institution type.
 * @param {object} updateData - The data to update.
 * @param {string} updateData.name - The new name for the institution type.
 * @returns {Promise<object>} The updated institution type.
 * @throws {AppError} If the institution type is not found.
 */
export const updateInstitutionTypeById = async (id, { name }) => {
  try {
    const [rows] = await sequelize.query(SQL.INSTITUTION_TYPE.UPDATE, {
      replacements: { id, name },
    });
    if (rows.length > 0) {
      return rows[0];
    }
  } catch (error) {
    if (error.original?.code !== "42883") {
      throw error;
    }
  }

  const institutionType = await InstitutionType.findByPk(id);
  if (!institutionType) {
    throw new AppError("Institution type not found", 404);
  }

  if (name) {
    institutionType.name = name;
  }

  await institutionType.save();
  return institutionType.get({ plain: true });
};

/**
 * Deletes an institution type by its ID.
 * @param {number} id - The ID of the institution type.
 * @returns {Promise<{message: string}>} A success message.
 * @throws {AppError} If the institution type is not found.
 */
export const deleteInstitutionTypeById = async (id) => {
  try {
    await sequelize.query(SQL.INSTITUTION_TYPE.DELETE, {
      replacements: { id },
    });
    return { message: "Institution type deleted successfully" };
  } catch (error) {
    if (error.original?.code !== "42883") {
      throw error;
    }
  }

  const institutionType = await InstitutionType.findByPk(id);
  if (!institutionType) {
    throw new AppError("Institution type not found", 404);
  }

  await institutionType.destroy();
  return { message: "Institution type deleted successfully" };
};
