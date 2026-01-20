import { sequelize } from "../models/index.js";
import AppError from "../helpers/appError.js";
import { SQL } from "../snippets/index.js";
import { Program, Domain } from "../models/index.js";

/**
 * Creates a new program.
 * @param {object} data - The program data.
 * @param {string} data.name - The name of the program.
 * @param {number} data.domain_id - The ID of the domain.
 * @returns {Promise<object>} The newly created program.
 * @throws {AppError} If required fields are missing or if the program already exists.
 */
export const createProgram = async ({ name, domain_id }) => {
  if (!name || !domain_id) {
    throw new AppError("Name and domain ID are required", 400);
  }

  try {
    const [rows] = await sequelize.query(SQL.PROGRAM.CREATE, {
      replacements: { name, domain_id },
    });
    return rows[0];
  } catch (error) {
    if (error.original?.code === "23505") {
      throw new AppError("Program already exists for this domain", 409);
    }
    throw error;
  }
};

/**
 * Retrieves all programs.
 * @returns {Promise<Array<object>>} A list of all programs.
 */
export const getAllPrograms = async () => {
  try {
    const [rows] = await sequelize.query(SQL.PROGRAM.GET_ALL);
    return rows;
  } catch (error) {
    if (error.original?.code === "42883") {
      return Program.findAll({
        include: [{ model: Domain, as: "domain" }],
        order: [["name", "ASC"]],
      });
    }
    throw error;
  }
};

/**
 * Retrieves a program by its ID.
 * @param {number} id - The ID of the program.
 * @returns {Promise<object>} The program object.
 * @throws {AppError} If the program is not found.
 */
export const getProgramById = async (id) => {
  try {
    const [rows] = await sequelize.query(SQL.PROGRAM.GET_BY_ID, {
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

  const program = await Program.findByPk(id, {
    include: [{ model: Domain, as: "domain" }],
  });
  if (!program) {
    throw new AppError("Program not found", 404);
  }
  return program.get({ plain: true });
};

/**
 * Updates a program by its ID.
 * @param {number} id - The ID of the program.
 * @param {object} updateData - The data to update.
 * @returns {Promise<object>} The updated program.
 * @throws {AppError} If the program is not found.
 */
export const updateProgramById = async (id, { name, domain_id }) => {
  try {
    const [rows] = await sequelize.query(SQL.PROGRAM.UPDATE, {
      replacements: { id, name, domain_id },
    });
    if (rows.length > 0) {
      return rows[0];
    }
  } catch (error) {
    if (error.original?.code !== "42883") {
      throw error;
    }
  }

  const program = await Program.findByPk(id);
  if (!program) {
    throw new AppError("Program not found", 404);
  }

  await program.update({ name, domainId: domain_id });
  return program.get({ plain: true });
};

/**
 * Deletes a program by its ID.
 * @param {number} id - The ID of the program.
 * @returns {Promise<{message: string}>} A success message.
 * @throws {AppError} If the program is not found.
 */
export const deleteProgramById = async (id) => {
  try {
    await sequelize.query(SQL.PROGRAM.DELETE, {
      replacements: { id },
    });
    return { message: "Program deleted successfully" };
  } catch (error) {
    if (error.original?.code !== "42883") {
      throw error;
    }
  }

  const program = await Program.findByPk(id);
  if (!program) {
    throw new AppError("Program not found", 404);
  }

  await program.destroy();
  return { message: "Program deleted successfully" };
};
