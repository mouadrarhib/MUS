import dotenv from "dotenv";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import pg from "pg";

dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

const { Client } = pg;

const client = new Client({
  database: process.env.DB_NAME || process.env.PGDATABASE,
  user: process.env.DB_USER || process.env.PGUSER,
  password: process.env.DB_PASSWORD || process.env.PGPASSWORD,
  host: process.env.DB_HOST || process.env.PGHOST,
  port: Number(process.env.DB_PORT || process.env.PGPORT || 5432),
});

const sql = readFileSync(
  new URL("../../Database/migrations/012_add_personalization_preferences_and_recommendations.sql", import.meta.url),
  "utf8"
);

try {
  await client.connect();
  await client.query(sql);
  console.log("Personalization routines reapplied successfully.");
} finally {
  await client.end().catch(() => {});
}
