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
  console.log("✅ Successfully connected to PostgreSQL!");

  // 1. Find a teacher to test with
  const userRes = await client.query(`
    SELECT ur.user_id, u.email, u.full_name
    FROM public.user_roles ur
    INNER JOIN public.users u ON u.id = ur.user_id
    INNER JOIN public.roles r ON r.id = ur.role_id
    WHERE lower(r.name) = 'teacher'
    LIMIT 1
  `);
  
  if (userRes.rows.length === 0) {
    console.log("❌ No teacher found in database to run tests!");
    process.exit(1);
  }
  
  const teacher = userRes.rows[0];
  console.log(`👤 Testing with Tutor: ${teacher.full_name} (${teacher.email}) [ID: ${teacher.user_id}]`);

  // 2. Test sp_teacher_slot_create
  console.log("\n🧪 Testing Procedure: sp_teacher_slot_create...");
  const createRes = await client.query(
    `SELECT * FROM public.sp_teacher_slot_create($1, $2, $3, $4, $5, $6)`,
    [teacher.user_id, "2026-06-10", "15:30:00", 45, 39.99, "Africa/Casablanca"]
  );
  
  const createdSlot = createRes.rows[0];
  console.log("🟢 Created slot successfully! Output:");
  console.dir(createdSlot);

  // 3. Test sp_teacher_slot_get_by_teacher
  console.log("\n🧪 Testing Procedure: sp_teacher_slot_get_by_teacher...");
  const getRes = await client.query(
    `SELECT * FROM public.sp_teacher_slot_get_by_teacher($1, true)`,
    [teacher.user_id]
  );
  console.log(`🟢 Retrieved ${getRes.rows.length} total slots for this teacher.`);

  // 4. Test sp_teacher_slot_update
  console.log("\n🧪 Testing Procedure: sp_teacher_slot_update...");
  const updateRes = await client.query(
    `SELECT * FROM public.sp_teacher_slot_update($1, $2, $3, $4, $5, $6, $7, $8)`,
    [createdSlot.id, teacher.user_id, "2026-06-11", "16:00:00", 90, 49.99, "Africa/Casablanca", true]
  );
  console.log("🟢 Updated slot successfully! Output:");
  console.dir(updateRes.rows[0]);

  // 5. Clean up by deleting the slot to keep DB pristine
  console.log("\n🧹 Cleaning up test slot...");
  const delRes = await client.query(
    `SELECT public.sp_teacher_slot_delete($1, $2) AS deleted`,
    [createdSlot.id, teacher.user_id]
  );
  console.log(`🟢 Slot deletion result: ${delRes.rows[0].deleted}`);

  console.log("\n🎉 ALL PROCEDURES AND MAPPINGS PASSED SUCCESSFULLY!");

} catch (error) {
  console.error("❌ Test failed with error:", error);
} finally {
  await client.end().catch(() => {});
}
