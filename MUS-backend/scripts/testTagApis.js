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

const main = async () => {
  await sequelize.authenticate();

  const [resourceTypes] = await sequelize.query("SELECT id FROM public.resource_types ORDER BY id LIMIT 1");
  if (!resourceTypes?.length) throw new Error("No resource_type found in DB");
  const resourceTypeId = resourceTypes[0].id;

  const server = app.listen(5096);
  const baseUrl = "http://127.0.0.1:5096/api";

  try {
    const email = `tags.admin.${Date.now()}@example.com`;
    const password = "TestPass123!";

    console.log("[TagsTest] Registering user", { email });
    const register = await api(baseUrl, "/auth/register", {
      method: "POST",
      body: {
        full_name: "Tags Admin Tester",
        email,
        password,
      },
    });
    if (!register.ok) throw new Error(`Register failed: ${register.status}`);

    console.log("[TagsTest] Login #1");
    const login1 = await api(baseUrl, "/auth/login", {
      method: "POST",
      body: { email, password },
    });
    if (!login1.ok || !login1.json?.data?.token) {
      throw new Error(`Login failed: ${login1.status} ${JSON.stringify(login1.json)}`);
    }

    const token1 = login1.json.data.token;
    const me = await api(baseUrl, "/auth/me", { token: token1 });
    const userId = me?.json?.data?.user?.id;
    if (!userId) throw new Error("Unable to resolve current user ID");

    console.log("[TagsTest] Granting admin role", { userId });
    await ensureAdminRoleForUser(userId);

    console.log("[TagsTest] Login #2 (admin token)");
    const login2 = await api(baseUrl, "/auth/login", {
      method: "POST",
      body: { email, password },
    });
    if (!login2.ok || !login2.json?.data?.token) {
      throw new Error(`Admin login failed: ${login2.status} ${JSON.stringify(login2.json)}`);
    }
    const adminToken = login2.json.data.token;

    console.log("[TagsTest] Creating resource for mapping test");
    const createResource = await api(baseUrl, "/resources", {
      method: "POST",
      token: adminToken,
      body: {
        title: `Tags API Test ${Date.now()}`,
        description: "Resource used to validate tags endpoints",
        educational_type: "notes",
        format: "pdf",
        resource_type_id: resourceTypeId,
      },
    });

    const createdResource = Array.isArray(createResource.json?.data)
      ? createResource.json.data[0]
      : createResource.json?.data;
    const resourceId = createdResource?.id;
    if (!resourceId) {
      throw new Error(`Resource create failed: ${createResource.status} ${JSON.stringify(createResource.json)}`);
    }

    console.log("[TagsTest] Creating tags through API");
    const tagA = await api(baseUrl, "/tags", {
      method: "POST",
      token: adminToken,
      body: {
        name: `University Priority ${Date.now()}`,
        category: "topic",
        description: "Sample tag for recommendations",
      },
    });

    const tagB = await api(baseUrl, "/tags", {
      method: "POST",
      token: adminToken,
      body: {
        name: `Module AI ${Date.now()}`,
        category: "field",
        description: "Sample module-level tag",
      },
    });

    const tagAId = tagA?.json?.data?.id;
    const tagBId = tagB?.json?.data?.id;
    if (!tagA.ok || !tagB.ok || !tagAId || !tagBId) {
      throw new Error(`Tag creation failed: A=${tagA.status}, B=${tagB.status}`);
    }

    console.log("[TagsTest] Listing tags");
    const tagsList = await api(baseUrl, "/tags?limit=10");
    if (!tagsList.ok) throw new Error(`Tag list failed: ${tagsList.status}`);

    console.log("[TagsTest] Replacing resource tags");
    const replace = await api(baseUrl, `/resources/${resourceId}/tags`, {
      method: "PUT",
      token: adminToken,
      body: { tag_ids: [tagAId, tagBId] },
    });
    if (!replace.ok) throw new Error(`Replace tags failed: ${replace.status} ${JSON.stringify(replace.json)}`);

    console.log("[TagsTest] Reading resource tags");
    const resourceTags = await api(baseUrl, `/resources/${resourceId}/tags`, { token: adminToken });
    if (!resourceTags.ok) throw new Error(`Get resource tags failed: ${resourceTags.status}`);

    console.log("[TagsTest] Reading tags map for resources");
    const tagsMap = await api(baseUrl, `/tags/resources-map?resource_ids=${resourceId}`, {
      token: adminToken,
    });
    if (!tagsMap.ok) throw new Error(`Tags map failed: ${tagsMap.status} ${JSON.stringify(tagsMap.json)}`);

    console.log("[TagsTest] Popular tags");
    const popular = await api(baseUrl, "/tags/popular?limit=5");
    if (!popular.ok) throw new Error(`Popular tags failed: ${popular.status}`);

    console.log("[TagsTest] SUCCESS", {
      resourceId,
      createdTagIds: [tagAId, tagBId],
      resourceTagCount: Array.isArray(resourceTags.json?.data) ? resourceTags.json.data.length : 0,
      mapTagCount: Array.isArray(tagsMap.json?.data?.[resourceId]) ? tagsMap.json.data[resourceId].length : 0,
      listCount: Array.isArray(tagsList.json?.data) ? tagsList.json.data.length : 0,
    });
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await sequelize.close();
  }
};

main().catch((error) => {
  console.error("[TagsTest] FAILED", error.message);
  process.exit(1);
});
