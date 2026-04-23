import "dotenv/config";

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:5000";
const prefix = `${baseUrl}/api`;
const randomSuffix = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

const json = (value) => JSON.stringify(value, null, 2);

class Client {
  constructor(name) {
    this.name = name;
    this.cookie = "";
  }

  async request(step, method, path, { body, expected = [200] } = {}) {
    const headers = { "content-type": "application/json" };
    if (this.cookie) headers.cookie = this.cookie;

    const res = await fetch(`${prefix}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const setCookie = res.headers.get("set-cookie");
    if (setCookie) this.cookie = setCookie;

    let payload = null;
    try {
      payload = await res.json();
    } catch {
      payload = null;
    }

    const okStatuses = Array.isArray(expected) ? expected : [expected];
    const ok = okStatuses.includes(res.status);
    const line = `${ok ? "PASS" : "FAIL"} | ${this.name} | ${res.status} | ${method} ${path} | ${step}`;
    console.log(line);
    if (!ok) {
      console.log(json(payload));
      throw new Error(`Step failed: ${step}`);
    }

    return { status: res.status, payload };
  }
}

const asArray = (payload, key) => {
  if (Array.isArray(payload?.data?.[key])) return payload.data[key];
  if (Array.isArray(payload?.[key])) return payload[key];
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

const run = async () => {
  const user = new Client("resource-user");
  const email = `resource.form.${randomSuffix}@example.com`;
  const password = "Pass1234!";

  console.log("RESOURCE_FORM_FLOW_CHECK_START");

  await user.request("register owner", "POST", "/auth/register", {
    body: {
      email,
      password,
      full_name: "Resource Form Tester",
      role: "student",
      contribution_mode: "contributor",
    },
    expected: [200, 201, 409],
  });

  await user.request("login owner", "POST", "/auth/login", {
    body: { email, password },
    expected: 200,
  });

  const institutionsRes = await user.request("load institutions", "GET", "/institutions", { expected: 200 });
  const institutions = asArray(institutionsRes.payload);
  const institutionId = Number(institutions[0]?.id || 0);
  if (!institutionId) throw new Error("No institution available");

  const programsRes = await user.request(
    "load programs by institution",
    "GET",
    `/institution-programs/institutions/${institutionId}/programs`,
    { expected: 200 }
  );
  const programs = asArray(programsRes.payload);
  const programId = Number(programs[0]?.id || programs[0]?.program_id || 0);
  if (!programId) throw new Error("No program available for institution");

  const levelsRes = await user.request("load levels by program", "GET", `/levels/program/${programId}`, { expected: 200 });
  const levels = asArray(levelsRes.payload);
  const levelId = Number(levels[0]?.id || 0);
  if (!levelId) throw new Error("No level available for program");

  const semestersRes = await user.request("load semesters by level", "GET", `/semesters/level/${levelId}`, { expected: 200 });
  const semesters = asArray(semestersRes.payload);
  const semesterId = Number(semesters[0]?.id || 0);
  if (!semesterId) throw new Error("No semester available for level");

  const modulesRes = await user.request("load modules by semester", "GET", `/modules/semester/${semesterId}`, { expected: 200 });
  const modules = asArray(modulesRes.payload);
  const moduleId = Number(modules[0]?.module_id || modules[0]?.id || 0);
  if (!moduleId) throw new Error("No module available for semester");

  const createdRes = await user.request("create resource", "POST", "/resources", {
    body: {
      title: `Resource Form ${randomSuffix}`,
      description: "Resource created for form flow validation",
      status: "draft",
      educational_type: "notes",
      format: "pdf",
      resource_type_id: 1,
      url: "https://example.com/original-resource.pdf",
      metadata: {
        storage: { object_key: `manual/${randomSuffix}.pdf`, original_filename: "original-resource.pdf" },
      },
    },
    expected: 201,
  });

  const resourceId = Number(createdRes.payload?.data?.id || createdRes.payload?.id || 0);
  if (!resourceId) throw new Error("Failed to create resource");

  await user.request("map resource to module", "POST", `/resources/${resourceId}/modules`, {
    body: {
      module_id: moduleId,
      chapter: "Chapter A",
      difficulty: "medium",
      exam_related: false,
    },
    expected: [200, 201],
  });

  const beforePatch = await user.request("get resource before patch", "GET", `/resources/${resourceId}`, { expected: 200 });

  await user.request("move pending resource to draft", "PATCH", `/resources/${resourceId}/status`, {
    body: { status: "draft" },
    expected: 200,
  });

  await user.request("patch title only", "PATCH", `/resources/${resourceId}`, {
    body: {
      title: `Resource Form Updated ${randomSuffix}`,
      metadata: {
        ...(beforePatch.payload?.data?.metadata || {}),
        academicContext: {
          institutionId: String(institutionId),
          programId: String(programId),
          levelId: String(levelId),
          semesterId: String(semesterId),
          moduleId: String(moduleId),
          chapter: "Chapter A",
          difficulty: "medium",
          isExamRelated: false,
        },
      },
    },
    expected: 200,
  });

  const afterPatch = await user.request("get resource after patch", "GET", `/resources/${resourceId}`, { expected: 200 });
  const updated = afterPatch.payload?.data || afterPatch.payload;

  if (updated?.url !== "https://example.com/original-resource.pdf") {
    throw new Error("URL was unexpectedly changed during title-only patch");
  }

  const storageKey = updated?.metadata?.storage?.object_key;
  if (!storageKey) {
    throw new Error("Storage metadata missing after title-only patch");
  }

  const modulesAfter = await user.request("get mapped modules after patch", "GET", `/resources/${resourceId}/modules`, {
    expected: 200,
  });
  const mappedModules = asArray(modulesAfter.payload, "modules");
  if (!mappedModules.length || Number(mappedModules[0]?.module_id || 0) !== moduleId) {
    throw new Error("Resource-module mapping missing after patch");
  }

  console.log("RESOURCE_FORM_FLOW_CHECK_PASS");
};

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
