const baseUrl = process.env.BASE_URL || "http://127.0.0.1:5004";

class Client {
  constructor(name) {
    this.name = name;
    this.cookie = "";
  }

  async request(testName, method, path, { body, expectedStatus } = {}) {
    const headers = { "content-type": "application/json" };
    if (this.cookie) headers.cookie = this.cookie;

    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    let payload = null;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch (_err) {
      payload = null;
    }

    const setCookie = res.headers.get("set-cookie");
    if (setCookie) this.cookie = setCookie.split(";")[0];

    const ok = Array.isArray(expectedStatus)
      ? expectedStatus.includes(res.status)
      : res.status === expectedStatus;

    return {
      ok,
      status: res.status,
      testName: `${this.name} | ${testName}`,
      message: payload?.message || "",
      payload,
    };
  }
}

const tests = [];
const record = (result) => tests.push(result);

const pickId = (payload) => {
  const data = payload?.data;
  if (!data) return null;
  if (Array.isArray(data)) {
    return data[0]?.id || data[0]?.resource_id || null;
  }
  return data.id || data.resource_id || null;
};

const getNotificationRows = (payload) => {
  const rows = payload?.data?.rows;
  return Array.isArray(rows) ? rows : [];
};

const fail = (msg) => {
  console.error(msg);
  process.exit(1);
};

const randomSuffix = Date.now();

const adminCreds = {
  email: "user@gmail.com",
  password: "user1234!",
};

const studentCreds = {
  email: `qa.student.${randomSuffix}@example.com`,
  password: "Pass1234!",
  full_name: "QA Student",
};

const teacherCreds = {
  email: `qa.teacher.${randomSuffix}@example.com`,
  password: "Pass1234!",
  full_name: "QA Teacher",
};

const quotaStudentCreds = {
  email: `qa.quota.${randomSuffix}@example.com`,
  password: "Pass1234!",
  full_name: "QA Quota Student",
};

const admin = new Client("admin");
const student = new Client("student");
const teacher = new Client("teacher");
const quotaStudent = new Client("quota-student");
const pub = new Client("public");

const run = async () => {
  record(await admin.request("login", "POST", "/api/auth/login", { body: adminCreds, expectedStatus: 200 }));

  const rolesRes = await admin.request("list roles", "GET", "/api/roles", { expectedStatus: 200 });
  record(rolesRes);
  const roles = rolesRes.payload?.data || [];
  const teacherRole = roles.find((r) => r.name === "teacher");
  if (!teacherRole) fail("Teacher role not found");

  record(await student.request("register", "POST", "/api/auth/register", { body: studentCreds, expectedStatus: 201 }));
  record(
    await student.request("login", "POST", "/api/auth/login", {
      body: { email: studentCreds.email, password: studentCreds.password },
      expectedStatus: 200,
    })
  );

  const studentMe = await student.request("me", "GET", "/api/auth/me", { expectedStatus: 200 });
  record(studentMe);
  const studentId = studentMe.payload?.data?.user?.id;
  if (!studentId) fail("Student id not found");

  record(await teacher.request("register", "POST", "/api/auth/register", { body: teacherCreds, expectedStatus: 201 }));
  record(
    await teacher.request("login", "POST", "/api/auth/login", {
      body: { email: teacherCreds.email, password: teacherCreds.password },
      expectedStatus: 200,
    })
  );
  const teacherMe = await teacher.request("me", "GET", "/api/auth/me", { expectedStatus: 200 });
  record(teacherMe);
  const teacherId = teacherMe.payload?.data?.user?.id;
  if (!teacherId) fail("Teacher id not found");

  record(
    await admin.request("assign teacher role", "POST", "/api/user-roles/assign", {
      body: { userId: teacherId, roleId: teacherRole.id },
      expectedStatus: [200, 201],
    })
  );

  record(
    await teacher.request("re-login after role assignment", "POST", "/api/auth/login", {
      body: { email: teacherCreds.email, password: teacherCreds.password },
      expectedStatus: 200,
    })
  );

  const modulesRes = await pub.request("list modules", "GET", "/api/modules", { expectedStatus: 200 });
  record(modulesRes);
  const modules = modulesRes.payload?.data || [];
  let moduleId = null;
  let resourceId = null;

  for (const mod of modules) {
    const candidate = await pub.request(
      `list resources for module ${mod.id}`,
      "GET",
      `/api/modules/${mod.id}/resources`,
      { expectedStatus: 200 }
    );
    record(candidate);
    const foundResourceId = candidate.payload?.data?.[0]?.id;
    if (foundResourceId) {
      moduleId = mod.id;
      resourceId = foundResourceId;
      break;
    }
  }

  if (!moduleId || !resourceId) {
    const fallbackModuleId = modules[0]?.id;
    if (!fallbackModuleId) fail("No module available for Q&A tests");

    const created = await admin.request("create fallback published resource", "POST", "/api/resources", {
      body: {
        title: `QA Resource ${randomSuffix}`,
        description: "Fallback published resource for Q&A tests",
        status: "published",
        resource_type_id: 1,
        format: "pdf",
        educational_type: "course",
        url: "https://example.com/qa-resource.pdf",
      },
      expectedStatus: 201,
    });
    record(created);

    const fallbackResourceId = pickId(created.payload);
    if (!fallbackResourceId) fail("Failed to create fallback resource for Q&A tests");

    record(
      await admin.request("map fallback resource to module", "POST", `/api/resources/${fallbackResourceId}/modules`, {
        body: {
          module_id: fallbackModuleId,
          chapter: "General",
          difficulty: "medium",
          exam_related: false,
        },
        expectedStatus: [200, 201],
      })
    );

    moduleId = fallbackModuleId;
    resourceId = fallbackResourceId;
  }

  record(
    await admin.request("assign teacher as module referent", "POST", "/api/confusion/module-staff-assignments", {
      body: {
        module_id: moduleId,
        user_id: teacherId,
        assignment_role: "teacher_referent",
        is_primary: true,
        is_active: true,
      },
      expectedStatus: [200, 201],
    })
  );

  const q1 = await student.request("create anonymous question", "POST", "/api/qa/questions", {
    body: {
      module_id: moduleId,
      resource_id: resourceId,
      title: "Question SQL LEFT JOIN",
      body: "Pouvez-vous expliquer LEFT JOIN avec un exemple concret ?",
      is_anonymous: true,
    },
    expectedStatus: 201,
  });
  record(q1);
  const questionId = pickId(q1.payload);
  if (!questionId) fail("Question id not found");

  record(await pub.request("public read questions", "GET", "/api/qa/questions", { expectedStatus: 200 }));

  record(
    await teacher.request("official answer missing explanation", "POST", `/api/qa/questions/${questionId}/answers`, {
      body: { body: "Reponse courte" },
      expectedStatus: 400,
    })
  );

  const officialAnswer = await teacher.request("official answer valid", "POST", `/api/qa/questions/${questionId}/answers`, {
    body: {
      body: "LEFT JOIN garde toutes les lignes de gauche.",
      explanation:
        "LEFT JOIN conserve toutes les lignes de la table gauche et ajoute des valeurs NULL quand aucune correspondance n est trouvee dans la table droite.",
      example: "SELECT a.id, b.note FROM a LEFT JOIN b ON a.id = b.a_id;",
    },
    expectedStatus: 201,
  });
  record(officialAnswer);
  const officialAnswerId = pickId(officialAnswer.payload);
  if (!officialAnswerId) fail("Official answer id not found");

  const peerAnswer = await student.request("peer answer", "POST", `/api/qa/questions/${questionId}/answers`, {
    body: {
      body: "Tu gardes la table principale et la table jointe remplit quand il y a match.",
    },
    expectedStatus: 201,
  });
  record(peerAnswer);
  const peerAnswerId = pickId(peerAnswer.payload);
  if (!peerAnswerId) fail("Peer answer id not found");

  record(await teacher.request("accept official answer", "PATCH", `/api/qa/answers/${officialAnswerId}/accept`, { expectedStatus: 200 }));
  record(await teacher.request("accept peer answer", "PATCH", `/api/qa/answers/${peerAnswerId}/accept`, { expectedStatus: 200 }));

  const answersAfterAccept = await pub.request("list answers after re-accept", "GET", `/api/qa/questions/${questionId}/answers`, {
    expectedStatus: 200,
  });
  record(answersAfterAccept);
  const activeAccepted = (answersAfterAccept.payload?.data || []).filter((a) => a.is_accepted);
  if (activeAccepted.length !== 1) {
    fail(`Expected exactly 1 accepted answer, found ${activeAccepted.length}`);
  }

  record(
    await teacher.request("hide accepted answer", "PATCH", `/api/qa/answers/${peerAnswerId}/moderate`, {
      body: { moderation_status: "hidden", reason: "Revision pedagogique" },
      expectedStatus: 200,
    })
  );

  const answersAfterHide = await pub.request("list answers after hide", "GET", `/api/qa/questions/${questionId}/answers`, {
    expectedStatus: 200,
  });
  record(answersAfterHide);
  const hiddenStillVisible = (answersAfterHide.payload?.data || []).some((a) => a.id === peerAnswerId);
  if (hiddenStillVisible) fail("Hidden answer is still visible in public list");

  record(
    await teacher.request("comment on question", "POST", `/api/qa/questions/${questionId}/comments`, {
      body: { body: "Merci pour la question" },
      expectedStatus: 201,
    })
  );
  record(
    await student.request("student comment on question", "POST", `/api/qa/questions/${questionId}/comments`, {
      body: { body: "Merci pour la precision" },
      expectedStatus: 201,
    })
  );
  const questionCommentIdByStudent = pickId(tests[tests.length - 1].payload);
  record(
    await student.request("comment on answer", "POST", `/api/qa/answers/${officialAnswerId}/comments`, {
      body: { body: "Merci prof" },
      expectedStatus: 201,
    })
  );
  const answerCommentId = pickId(tests[tests.length - 1].payload);
  record(await pub.request("public list question comments", "GET", `/api/qa/questions/${questionId}/comments`, { expectedStatus: 200 }));
  record(await pub.request("public list answer comments", "GET", `/api/qa/answers/${officialAnswerId}/comments`, { expectedStatus: 200 }));

  if (answerCommentId) {
    record(
      await teacher.request("moderate comment hidden", "PATCH", `/api/qa/comments/${answerCommentId}/moderate`, {
        body: { moderation_status: "hidden", reason: "Hors sujet" },
        expectedStatus: 200,
      })
    );

    const commentsAfterHide = await pub.request(
      "public list answer comments after hide",
      "GET",
      `/api/qa/answers/${officialAnswerId}/comments`,
      { expectedStatus: 200 }
    );
    record(commentsAfterHide);
    const hiddenCommentVisible = (commentsAfterHide.payload?.data || []).some((c) => c.id === answerCommentId);
    if (hiddenCommentVisible) fail("Hidden comment is still visible in public list");
  }

  const teacherNotifications = await teacher.request(
    "teacher unread notifications",
    "GET",
    "/api/notifications?unread_only=true&limit=100",
    { expectedStatus: 200 }
  );
  record(teacherNotifications);

  const teacherNotificationRows = getNotificationRows(teacherNotifications.payload);
  const teacherNotificationTypes = new Set(teacherNotificationRows.map((row) => row.type));
  if (!teacherNotificationTypes.has("QA_QUESTION_CREATED")) {
    fail("Expected QA_QUESTION_CREATED notification for assigned teacher");
  }
  if (!teacherNotificationTypes.has("QA_ANSWER_CREATED")) {
    fail("Expected QA_ANSWER_CREATED notification for assigned teacher");
  }
  if (!teacherNotificationTypes.has("QA_ANSWER_COMMENT_CREATED")) {
    fail("Expected QA_ANSWER_COMMENT_CREATED notification for assigned teacher");
  }
  if (!teacherNotificationTypes.has("QA_QUESTION_COMMENT_CREATED")) {
    fail("Expected QA_QUESTION_COMMENT_CREATED notification for assigned teacher");
  }

  if (questionCommentIdByStudent) {
    const hasQuestionCommentPayload = teacherNotificationRows.some(
      (row) => row.type === "QA_QUESTION_COMMENT_CREATED" && row.payload?.comment_id === questionCommentIdByStudent
    );
    if (!hasQuestionCommentPayload) {
      fail("Expected QA_QUESTION_COMMENT_CREATED payload to include student comment id");
    }
  }

  const ownQuestionCommentNotification = teacherNotificationRows.find(
    (row) => row.type === "QA_QUESTION_COMMENT_CREATED" && row.payload?.actor_user_id === teacherId
  );
  if (ownQuestionCommentNotification) {
    fail("Actor should not receive self notifications for own QA comment");
  }

  record(
    await teacher.request("moderate question hidden", "PATCH", `/api/qa/questions/${questionId}/moderate`, {
      body: { moderation_status: "hidden", reason: "Question en revision" },
      expectedStatus: 200,
    })
  );

  record(await pub.request("public get hidden question", "GET", `/api/qa/questions/${questionId}`, { expectedStatus: 404 }));
  record(
    await pub.request("public list answers hidden question", "GET", `/api/qa/questions/${questionId}/answers`, {
      expectedStatus: 404,
    })
  );

  record(
    await teacher.request("teacher include_hidden get question", "GET", `/api/qa/questions/${questionId}?include_hidden=true`, {
      expectedStatus: 200,
    })
  );

  record(await quotaStudent.request("register", "POST", "/api/auth/register", { body: quotaStudentCreds, expectedStatus: 201 }));
  record(
    await quotaStudent.request("login", "POST", "/api/auth/login", {
      body: { email: quotaStudentCreds.email, password: quotaStudentCreds.password },
      expectedStatus: 200,
    })
  );
  for (let i = 1; i <= 5; i += 1) {
    record(
      await quotaStudent.request(`create question quota ${i}`, "POST", "/api/qa/questions", {
        body: {
          module_id: moduleId,
          resource_id: resourceId,
          title: `Quota question ${i}`,
          body: "Contenu de test pour quota question.",
        },
        expectedStatus: 201,
      })
    );
  }
  record(
    await quotaStudent.request("create question quota blocked", "POST", "/api/qa/questions", {
      body: {
        module_id: moduleId,
        resource_id: resourceId,
        title: "Quota question blocked",
        body: "Contenu de test pour quota question.",
      },
      expectedStatus: 429,
    })
  );

  record(await admin.request("admin favorites forbidden", "GET", "/api/favorites/my-favorites", { expectedStatus: 403 }));
  record(
    await admin.request("admin ratings forbidden", "POST", "/api/ratings", {
      body: { resource_id: 1, score: 5, comment: "test" },
      expectedStatus: 403,
    })
  );

  const failed = tests.filter((t) => !t.ok);
  console.log("QA_E2E_RESULTS_START");
  for (const t of tests) {
    console.log(`${t.ok ? "PASS" : "FAIL"} | ${t.status} | ${t.testName}${t.message ? ` | ${t.message}` : ""}`);
  }
  console.log("QA_E2E_RESULTS_END");
  console.log(`TOTAL=${tests.length} PASS=${tests.length - failed.length} FAIL=${failed.length}`);

  if (failed.length) process.exit(1);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
