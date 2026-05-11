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

const dates = [
  "2026-05-11",
  "2026-05-12",
  "2026-05-15",
  "2026-05-16",
  "2026-05-20",
  "2026-05-22",
  "2026-05-23",
  "2026-05-26",
  "2026-05-27",
  "2026-05-29",
  "2026-05-30",
];

const timeRanges = [
  { start: "09:00:00", end: "10:00:00" },
  { start: "10:30:00", end: "11:30:00" },
  { start: "12:00:00", end: "13:00:00" },
  { start: "13:30:00", end: "14:30:00" },
  { start: "14:00:00", end: "15:00:00" }, // 02:00 PM
  { start: "15:30:00", end: "16:30:00" },
  { start: "16:30:00", end: "17:30:00" },
  { start: "18:00:00", end: "19:00:00" },
  { start: "19:30:00", end: "20:30:00" },
  { start: "20:00:00", end: "21:00:00" },
  { start: "21:00:00", end: "22:00:00" },
];

try {
  await client.connect();
  console.log("Connected to database.");

  // 1. Locate teacher
  const teacherLookup = await client.query(
    "SELECT id FROM public.users WHERE email = $1 LIMIT 1",
    ["teacher@mus.com"]
  );
  const teacherId = teacherLookup.rows[0]?.id;

  if (!teacherId) {
    throw new Error("Teacher account (teacher@mus.com) not found in the database.");
  }
  console.log(`Found teacher ID: ${teacherId}`);

  // 2. Clear old slots to avoid conflicts
  console.log("Cleaning up old slots...");
  await client.query("DELETE FROM public.teacher_availability_slots WHERE teacher_id = $1", [teacherId]);

  // 3. Insert slots using public.sp_teacher_slot_create stored procedure
  console.log("Seeding slots matching the mockup...");
  let count = 0;
  for (const date of dates) {
    for (const range of timeRanges) {
      await client.query(
        "SELECT * FROM public.sp_teacher_slot_create($1, $2, $3, $4, $5, $6)",
        [teacherId, date, range.start, 60, 25.00, "Africa/Casablanca"]
      );
      count++;
    }
  }

  console.log(`Successfully seeded ${count} slots for teacher@mus.com in May 2026!`);
} catch (error) {
  console.error("Failed to seed slots:", error);
} finally {
  await client.end().catch(() => {});
}
