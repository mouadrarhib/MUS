import "dotenv/config";
import app from "../src/app.js";
import { sequelize } from "../src/models/index.js";

const api = async (baseUrl, path, { method = "GET", token, body, headers = {} } = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Cookie: `auth_token=${token}` } : {}),
      ...headers,
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

const main = async () => {
  await sequelize.authenticate();

  const [resourceTypes] = await sequelize.query("SELECT id, name FROM public.resource_types ORDER BY id LIMIT 1");
  if (!resourceTypes?.length) {
    throw new Error("No resource_type found in DB. Seed resource_types first.");
  }
  const resourceTypeId = resourceTypes[0].id;

  const server = app.listen(5059);
  const baseUrl = "http://127.0.0.1:5059/api";

  try {
    const email = `r2.test.${Date.now()}@example.com`;
    const password = "TestPass123!";

    console.log("[Test] Registering user", { email });
    const registerResult = await api(baseUrl, "/auth/register", {
      method: "POST",
      body: {
        full_name: "R2 Upload Tester",
        email,
        password,
      },
    });

    if (!registerResult.ok) {
      throw new Error(`Register failed: ${registerResult.status} ${JSON.stringify(registerResult.json)}`);
    }

    console.log("[Test] Logging in user");
    const loginResult = await api(baseUrl, "/auth/login", {
      method: "POST",
      body: {
        email,
        password,
      },
    });

    if (!loginResult.ok || !loginResult.json?.data?.token) {
      throw new Error(`Login failed: ${loginResult.status} ${JSON.stringify(loginResult.json)}`);
    }

    const token = loginResult.json.data.token;

    console.log("[Test] Creating resource");
    const createResourceResult = await api(baseUrl, "/resources", {
      method: "POST",
      token,
      body: {
        title: `R2 Upload Test ${Date.now()}`,
        description: "Integration test for R2 upload flow",
        status: "draft",
        educational_type: "notes",
        format: "pdf",
        resource_type_id: resourceTypeId,
      },
    });

    const createdResource = Array.isArray(createResourceResult.json?.data)
      ? createResourceResult.json.data[0]
      : createResourceResult.json?.data;

    if (!createResourceResult.ok || !createdResource?.id) {
      throw new Error(`Create resource failed: ${createResourceResult.status} ${JSON.stringify(createResourceResult.json)}`);
    }

    const resourceId = createdResource.id;
    console.log("[Test] Resource created", { resourceId });

    console.log("[Test] Requesting upload URL by resource ID");
    const uploadUrlResult = await api(baseUrl, `/resources/${resourceId}/upload-url`, {
      method: "POST",
      token,
      body: {
        filename: "r2-upload-test.pdf",
        mime_type: "application/pdf",
        size_bytes: 36,
      },
    });

    if (!uploadUrlResult.ok || !uploadUrlResult.json?.data?.upload_url || !uploadUrlResult.json?.data?.object_key) {
      throw new Error(`Upload URL failed: ${uploadUrlResult.status} ${JSON.stringify(uploadUrlResult.json)}`);
    }

    const { upload_url: uploadUrl, object_key: objectKey } = uploadUrlResult.json.data;
    console.log("[Test] Upload URL received", { objectKey });

    const fileBytes = Buffer.from("%PDF-1.4\n%MUS R2 integration test\n", "utf8");
    console.log("[Test] Uploading binary to signed URL");
    const uploadBinaryResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/pdf",
      },
      body: fileBytes,
    });

    if (!uploadBinaryResponse.ok) {
      throw new Error(`Binary upload failed: ${uploadBinaryResponse.status}`);
    }
    console.log("[Test] Binary uploaded to R2", { status: uploadBinaryResponse.status });

    console.log("[Test] Attaching uploaded file to resource");
    const attachFileResult = await api(baseUrl, `/resources/${resourceId}/attach-file`, {
      method: "POST",
      token,
      body: {
        object_key: objectKey,
      },
    });

    if (!attachFileResult.ok) {
      throw new Error(`Attach file failed: ${attachFileResult.status} ${JSON.stringify(attachFileResult.json)}`);
    }
    console.log("[Test] File attached successfully");

    console.log("[Test] Requesting signed download URL");
    const fileUrlResult = await api(baseUrl, `/resources/${resourceId}/file-url`, {
      method: "GET",
      token,
    });

    if (!fileUrlResult.ok || !fileUrlResult.json?.data?.download_url) {
      throw new Error(`Get file URL failed: ${fileUrlResult.status} ${JSON.stringify(fileUrlResult.json)}`);
    }

    const signedDownloadUrl = fileUrlResult.json.data.download_url;
    const downloadResponse = await fetch(signedDownloadUrl);
    if (!downloadResponse.ok) {
      throw new Error(`Signed URL download failed: ${downloadResponse.status}`);
    }
    const downloadedBytes = Buffer.from(await downloadResponse.arrayBuffer());
    console.log("[Test] Signed URL download succeeded", { bytes: downloadedBytes.length });

    console.log("[Test] Deleting resource and checking cloud file removal");
    const moveToDraftResult = await api(baseUrl, `/resources/${resourceId}/status`, {
      method: "PATCH",
      token,
      body: { status: "draft" },
    });

    if (!moveToDraftResult.ok) {
      throw new Error(`Move resource to draft failed: ${moveToDraftResult.status} ${JSON.stringify(moveToDraftResult.json)}`);
    }

    const deleteResult = await api(baseUrl, `/resources/${resourceId}`, {
      method: "DELETE",
      token,
    });

    if (!deleteResult.ok) {
      throw new Error(`Delete resource failed: ${deleteResult.status} ${JSON.stringify(deleteResult.json)}`);
    }

    const downloadAfterDelete = await fetch(signedDownloadUrl);
    if (downloadAfterDelete.ok) {
      throw new Error("Expected signed URL to fail after resource/file delete, but it still downloads");
    }
    console.log("[Test] Cloud file removed after resource deletion", { status: downloadAfterDelete.status });

    console.log("\n[Test] SUCCESS: Backend <-> R2 upload flow is working end-to-end.");
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await sequelize.close();
  }
};

main().catch((error) => {
  console.error("\n[Test] FAILED:", error.message);
  process.exit(1);
});
