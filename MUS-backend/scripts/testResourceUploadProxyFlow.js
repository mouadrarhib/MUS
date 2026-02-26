import "dotenv/config";
import app from "../src/app.js";
import { sequelize } from "../src/models/index.js";

const api = async (baseUrl, path, { method = "GET", token, body, headers = {} } = {}) => {
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(token ? { Cookie: `auth_token=${token}` } : {}),
      ...(!isFormData && body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    ...(body ? { body: isFormData ? body : JSON.stringify(body) } : {}),
  });

  let json = null;
  try {
    json = await response.json();
  } catch {
    json = null;
  }

  return { ok: response.ok, status: response.status, json };
};

const main = async () => {
  await sequelize.authenticate();

  const [resourceTypes] = await sequelize.query("SELECT id FROM public.resource_types ORDER BY id LIMIT 1");
  if (!resourceTypes?.length) throw new Error("No resource type found");

  const server = app.listen(5099);
  const baseUrl = "http://127.0.0.1:5099/api";

  try {
    const email = `r2.proxy.${Date.now()}@example.com`;
    const password = "TestPass123!";

    await api(baseUrl, "/auth/register", {
      method: "POST",
      body: { full_name: "R2 Proxy Tester", email, password },
    });

    const login = await api(baseUrl, "/auth/login", {
      method: "POST",
      body: { email, password },
    });

    const token = login?.json?.data?.token;
    if (!token) throw new Error("Login failed");

    const created = await api(baseUrl, "/resources", {
      method: "POST",
      token,
      body: {
        title: `Proxy Upload Test ${Date.now()}`,
        description: "Backend proxy upload test",
        educational_type: "notes",
        format: "pdf",
        resource_type_id: resourceTypes[0].id,
      },
    });

    const resourceId = Array.isArray(created?.json?.data) ? created.json.data[0]?.id : created?.json?.data?.id;
    if (!resourceId) throw new Error("Resource creation failed");

    const bytes = Buffer.from("%PDF-1.4\n%proxy-upload\n", "utf8");
    const formData = new FormData();
    formData.append("file", new Blob([bytes], { type: "application/pdf" }), "proxy-test.pdf");

    const upload = await api(baseUrl, `/resources/${resourceId}/upload-file`, {
      method: "POST",
      token,
      body: formData,
    });

    if (!upload.ok) {
      throw new Error(`Proxy upload failed: ${upload.status} ${JSON.stringify(upload.json)}`);
    }

    const fileUrl = await api(baseUrl, `/resources/${resourceId}/file-url`, {
      method: "GET",
      token,
    });

    if (!fileUrl.ok || !fileUrl?.json?.data?.download_url) {
      throw new Error(`File url failed: ${fileUrl.status} ${JSON.stringify(fileUrl.json)}`);
    }

    const fetched = await fetch(fileUrl.json.data.download_url);
    if (!fetched.ok) throw new Error(`Signed download failed: ${fetched.status}`);
    const downloaded = Buffer.from(await fetched.arrayBuffer());

    console.log("[Test] SUCCESS proxy upload flow", { resourceId, bytes: downloaded.length });
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await sequelize.close();
  }
};

main().catch((error) => {
  console.error("[Test] FAILED proxy upload flow:", error.message);
  console.error(error);
  process.exit(1);
});
