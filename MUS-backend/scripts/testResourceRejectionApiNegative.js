import "dotenv/config";
import app from "../src/app.js";
import { sequelize } from "../src/models/index.js";

const api = async (baseUrl, path, { method = "GET", token, body } = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
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

const ensureAdminRoleForUser = async (userId) => {
  const [roleRows] = await sequelize.query(
    `
    INSERT INTO public.roles(name, description)
    VALUES ('admin', 'Administrator role')
    ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
    RETURNING id
    `
  );

  const adminRoleId = roleRows[0]?.id;
  await sequelize.query(
    `
    INSERT INTO public.user_roles(user_id, role_id)
    VALUES (:user_id, :role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING
    `,
    { replacements: { user_id: userId, role_id: adminRoleId } }
  );
};

const registerAndLogin = async ({ baseUrl, fullName, email, password }) => {
  await api(baseUrl, "/auth/register", {
    method: "POST",
    body: { full_name: fullName, email, password },
  });

  const login = await api(baseUrl, "/auth/login", {
    method: "POST",
    body: { email, password },
  });

  if (!login.ok || !login.json?.data?.token) {
    throw new Error(`Login failed for ${email}: ${login.status}`);
  }

  return login.json.data.token;
};

const main = async () => {
  await sequelize.authenticate();
  const server = app.listen(5098);
  const baseUrl = "http://127.0.0.1:5098/api";

  try {
    const uploaderEmail = `neg.uploader.${Date.now()}@example.com`;
    const adminEmail = `neg.admin.${Date.now()}@example.com`;
    const password = "TestPass123!";

    const uploaderToken = await registerAndLogin({
      baseUrl,
      fullName: "Negative Uploader",
      email: uploaderEmail,
      password,
    });

    const adminTokenTemp = await registerAndLogin({
      baseUrl,
      fullName: "Negative Admin",
      email: adminEmail,
      password,
    });

    const meAdmin = await api(baseUrl, "/auth/me", { token: adminTokenTemp });
    await ensureAdminRoleForUser(meAdmin.json.data.user.id);

    const adminLogin = await api(baseUrl, "/auth/login", {
      method: "POST",
      body: { email: adminEmail, password },
    });
    const adminToken = adminLogin.json.data.token;

    const [resourceTypes] = await sequelize.query("SELECT id FROM public.resource_types ORDER BY id LIMIT 1");

    const createResource = await api(baseUrl, "/resources", {
      method: "POST",
      token: uploaderToken,
      body: {
        title: `Negative Reject Test ${Date.now()}`,
        description: "negative test resource",
        educational_type: "notes",
        format: "pdf",
        resource_type_id: resourceTypes[0].id,
      },
    });

    const created = Array.isArray(createResource.json?.data)
      ? createResource.json.data[0]
      : createResource.json?.data;
    const resourceId = created?.id;

    const badReason = await api(baseUrl, `/resources/${resourceId}/reject`, {
      method: "POST",
      token: adminToken,
      body: { reason: "bad" },
    });

    const nonAdminRejectionsList = await api(baseUrl, "/resources/rejections", {
      token: uploaderToken,
    });

    console.log("[RejectNegativeTest] RESULT", {
      badReasonStatus: badReason.status,
      badReasonMessage: badReason.json?.message,
      nonAdminRejectionsStatus: nonAdminRejectionsList.status,
      nonAdminRejectionsMessage: nonAdminRejectionsList.json?.message,
    });
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await sequelize.close();
  }
};

main().catch((error) => {
  console.error("[RejectNegativeTest] FAILED", error.message);
  process.exit(1);
});
