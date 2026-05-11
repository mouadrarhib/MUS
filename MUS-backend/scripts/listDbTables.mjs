import dotenv from "dotenv";
import pg from "pg";
import { fileURLToPath } from "node:url";

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
  console.log("Connected.");
  const res = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
  );
  console.log("Tables in public schema:");
  console.log(res.rows.map(r => r.table_name));
} catch (err) {
  console.error(err);
} finally {
  await client.end().catch(() => {});
}
