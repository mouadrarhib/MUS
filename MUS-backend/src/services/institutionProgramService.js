import { sequelize } from "../models/index.js";
import AppError from "../helpers/appError.js";
import { SQL } from "../snippets/index.js";
import {
  Institution,
  Program,
  InstitutionProgram,
} from "../models/index.js";

/**
 * Adds a program to an institution.
 * @param {object} data - The association data.
 * @param {number} data.institution_id - The ID of the institution.
 * @param {number} data.program_id - The ID of the program.
 * @returns {Promise<object>} The newly created association.
 * @throws {AppError} If the association already exists.
 */
export const addProgramToInstitution = async ({
  institution_id,
  program_id,
}) => {
  try {
    const [rows] = await sequelize.query(SQL.INSTITUTION_PROGRAM.ADD, {
      replacements: { institution_id, program_id },
    });
    return rows[0];
  } catch (error) {
    if (error.original?.code === "42702") {
      const [rows] = await sequelize.query(
        `
        INSERT INTO public.institution_programs (institution_id, program_id)
        VALUES (:institution_id, :program_id)
        ON CONFLICT ON CONSTRAINT institution_programs_pkey
        DO UPDATE SET created_at = institution_programs.created_at
        RETURNING institution_id, program_id, created_at
        `,
        {
          replacements: { institution_id, program_id },
        }
      );

      return rows[0];
    }

    if (error.original?.code === "23505") {
      throw new AppError("Program already associated with institution", 409);
    }
    throw error;
  }
};

/**
 * Removes a program from an institution.
 * @param {object} data - The association data.
 * @param {number} data.institution_id - The ID of the institution.
 * @param {number} data.program_id - The ID of the program.
 * @returns {Promise<{message: string}>} A success message.
 */
export const removeProgramFromInstitution = async ({
  institution_id,
  program_id,
}) => {
  try {
    await sequelize.query(SQL.INSTITUTION_PROGRAM.REMOVE, {
      replacements: { institution_id, program_id },
    });
    return { message: "Program removed from institution successfully" };
  } catch (error) {
    if (error.original?.code !== "42883") {
      throw error;
    }
  }

  const result = await InstitutionProgram.destroy({
    where: { institutionId: institution_id, programId: program_id },
  });

  if (result === 0) {
    throw new AppError("Association not found", 404);
  }

  return { message: "Program removed from institution successfully" };
};

/**
 * Retrieves all programs for a given institution.
 * @param {number} institution_id - The ID of the institution.
 * @returns {Promise<Array<object>>} A list of programs.
 */
export const getProgramsByInstitution = async (institution_id) => {
  try {
    const [rows] = await sequelize.query(
      SQL.INSTITUTION_PROGRAM.GET_BY_INSTITUTION,
      {
        replacements: { institution_id },
      }
    );
    return rows;
  } catch (error) {
    if (error.original?.code !== "42883") {
      throw error;
    }
  }

  const institution = await Institution.findByPk(institution_id, {
    include: [{ model: Program, as: "programs" }],
  });

  if (!institution) {
    throw new AppError("Institution not found", 404);
  }

  return institution.programs;
};

/**
 * Retrieves all institutions for a given program.
 * @param {number} program_id - The ID of the program.
 * @returns {Promise<Array<object>>} A list of institutions.
 */
export const getInstitutionsByProgram = async (program_id) => {
  try {
    const [rows] = await sequelize.query(
      SQL.INSTITUTION_PROGRAM.GET_BY_PROGRAM,
      {
        replacements: { program_id },
      }
    );
    return rows;
  } catch (error) {
    if (error.original?.code !== "42883") {
      throw error;
    }
  }

  const program = await Program.findByPk(program_id, {
    include: [{ model: Institution, as: "institutions" }],
  });

  if (!program) {
    throw new AppError("Program not found", 404);
  }

  return program.institutions;
};
