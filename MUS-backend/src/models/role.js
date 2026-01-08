import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Role = sequelize.define(
    "Role",
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
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "roles",
        timestamps: false,
    }
);

export default Role;