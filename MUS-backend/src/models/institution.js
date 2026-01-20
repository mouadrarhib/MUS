import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Institution = sequelize.define(
  "Institution",
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
    institutionTypeId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "institution_type_id",
    },
    country: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    city: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
  },
  {
    tableName: "institutions",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: false,
    uniqueKeys: {
      unique_institution: {
        fields: ["name", "country", "city"],
      },
    },
  }
);

export default Institution;
