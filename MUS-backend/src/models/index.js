import sequelize from "../config/database.js";
import User from "./user.js";
import Role from "./role.js";
import UserRole from "./userRole.js";
import InstitutionType from "./institutionType.js";
import Institution from "./institution.js";
import Domain from "./domain.js";
import Program from "./program.js";
import InstitutionProgram from "./institutionProgram.js";
import Level from "./level.js";
import Semester from "./semester.js";

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

InstitutionType.hasMany(Institution, {
  foreignKey: "institutionTypeId",
  as: "institutions",
});

Institution.belongsTo(InstitutionType, {
  foreignKey: "institutionTypeId",
  as: "institutionType",
});

Domain.hasMany(Program, {
  foreignKey: "domainId",
  as: "programs",
});

Program.belongsTo(Domain, {
  foreignKey: "domainId",
  as: "domain",
});

Institution.belongsToMany(Program, {
  through: InstitutionProgram,
  foreignKey: "institutionId",
  otherKey: "programId",
  as: "programs",
});

Program.belongsToMany(Institution, {
  through: InstitutionProgram,
  foreignKey: "programId",
  otherKey: "institutionId",
  as: "institutions",
});

Program.hasMany(Level, {
  foreignKey: "program_id",
  as: "levels",
});

Level.belongsTo(Program, {
  foreignKey: "program_id",
  as: "program",
});

Level.hasMany(Semester, {
  foreignKey: "level_id",
  as: "semesters",
});

Semester.belongsTo(Level, {
  foreignKey: "level_id",
  as: "level",
});

export {
  sequelize,
  User,
  Role,
  UserRole,
  InstitutionType,
  Institution,
  Domain,
  Program,
  InstitutionProgram,
  Level,
  Semester,
};
