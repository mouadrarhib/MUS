import dotenv from "dotenv";
import pg from "pg";
import fs from "fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

const client = new pg.Client({
  database: process.env.DB_NAME || process.env.PGDATABASE,
  user: process.env.DB_USER || process.env.PGUSER,
  password: process.env.DB_PASSWORD || process.env.PGPASSWORD,
  host: process.env.DB_HOST || process.env.PGHOST,
  port: Number(process.env.DB_PORT || process.env.PGPORT || 5432),
});

try {
  await client.connect();
  console.log("Connected to database.");

  const migrationPath = fileURLToPath(new URL("../../Database/migrations/028_simplify_tutor_slots_schema.sql", import.meta.url));
  console.log(`Reading migration SQL from: ${migrationPath}`);
  const sql = fs.readFileSync(migrationPath, "utf8");

  console.log("Executing migration SQL...");
  await client.query(sql);
  console.log("Migration executed successfully!");
} catch (error) {
  console.error("Migration failed:", error);
} finally {
  await client.end().catch(() => {});
}
