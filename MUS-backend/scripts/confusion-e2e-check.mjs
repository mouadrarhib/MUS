const baseUrl = process.env.BASE_URL || "http://127.0.0.1:5000";

class Client {
  constructor(name) {
    this.name = name;
    this.cookie = "";
  }

  async request(label, method, path, { body, expected } = {}) {
    const headers = { "content-type": "application/json" };
    if (this.cookie) headers.cookie = this.cookie;

    let res;
    try {
      res = await fetch(`${baseUrl}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (error) {
      const reason = error?.cause?.code || error?.message || "unknown_error";
      throw new Error(
        `Cannot reach API at ${baseUrl}. Start the backend first or set BASE_URL. Cause: ${reason}`
      );
    }

    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (_e) {
      data = null;
    }

    const setCookie = res.headers.get("set-cookie");
    if (setCookie) this.cookie = setCookie.split(";")[0];

    const ok = Array.isArray(expected) ? expected.includes(res.status) : res.status === expected;
    return {
      ok,
      status: res.status,
      name: `${this.name} | ${label}`,
      message: data?.message || "",
      data,
    };
  }
}

const results = [];
const push = (r) => results.push(r);

const pickId = (payload) => {
  const data = payload?.data;
  if (!data) return null;
  if (Array.isArray(data)) {
    return data[0]?.id || data[0]?.resource_id || null;
  }
  return data.id || data.resource_id || null;
};

const pickResourceWithModule = async (client) => {
  const modulesRes = await client.request("list modules", "GET", "/api/modules", { expected: 200 });
  push(modulesRes);
  const modules = modulesRes.data?.data || [];

  for (const m of modules) {
    const resourcesRes = await client.request(`list module ${m.id} resources`, "GET", `/api/modules/${m.id}/resources`, {
      expected: 200,
    });
    push(resourcesRes);
    const resource = resourcesRes.data?.data?.[0];
    if (resource?.id) {
      return { moduleId: m.id, resourceId: resource.id };
    }
  }

  return null;
};

const run = async () => {
  const random = Date.now();
  const admin = new Client("admin");
  const student = new Client("student");
  const teacher = new Client("teacher");

  push(
    await admin.request("login", "POST", "/api/auth/login", {
      body: {
        email: process.env.ADMIN_EMAIL || "user@gmail.com",
        password: process.env.ADMIN_PASSWORD || "user1234!",
      },
      expected: 200,
    })
  );
  if (!results[results.length - 1].ok) {
    throw new Error(
      `Admin login failed. Set ADMIN_EMAIL and ADMIN_PASSWORD env vars. Status: ${results[results.length - 1].status}`
    );
  }

  push(
    await student.request("register", "POST", "/api/auth/register", {
      body: { email: `conf.student.${random}@example.com`, password: "Pass1234!", full_name: "Conf Student" },
      expected: 201,
    })
  );
  push(
    await student.request("login", "POST", "/api/auth/login", {
      body: { email: `conf.student.${random}@example.com`, password: "Pass1234!" },
      expected: 200,
    })
  );

  push(
    await teacher.request("register", "POST", "/api/auth/register", {
      body: { email: `conf.teacher.${random}@example.com`, password: "Pass1234!", full_name: "Conf Teacher" },
      expected: 201,
    })
  );
  push(
    await teacher.request("login", "POST", "/api/auth/login", {
      body: { email: `conf.teacher.${random}@example.com`, password: "Pass1234!" },
      expected: 200,
    })
  );

  const roles = await admin.request("roles", "GET", "/api/roles", { expected: 200 });
  push(roles);
  const teacherRoleId = (roles.data?.data || []).find((r) => r.name === "teacher")?.id;
  const teacherMe = await teacher.request("me", "GET", "/api/auth/me", { expected: 200 });
  push(teacherMe);
  const teacherId = teacherMe.data?.data?.user?.id;
  if (teacherRoleId && teacherId) {
    push(
      await admin.request("assign teacher role", "POST", "/api/user-roles/assign", {
        body: { userId: teacherId, roleId: teacherRoleId },
        expected: [200, 201],
      })
    );
    push(
      await teacher.request("re-login", "POST", "/api/auth/login", {
        body: { email: `conf.teacher.${random}@example.com`, password: "Pass1234!" },
        expected: 200,
      })
    );
  }

  const candidate = await pickResourceWithModule(admin);
  let resourceId = candidate?.resourceId || null;

  if (!resourceId) {
    const modulesRes = await admin.request("fallback list modules", "GET", "/api/modules", { expected: 200 });
    push(modulesRes);
    const fallbackModuleId = modulesRes.data?.data?.[0]?.id;

    if (fallbackModuleId) {
      const created = await admin.request("fallback create resource", "POST", "/api/resources", {
        body: {
          title: `Confusion Resource ${random}`,
          description: "Ressource de test pour confusion signals",
          status: "published",
          resource_type_id: 1,
          format: "pdf",
          educational_type: "course",
          url: "https://example.com/confusion.pdf",
        },
        expected: 201,
      });
      push(created);
      const fallbackResourceId = pickId(created.data);

      if (fallbackResourceId) {
        const mapped = await admin.request("fallback map resource module", "POST", `/api/resources/${fallbackResourceId}/modules`, {
          body: { module_id: fallbackModuleId, chapter: "General", difficulty: "medium", exam_related: false },
          expected: [200, 201],
        });
        push(mapped);
        if (mapped.ok) {
          resourceId = fallbackResourceId;
        }
      }
    }
  }

  if (!resourceId) {
    push({ ok: false, status: 0, name: "setup | resource with module", message: "Aucune ressource liee a un module disponible" });
  } else {

    push(
      await student.request("send confusion signal", "POST", `/api/resources/${resourceId}/confusion-signals`, {
        body: { note: "Je bloque sur cet exercice" },
        expected: 201,
      })
    );

    push(
      await student.request("send confusion signal again too soon", "POST", `/api/resources/${resourceId}/confusion-signals`, {
        body: { note: "Toujours bloque" },
        expected: 429,
      })
    );

    push(
      await teacher.request("read confusion count", "GET", `/api/resources/${resourceId}/confusion-signals/count`, {
        expected: 200,
      })
    );

    push(
      await teacher.request("read confusion recent", "GET", `/api/resources/${resourceId}/confusion-signals/recent?limit=10`, {
        expected: 200,
      })
    );

    push(
      await admin.request("read confusion overview resource", "GET", "/api/admin/confusion/overview?group_by=resource&days=7", {
        expected: 200,
      })
    );

    push(
      await admin.request("read confusion overview module", "GET", "/api/admin/confusion/overview?group_by=module&days=7", {
        expected: 200,
      })
    );

    push(
      await admin.request("admin cannot send confusion signal", "POST", `/api/resources/${resourceId}/confusion-signals`, {
        body: { note: "test" },
        expected: 403,
      })
    );
  }

  const failed = results.filter((r) => !r.ok);
  console.log("CONFUSION_E2E_START");
  for (const r of results) {
    console.log(`${r.ok ? "PASS" : "FAIL"} | ${r.status} | ${r.name}${r.message ? ` | ${r.message}` : ""}`);
  }
  console.log("CONFUSION_E2E_END");
  console.log(`TOTAL=${results.length} PASS=${results.length - failed.length} FAIL=${failed.length}`);

  if (failed.length) process.exit(1);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
