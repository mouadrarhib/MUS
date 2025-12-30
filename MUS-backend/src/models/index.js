import sequelize from "../config/database.js";
import User from "./user.js";
import Role from "./role.js";
import UserRole from "./userRole.js";

User.belongsToMany(Role, {
  through: UserRole,
  foreignKey: "user_id",
  otherKey: "role_id",
});

Role.belongsToMany(User, {
  through: UserRole,
  foreignKey: "role_id",
  otherKey: "user_id",
});

export { sequelize, User, Role, UserRole };
