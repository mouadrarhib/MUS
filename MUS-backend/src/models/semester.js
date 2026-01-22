import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Semester = sequelize.define(
  "Semester",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    level_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'levels',
        key: 'id'
      }
    },
    sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "semesters",
    timestamps: false,
  }
);

export default Semester;
