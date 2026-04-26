const baseUrl = process.env.BASE_URL || "http://127.0.0.1:5000";

class Client {
  constructor(name) {
    this.name = name; 
    this.cookie = "";
  }

  async request(label, method, path, { body, expected } = {}) {
    const headers = { "content-type": "application/json" };
    if (this.cookie) headers.cookie = this.cookie;

    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (_error) {
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

const run = async () => {
  const random = Date.now();
  const admin = new Client("admin");
  const student = new Client("student");
  const teacher = new Client("teacher");

  push(
    await admin.request("login", "POST", "/api/auth/login", {
      body: { email: "user@gmail.com", password: "user1234!" },
      expected: 200,
    })
  );

  push(
    await student.request("register", "POST", "/api/auth/register", {
      body: { email: `flow.student.${random}@example.com`, password: "Pass1234!", full_name: "Flow Student" },
      expected: 201,
    })
  );
  push(
    await student.request("login", "POST", "/api/auth/login", {
      body: { email: `flow.student.${random}@example.com`, password: "Pass1234!" },
      expected: 200,
    })
  );

  push(
    await teacher.request("register", "POST", "/api/auth/register", {
      body: { email: `flow.teacher.${random}@example.com`, password: "Pass1234!", full_name: "Flow Teacher" },
      expected: 201,
    })
  );
  push(
    await teacher.request("login", "POST", "/api/auth/login", {
      body: { email: `flow.teacher.${random}@example.com`, password: "Pass1234!" },
      expected: 200,
    })
  );

  const roles = await admin.request("list roles", "GET", "/api/roles", { expected: 200 });
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
        body: { email: `flow.teacher.${random}@example.com`, password: "Pass1234!" },
        expected: 200,
      })
    );
  }

  const modulesRes = await admin.request("list modules", "GET", "/api/modules", { expected: 200 });
  push(modulesRes);
  const module = modulesRes.data?.data?.[0];
  const moduleId = module?.id;

  const resourcesRes = await admin.request("list module resources", "GET", `/api/modules/${moduleId}/resources`, {
    expected: 200,
  });
  push(resourcesRes);

  let resourceId = resourcesRes.data?.data?.[0]?.id || null;
  if (!resourceId) {
    const createResource = await admin.request("create resource", "POST", "/api/resources", {
      body: {
        title: `Flow Resource ${random}`,
        description: "Ressource de test workflow confusion",
        status: "published",
        resource_type_id: 1,
        format: "pdf",
        educational_type: "course",
        url: "https://example.com/flow.pdf",
      },
      expected: 201,
    });
    push(createResource);
    resourceId = pickId(createResource.data);

    push(
      await admin.request("map resource module", "POST", `/api/resources/${resourceId}/modules`, {
        body: { module_id: moduleId, chapter: "General", difficulty: "medium", exam_related: false },
        expected: [200, 201],
      })
    );
  }

  push(
    await admin.request("upsert module staff", "POST", "/api/confusion/module-staff-assignments", {
      body: {
        module_id: moduleId,
        user_id: teacherId,
        assignment_role: "teacher_referent",
        is_primary: true,
        is_active: true,
      },
      expected: 200,
    })
  );

  const signal = await student.request("send confusion signal", "POST", `/api/resources/${resourceId}/confusion-signals`, {
    body: { module_id: moduleId, note: "Je ne comprends pas ce chapitre" },
    expected: 201,
  });
  push(signal);

  const caseId = signal.data?.data?.case?.id;

  push(await student.request("list my confusion cases", "GET", "/api/students/me/confusion-cases", { expected: 200 }));
  push(await teacher.request("list staff confusion cases", "GET", "/api/confusion/cases?assigned_to_me=true", { expected: 200 }));

  push(
    await teacher.request("set case in progress", "PATCH", `/api/confusion/cases/${caseId}/status`, {
      body: { status: "en_cours", reason: "Analyse du blocage en cours" },
      expected: 200,
    })
  );

  const question = await student.request("create question", "POST", "/api/qa/questions", {
    body: {
      module_id: moduleId,
      resource_id: resourceId,
      title: "Question workflow confusion",
      body: "Je ne comprends pas comment appliquer cette notion dans un exercice concret.",
    },
    expected: 201,
  });
  push(question);

  const questionId = question.data?.data?.id;

  push(
    await teacher.request("create official answer", "POST", `/api/qa/questions/${questionId}/answers`, {
      body: {
        body: "Voici une explication pas a pas pour ce blocage et une methode de resolution.",
        explanation:
          "Une reponse officielle necessite une explication detaillee. Commencez par identifier les clauses, puis validez la jointure avec un petit jeu de donnees avant d'etendre au cas complet.",
        example: "SELECT a.id, b.name FROM table_a a LEFT JOIN table_b b ON b.a_id = a.id;",
      },
      expected: 201,
    })
  );

  push(
    await teacher.request("resolve case", "PATCH", `/api/confusion/cases/${caseId}/status`, {
      body: { status: "resolu", reason: "Blocage traite avec reponse officielle" },
      expected: 200,
    })
  );

  push(await student.request("list notifications", "GET", "/api/notifications?unread_only=true", { expected: 200 }));

  const failed = results.filter((r) => !r.ok);
  console.log("CONFUSION_WORKFLOW_E2E_START");
  for (const r of results) {
    console.log(`${r.ok ? "PASS" : "FAIL"} | ${r.status} | ${r.name}${r.message ? ` | ${r.message}` : ""}`);
  }
  console.log("CONFUSION_WORKFLOW_E2E_END");
  console.log(`TOTAL=${results.length} PASS=${results.length - failed.length} FAIL=${failed.length}`);

  if (failed.length) process.exit(1);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
