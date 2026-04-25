import { Sequelize } from "sequelize";

const DATABASE_URL = process.env.DATABASE_URL;

const sequelizeOptions = {
  dialect: "postgres",
  logging: false,
};

let sequelize;

if (DATABASE_URL) {
  sequelize = new Sequelize(DATABASE_URL, {
    ...sequelizeOptions,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else {
  const DB_NAME = process.env.DB_NAME || process.env.PGDATABASE;
  const DB_USER = process.env.DB_USER || process.env.PGUSER;
  const DB_PASSWORD = process.env.DB_PASSWORD || process.env.PGPASSWORD;
  const DB_HOST = process.env.DB_HOST || process.env.PGHOST;
  const DB_PORT = Number(process.env.DB_PORT || process.env.PGPORT || 5432);

  if (!DB_NAME || !DB_USER || !DB_HOST || !DB_PORT) {
    throw new Error("Missing database configuration. Set DATABASE_URL or DB_* or PG* variables in .env");
  }

  if (typeof DB_PASSWORD !== "string") {
    throw new Error("Invalid DB password. Ensure DB_PASSWORD or PGPASSWORD is defined as string");
  }

  sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    ...sequelizeOptions,
    host: DB_HOST,
    port: DB_PORT,
  });
}

export default sequelize;
