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
  const users = await client.query(
    `
    SELECT u.id, u.full_name, u.email, r.name AS role_name, u.is_active
    FROM public.users u
    LEFT JOIN public.user_roles ur ON ur.user_id = u.id
    LEFT JOIN public.roles r ON r.id = ur.role_id
    ORDER BY u.full_name ASC
    `
  );
  const adminCount = await client.query(
    `
    SELECT COUNT(*)::int AS count
    FROM public.user_roles ur
    INNER JOIN public.roles r ON r.id = ur.role_id
    WHERE lower(r.name) = 'admin'
    `
  );

  console.log(JSON.stringify({ users: users.rows, adminCount: adminCount.rows[0]?.count || 0 }, null, 2));
} finally {
  await client.end().catch(() => {});
}
