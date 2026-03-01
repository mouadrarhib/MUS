import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import app from "../src/app.js";
import { sequelize } from "../src/models/index.js";

const PORT = 5102;
const baseUrl = `http://127.0.0.1:${PORT}/api`;

const api = async (route, { method = "GET", token, body } = {}) => {
  const response = await fetch(`${baseUrl}${route}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  let json = null;
  try {
    json = await response.json();
  } catch {
    json = null;
  }

  return { ok: response.ok, status: response.status, json };
};

const unwrapData = (payload) => payload?.json?.data || null;

const firstOrSelf = (value) => {
  if (Array.isArray(value)) return value[0] || null;
  return value || null;
};

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const runMigration010 = async () => {
  const migrationPath = path.resolve(process.cwd(), "..", "Database", "migrations", "010_add_membership_and_resource_access_tier.sql");
  const sql = await fs.readFile(migrationPath, "utf8");
  await sequelize.query(sql);
};

const ensureAdminRoleForUser = async (userId) => {
  const [roleRows] = await sequelize.query(
    `
    INSERT INTO public.roles(name, description)
    VALUES ('admin', 'Administrator role')
    ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
    RETURNING id
    `
  );
  const roleId = roleRows[0]?.id;

  await sequelize.query(
    `
    INSERT INTO public.user_roles(user_id, role_id)
    VALUES (:user_id, :role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING
    `,
    { replacements: { user_id: userId, role_id: roleId } }
  );
};

const registerAndLogin = async ({ fullName, email, password }) => {
  const register = await api("/auth/register", {
    method: "POST",
    body: {
      full_name: fullName,
      email,
      password,
    },
  });

  assert(register.ok, `Register failed for ${email}: ${register.status}`);

  const login = await api("/auth/login", {
    method: "POST",
    body: { email, password },
  });

  assert(login.ok, `Login failed for ${email}: ${login.status}`);
  const token = unwrapData(login)?.token;
  assert(token, `Missing token for ${email}`);
  return token;
};

const main = async () => {
  await sequelize.authenticate();
  await runMigration010();

  const [resourceTypeRows] = await sequelize.query(
    "SELECT id FROM public.resource_types ORDER BY id ASC LIMIT 1"
  );
  assert(resourceTypeRows?.length, "No resource type found");
  const resourceTypeId = resourceTypeRows[0].id;

  const server = app.listen(PORT);

  try {
    const now = Date.now();
    const password = "TestPass123!";

    const adminEmail = `membership.admin.${now}@example.com`;
    const freeEmail = `membership.free.${now}@example.com`;
    const premiumEmail = `membership.premium.${now}@example.com`;

    const adminTokenInitial = await registerAndLogin({
      fullName: "Membership Admin",
      email: adminEmail,
      password,
    });

    const freeToken = await registerAndLogin({
      fullName: "Membership Free",
      email: freeEmail,
      password,
    });

    const premiumToken = await registerAndLogin({
      fullName: "Membership Premium",
      email: premiumEmail,
      password,
    });

    const adminMe = await api("/auth/me", { token: adminTokenInitial });
    const adminUserId = unwrapData(adminMe)?.user?.id;
    assert(adminUserId, "Unable to resolve admin user id");
    await ensureAdminRoleForUser(adminUserId);

    const adminLogin = await api("/auth/login", {
      method: "POST",
      body: { email: adminEmail, password },
    });
    assert(adminLogin.ok, `Admin relogin failed: ${adminLogin.status}`);
    const adminToken = unwrapData(adminLogin)?.token;
    assert(adminToken, "Missing admin token after role grant");

    const createFree = await api("/resources", {
      method: "POST",
      token: adminToken,
      body: {
        title: `Membership Free Resource ${now}`,
        description: "Free download resource",
        educational_type: "notes",
        format: "pdf",
        resource_type_id: resourceTypeId,
        url: "https://example.com/free.pdf",
        access_tier: "free",
      },
    });
    assert(createFree.ok, `Create free resource failed: ${createFree.status}`);
    const freeResource = firstOrSelf(unwrapData(createFree));
    const freeResourceId = freeResource?.id;
    assert(freeResourceId, "Missing free resource id");

    const createPremium = await api("/resources", {
      method: "POST",
      token: adminToken,
      body: {
        title: `Membership Premium Resource ${now}`,
        description: "Premium download resource",
        educational_type: "notes",
        format: "pdf",
        resource_type_id: resourceTypeId,
        url: "https://example.com/premium.pdf",
        access_tier: "premium",
      },
    });
    assert(createPremium.ok, `Create premium resource failed: ${createPremium.status}`);
    const premiumResource = firstOrSelf(unwrapData(createPremium));
    const premiumResourceId = premiumResource?.id;
    assert(premiumResourceId, "Missing premium resource id");

    const freeDownload = await api(`/resources/${freeResourceId}/download`, {
      method: "POST",
      token: freeToken,
    });
    assert(freeDownload.ok, `Free user cannot download free resource: ${freeDownload.status}`);

    const blockedPremiumDownload = await api(`/resources/${premiumResourceId}/download`, {
      method: "POST",
      token: freeToken,
    });
    assert(blockedPremiumDownload.status === 403, `Expected 403 for free->premium download, got ${blockedPremiumDownload.status}`);
    assert(
      /premium/i.test(blockedPremiumDownload?.json?.message || ""),
      `Expected premium-required message, got: ${blockedPremiumDownload?.json?.message}`
    );

    const premiumMe = await api("/auth/me", { token: premiumToken });
    const premiumUserId = unwrapData(premiumMe)?.user?.id;
    assert(premiumUserId, "Unable to resolve premium user id");

    const assignMembership = await api("/memberships/assign", {
      method: "POST",
      token: adminToken,
      body: {
        user_id: premiumUserId,
        plan_code: "premium_manual",
        notes: "Integration test assignment",
      },
    });
    assert(
      assignMembership.ok,
      `Assign membership failed: ${assignMembership.status} ${JSON.stringify(assignMembership.json)}`
    );

    const premiumMemberDownload = await api(`/resources/${premiumResourceId}/download`, {
      method: "POST",
      token: premiumToken,
    });
    assert(premiumMemberDownload.ok, `Premium user cannot download premium resource: ${premiumMemberDownload.status}`);

    const premiumMembershipMe = await api("/memberships/me", { token: premiumToken });
    assert(premiumMembershipMe.ok, `Membership /me failed: ${premiumMembershipMe.status}`);
    assert(unwrapData(premiumMembershipMe)?.is_premium === true, "Expected premium membership to be active");

    console.log("[MembershipDownloadTest] SUCCESS", {
      free_resource_id: freeResourceId,
      premium_resource_id: premiumResourceId,
      blocked_status: blockedPremiumDownload.status,
      assigned_plan: unwrapData(assignMembership)?.plan_code,
    });
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await sequelize.close();
  }
};

main().catch((error) => {
  console.error("[MembershipDownloadTest] FAILED", error.message);
  process.exit(1);
});
