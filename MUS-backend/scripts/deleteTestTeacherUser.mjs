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
  const teacherLookup = await client.query(
    "SELECT id FROM public.users WHERE email = $1 LIMIT 1",
    ["teacher@mus.com"]
  );
  const targetTeacherId = teacherLookup.rows[0]?.id;

  if (!targetTeacherId) {
    throw new Error("Target teacher account not found for resource reassignment");
  }

  await client.query(
    "UPDATE public.resources SET created_by = $1 WHERE created_by = (SELECT id FROM public.users WHERE email = $2 LIMIT 1)",
    [targetTeacherId, "discover.api.teacher@mus.local"]
  );

  const result = await client.query(
    "DELETE FROM public.users WHERE email = $1 RETURNING id, full_name, email",
    ["discover.api.teacher@mus.local"]
  );
  console.log(JSON.stringify(result.rows, null, 2));
} finally {
  await client.end().catch(() => {});
}
