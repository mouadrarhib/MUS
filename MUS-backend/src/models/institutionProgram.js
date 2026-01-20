import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const InstitutionProgram = sequelize.define(
  "InstitutionProgram",
  {
    institutionId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      field: "institution_id",
    },
    programId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      field: "program_id",
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
  },
  {
    tableName: "institution_programs",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: false,
  }
);

export default InstitutionProgram;
