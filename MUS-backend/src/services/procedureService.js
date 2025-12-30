import { sequelize } from "../models/index.js";

export const callProcedure = async (procedureName, params = {}) => {
  const placeholders = Object.keys(params)
    .map((key) => `:${key}`)
    .join(", ");
  const sql = `CALL ${procedureName}(${placeholders})`;
  return sequelize.query(sql, { replacements: params });
};
