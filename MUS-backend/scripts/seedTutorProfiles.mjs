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

const isApplyMode = process.argv.includes("--apply");

const toHeadline = (fullName, roles = []) => {
  const roleSet = new Set((roles || []).map((item) => String(item || "").toLowerCase()));
  if (roleSet.has("teacher")) return `${fullName} - Academic Tutor`;
  if (roleSet.has("student")) return `${fullName} - Student Contributor Tutor`;
  return `${fullName} - Tutor`;
};

const toBio = (fullName) =>
  `${fullName} shares structured tutoring support and practical learning guidance for students.`;

const buildSkillSeed = (roles = []) => {
  const roleSet = new Set((roles || []).map((item) => String(item || "").toLowerCase()));
  if (roleSet.has("teacher")) return ["Module Support", "Exam Preparation", "Concept Clarification"];
  return ["Peer Mentoring", "Study Planning", "Problem Solving"];
};

try {
  await client.connect();
  console.log(`Connected to database. Mode: ${isApplyMode ? "APPLY" : "DRY-RUN"}`);

  const candidateSql = `
    SELECT
      u.id,
      u.full_name,
      array_remove(array_agg(DISTINCT lower(r.name)), NULL) AS roles,
      sp.contribution_mode,
      tp.user_id AS has_profile
    FROM public.users u
    LEFT JOIN public.user_roles ur ON ur.user_id = u.id
    LEFT JOIN public.roles r ON r.id = ur.role_id
    LEFT JOIN public.student_profiles sp ON sp.user_id = u.id
    LEFT JOIN public.tutor_profiles tp ON tp.user_id = u.id
    WHERE u.is_active = TRUE
    GROUP BY u.id, u.full_name, sp.contribution_mode, tp.user_id
  `;

  const { rows } = await client.query(candidateSql);
  const candidates = rows.filter((row) => {
    const roles = Array.isArray(row.roles) ? row.roles : [];
    const isTeacher = roles.includes("teacher");
    const isStudentContributor = roles.includes("student") && String(row.contribution_mode || "") === "contributor";
    return (isTeacher || isStudentContributor) && !row.has_profile;
  });

  console.log(`Eligible users without tutor profile: ${candidates.length}`);
  if (candidates.length === 0) {
    console.log("Nothing to backfill.");
    process.exit(0);
  }

  for (const row of candidates) {
    const userId = row.id;
    const fullName = String(row.full_name || "Tutor").trim() || "Tutor";
    const roles = Array.isArray(row.roles) ? row.roles : [];
    const headline = toHeadline(fullName, roles);
    const bio = toBio(fullName);
    const skills = buildSkillSeed(roles);

    console.log(`- ${fullName} (${userId})`);
    console.log(`  roles=${roles.join(", ") || "none"}, contribution_mode=${row.contribution_mode || "n/a"}`);
    console.log(`  headline="${headline}"`);
    console.log(`  skills=${skills.join(" | ")}`);

    if (!isApplyMode) continue;

    await client.query(
      `
      INSERT INTO public.tutor_profiles (
        user_id,
        headline,
        bio,
        years_experience,
        hourly_rate,
        currency,
        response_time_minutes,
        verification_status,
        visibility_status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (user_id)
      DO UPDATE SET
        headline = EXCLUDED.headline,
        bio = EXCLUDED.bio,
        years_experience = COALESCE(public.tutor_profiles.years_experience, EXCLUDED.years_experience),
        hourly_rate = COALESCE(public.tutor_profiles.hourly_rate, EXCLUDED.hourly_rate),
        currency = COALESCE(public.tutor_profiles.currency, EXCLUDED.currency),
        response_time_minutes = COALESCE(public.tutor_profiles.response_time_minutes, EXCLUDED.response_time_minutes),
        updated_at = NOW()
      `,
      [userId, headline, bio, 2, 20, "USD", 180, "unverified", "draft"]
    );

    await client.query("DELETE FROM public.tutor_profile_skills WHERE user_id = $1", [userId]);
    for (let i = 0; i < skills.length; i += 1) {
      await client.query(
        "INSERT INTO public.tutor_profile_skills (user_id, skill_name, sort_order) VALUES ($1, $2, $3)",
        [userId, skills[i], i + 1]
      );
    }
  }

  if (isApplyMode) {
    const verifySql = `
      SELECT visibility_status, COUNT(*)::int AS count
      FROM public.tutor_profiles
      GROUP BY visibility_status
      ORDER BY visibility_status
    `;
    const verify = await client.query(verifySql);
    console.log("Tutor profile visibility counts:");
    console.log(JSON.stringify(verify.rows, null, 2));
  } else {
    console.log("Dry-run completed. Re-run with --apply to persist changes.");
  }
} catch (error) {
  console.error("Failed to backfill tutor profiles:", error);
} finally {
  await client.end().catch(() => {});
}
