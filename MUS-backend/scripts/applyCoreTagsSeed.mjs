import dotenv from "dotenv";
import { readFileSync } from "node:fs";
import pg from "pg";
import { fileURLToPath } from "node:url";

dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

const { Client } = pg;

const client = new Client({
  database: process.env.DB_NAME || process.env.PGDATABASE,
  user: process.env.DB_USER || process.env.PGUSER,
  password: process.env.DB_PASSWORD || process.env.PGPASSWORD,
  host: process.env.DB_HOST || process.env.PGHOST,
  port: Number(process.env.DB_PORT || process.env.PGPORT || 5432),
});

const seedPath = new URL("../../Database/seeds/002_seed_core_business_tags.sql", import.meta.url);
const sql = readFileSync(seedPath, "utf8");

try {
  await client.connect();
  await client.query(sql);

  const result = await client.query(
    `SELECT slug
     FROM public.tags
     WHERE slug = ANY($1::text[])
     ORDER BY slug ASC`,
    [["lecture-notes", "past-exams", "solved-exercises", "module-summary", "lab-reports"]]
  );

  console.log(`Seed applied successfully. Tags present: ${result.rows.length}`);
} finally {
  await client.end().catch(() => {});
}
