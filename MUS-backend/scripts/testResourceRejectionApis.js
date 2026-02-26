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
  if (!adminRoleId) {
    throw new Error("Unable to resolve admin role id");
  }

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
    throw new Error(`Login failed for ${email}: ${login.status} ${JSON.stringify(login.json)}`);
  }

  return login.json.data.token;
};

const main = async () => {
  await sequelize.authenticate();

  const [resourceTypes] = await sequelize.query("SELECT id FROM public.resource_types ORDER BY id LIMIT 1");
  if (!resourceTypes?.length) throw new Error("No resource type found");

  const server = app.listen(5097);
  const baseUrl = "http://127.0.0.1:5097/api";

  try {
    const uploaderEmail = `reject.uploader.${Date.now()}@example.com`;
    const adminEmail = `reject.admin.${Date.now()}@example.com`;
    const password = "TestPass123!";

    console.log("[RejectTest] Creating uploader account");
    const uploaderToken = await registerAndLogin({
      baseUrl,
      fullName: "Reject Uploader",
      email: uploaderEmail,
      password,
    });

    console.log("[RejectTest] Creating admin account");
    const adminTokenTemp = await registerAndLogin({
      baseUrl,
      fullName: "Reject Admin",
      email: adminEmail,
      password,
    });

    const meAdmin = await api(baseUrl, "/auth/me", { token: adminTokenTemp });
    const adminUserId = meAdmin?.json?.data?.user?.id;
    if (!adminUserId) throw new Error("Cannot resolve admin user id");

    await ensureAdminRoleForUser(adminUserId);

    const adminLogin = await api(baseUrl, "/auth/login", {
      method: "POST",
      body: { email: adminEmail, password },
    });
    if (!adminLogin.ok || !adminLogin.json?.data?.token) {
      throw new Error(`Admin login failed: ${adminLogin.status} ${JSON.stringify(adminLogin.json)}`);
    }
    const adminToken = adminLogin.json.data.token;

    console.log("[RejectTest] Uploader creates resource");
    const createResource = await api(baseUrl, "/resources", {
      method: "POST",
      token: uploaderToken,
      body: {
        title: `Reject Flow Test ${Date.now()}`,
        description: "Resource for rejection flow validation",
        educational_type: "notes",
        format: "pdf",
        resource_type_id: resourceTypes[0].id,
      },
    });

    const createdResource = Array.isArray(createResource.json?.data)
      ? createResource.json.data[0]
      : createResource.json?.data;
    const resourceId = createdResource?.id;
    if (!createResource.ok || !resourceId) {
      throw new Error(`Resource create failed: ${createResource.status} ${JSON.stringify(createResource.json)}`);
    }

    console.log("[RejectTest] Admin rejects resource with reason");
    const reject = await api(baseUrl, `/resources/${resourceId}/reject`, {
      method: "POST",
      token: adminToken,
      body: {
        reason: "Quality is too low for publication",
      },
    });

    if (!reject.ok) {
      throw new Error(`Reject failed: ${reject.status} ${JSON.stringify(reject.json)}`);
    }

    console.log("[RejectTest] Uploader reads my-rejections");
    const myRejections = await api(baseUrl, "/resources/my-rejections?limit=20", {
      token: uploaderToken,
    });
    if (!myRejections.ok) {
      throw new Error(`my-rejections failed: ${myRejections.status} ${JSON.stringify(myRejections.json)}`);
    }

    console.log("[RejectTest] Admin reads all rejections");
    const allRejections = await api(baseUrl, "/resources/rejections?limit=20", {
      token: adminToken,
    });
    if (!allRejections.ok) {
      throw new Error(`rejections list failed: ${allRejections.status} ${JSON.stringify(allRejections.json)}`);
    }

    const myCount = Array.isArray(myRejections.json?.data) ? myRejections.json.data.length : 0;
    const allCount = Array.isArray(allRejections.json?.data) ? allRejections.json.data.length : 0;

    console.log("[RejectTest] SUCCESS", {
      resourceId,
      rejectionId: reject.json?.data?.rejection_id,
      myRejections: myCount,
      allRejections: allCount,
    });
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await sequelize.close();
  }
};

main().catch((error) => {
  console.error("[RejectTest] FAILED", error.message);
  process.exit(1);
});
