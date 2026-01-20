import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Program = sequelize.define(
  "Program",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    domainId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "domain_id",
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
  },
  {
    tableName: "programs",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: false,
    uniqueKeys: {
      unique_program: {
        fields: ["domain_id", "name"],
      },
    },
  }
);

export default Program;
