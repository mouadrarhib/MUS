import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Domain = sequelize.define(
  "Domain",
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
    tableName: "domains",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: false,
  }
);

export default Domain;
