import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const UserRole = sequelize.define(
  "UserRole",
  {
    user_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    role_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
    },
    assigned_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "user_roles",
    timestamps: false,
  }
);

export default UserRole;
