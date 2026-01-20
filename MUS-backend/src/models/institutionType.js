import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const InstitutionType = sequelize.define(
  "InstitutionType",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
  },
  {
    tableName: "institution_types",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: false,
  }
);

export default InstitutionType;
