import dotenv from "dotenv";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import pg from "pg";

dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

const client = new pg.Client({
  database: process.env.DB_NAME || process.env.PGDATABASE,
  user: process.env.DB_USER || process.env.PGUSER,
  password: process.env.DB_PASSWORD || process.env.PGPASSWORD,
  host: process.env.DB_HOST || process.env.PGHOST,
  port: Number(process.env.DB_PORT || process.env.PGPORT || 5432),
});

const sql = readFileSync(new URL("../../Database/migrations/015_exclude_admin_from_rewards.sql", import.meta.url), "utf8");

try {
  await client.connect();
  await client.query(sql);
  console.log("Contributor rewards policy applied successfully.");
} finally {
  await client.end().catch(() => {});
}
