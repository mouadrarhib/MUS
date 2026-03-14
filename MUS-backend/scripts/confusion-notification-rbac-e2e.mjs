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

  async sseRequest(label, path, { expected = 200, timeoutMs = 3000 } = {}) {
    const headers = { accept: "text/event-stream" };
    if (this.cookie) headers.cookie = this.cookie;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let status = 0;
    let contentType = "";
    let chunk = "";

    try {
      const res = await fetch(`${baseUrl}${path}`, {
        method: "GET",
        headers,
        signal: controller.signal,
      });

      status = res.status;
      contentType = res.headers.get("content-type") || "";

      if (status === 200 && res.body) {
        const reader = res.body.getReader();
        const first = await reader.read();
        chunk = first.value ? new TextDecoder().decode(first.value) : "";
        reader.releaseLock();
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        clearTimeout(timer);
        return {
          ok: false,
          status,
          name: `${this.name} | ${label}`,
          message: String(error.message || error),
          data: null,
        };
      }
    } finally {
      clearTimeout(timer);
    }

    const statusOk = Array.isArray(expected) ? expected.includes(status) : status === expected;
    const streamOk =
      status !== 200 ||
      (contentType.toLowerCase().includes("text/event-stream") && chunk.includes("event: connected"));

    return {
      ok: statusOk && streamOk,
      status,
      name: `${this.name} | ${label}`,
      message: status === 200 ? "SSE connected" : "",
      data: {
        contentType,
        chunk,
      },
    };
  }
}

const results = [];
const push = (result) => results.push(result);

const pickId = (payload) => {
  const data = payload?.data;
  if (!data) return null;
  if (Array.isArray(data)) return data[0]?.id || null;
  return data?.id || null;
};

const pickResourceWithModule = async (client) => {
  const modulesRes = await client.request("setup list modules", "GET", "/api/modules", { expected: 200 });
  push(modulesRes);
  const modules = modulesRes.data?.data || [];

  for (const mod of modules) {
    const resourcesRes = await client.request(
      `setup module ${mod.id} resources`,
      "GET",
      `/api/modules/${mod.id}/resources`,
      { expected: 200 }
    );
    push(resourcesRes);
    const resource = resourcesRes.data?.data?.[0];
    if (resource?.id) {
      return { moduleId: mod.id, resourceId: resource.id };
    }
  }

  return null;
};

const run = async () => {
  const random = Date.now();
  const publicClient = new Client("public");
  const admin = new Client("admin");
  const teacher = new Client("teacher");
  const student = new Client("student");
  const outsider = new Client("outsider-student");

  push(
    await admin.request("login", "POST", "/api/auth/login", {
      body: { email: "user@gmail.com", password: "user1234!" },
      expected: 200,
    })
  );

  const teacherEmail = `rbac.teacher.${random}@example.com`;
  push(
    await teacher.request("register", "POST", "/api/auth/register", {
      body: { email: teacherEmail, password: "Pass1234!", full_name: "RBAC Teacher" },
      expected: 201,
    })
  );
  push(
    await teacher.request("login", "POST", "/api/auth/login", {
      body: { email: teacherEmail, password: "Pass1234!" },
      expected: 200,
    })
  );

  const studentEmail = `rbac.student.${random}@example.com`;
  push(
    await student.request("register", "POST", "/api/auth/register", {
      body: { email: studentEmail, password: "Pass1234!", full_name: "RBAC Student" },
      expected: 201,
    })
  );
  push(
    await student.request("login", "POST", "/api/auth/login", {
      body: { email: studentEmail, password: "Pass1234!" },
      expected: 200,
    })
  );

  const outsiderEmail = `rbac.outsider.${random}@example.com`;
  push(
    await outsider.request("register", "POST", "/api/auth/register", {
      body: { email: outsiderEmail, password: "Pass1234!", full_name: "RBAC Outsider" },
      expected: 201,
    })
  );
  push(
    await outsider.request("login", "POST", "/api/auth/login", {
      body: { email: outsiderEmail, password: "Pass1234!" },
      expected: 200,
    })
  );

  const rolesRes = await admin.request("list roles", "GET", "/api/roles", { expected: 200 });
  push(rolesRes);
  const teacherRoleId = (rolesRes.data?.data || []).find((r) => r.name === "teacher")?.id;

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
      await teacher.request("re-login after role", "POST", "/api/auth/login", {
        body: { email: teacherEmail, password: "Pass1234!" },
        expected: 200,
      })
    );
  }

  const candidate = await pickResourceWithModule(admin);
  let moduleId = candidate?.moduleId || null;
  let resourceId = candidate?.resourceId || null;

  if (!moduleId || !resourceId) {
    const fallbackModules = await admin.request("fallback list modules", "GET", "/api/modules", { expected: 200 });
    push(fallbackModules);
    moduleId = fallbackModules.data?.data?.[0]?.id || null;

    if (moduleId) {
      const created = await admin.request("fallback create resource", "POST", "/api/resources", {
        body: {
          title: `RBAC Resource ${random}`,
          description: "Ressource de test RBAC confusion/notification",
          status: "published",
          resource_type_id: 1,
          format: "pdf",
          educational_type: "course",
          url: "https://example.com/rbac-resource.pdf",
        },
        expected: 201,
      });
      push(created);
      resourceId = pickId(created.data);

      if (resourceId) {
        push(
          await admin.request("fallback map resource module", "POST", `/api/resources/${resourceId}/modules`, {
            body: { module_id: moduleId, chapter: "RBAC", difficulty: "medium", exam_related: false },
            expected: [200, 201],
          })
        );
      }
    }
  }

  if (!moduleId || !resourceId || !teacherId) {
    push({ ok: false, status: 0, name: "setup | required ids", message: "module/resource/teacher manquant", data: null });
  }

  if (moduleId && resourceId && teacherId) {
    // -----------------------------------------
    // Confusion endpoints - RBAC
    // -----------------------------------------
    push(
      await publicClient.request("confusion signal unauth blocked", "POST", `/api/resources/${resourceId}/confusion-signals`, {
        body: { module_id: moduleId, note: "blocage" },
        expected: 401,
      })
    );

    push(
      await teacher.request("confusion signal teacher profile (has student role) allowed", "POST", `/api/resources/${resourceId}/confusion-signals`, {
        body: { module_id: moduleId, note: "blocage" },
        expected: 201,
      })
    );

    push(
      await admin.request("confusion signal admin forbidden", "POST", `/api/resources/${resourceId}/confusion-signals`, {
        body: { module_id: moduleId, note: "blocage" },
        expected: 403,
      })
    );

    const signal = await student.request("confusion signal student allowed", "POST", `/api/resources/${resourceId}/confusion-signals`, {
      body: { module_id: moduleId, note: "Je ne comprends pas cette ressource" },
      expected: 201,
    });
    push(signal);

    const caseId = signal.data?.data?.case?.id;

    push(
      await student.request("confusion count student forbidden", "GET", `/api/resources/${resourceId}/confusion-signals/count`, {
        expected: 403,
      })
    );
    push(
      await publicClient.request("confusion count unauth blocked", "GET", `/api/resources/${resourceId}/confusion-signals/count`, {
        expected: 401,
      })
    );
    push(
      await teacher.request("confusion count teacher allowed", "GET", `/api/resources/${resourceId}/confusion-signals/count`, {
        expected: 200,
      })
    );
    push(
      await admin.request("confusion count admin allowed", "GET", `/api/resources/${resourceId}/confusion-signals/count`, {
        expected: 200,
      })
    );

    push(
      await student.request("confusion recent student forbidden", "GET", `/api/resources/${resourceId}/confusion-signals/recent`, {
        expected: 403,
      })
    );
    push(
      await publicClient.request("confusion recent unauth blocked", "GET", `/api/resources/${resourceId}/confusion-signals/recent`, {
        expected: 401,
      })
    );
    push(
      await teacher.request("confusion recent teacher allowed", "GET", `/api/resources/${resourceId}/confusion-signals/recent?limit=5`, {
        expected: 200,
      })
    );
    push(
      await admin.request("confusion recent admin allowed", "GET", `/api/resources/${resourceId}/confusion-signals/recent?limit=5`, {
        expected: 200,
      })
    );

    push(
      await publicClient.request("confusion overview unauth blocked", "GET", "/api/admin/confusion/overview", {
        expected: 401,
      })
    );
    push(
      await teacher.request("confusion overview teacher forbidden", "GET", "/api/admin/confusion/overview", {
        expected: 403,
      })
    );
    push(
      await student.request("confusion overview student forbidden", "GET", "/api/admin/confusion/overview", {
        expected: 403,
      })
    );
    push(
      await admin.request("confusion overview admin allowed", "GET", "/api/admin/confusion/overview?group_by=module&days=7", {
        expected: 200,
      })
    );

    push(
      await publicClient.request("my confusion cases unauth blocked", "GET", "/api/students/me/confusion-cases", {
        expected: 401,
      })
    );
    push(
      await teacher.request("my confusion cases teacher profile (has student role) allowed", "GET", "/api/students/me/confusion-cases", {
        expected: 200,
      })
    );
    push(
      await admin.request("my confusion cases admin forbidden", "GET", "/api/students/me/confusion-cases", {
        expected: 403,
      })
    );
    push(
      await student.request("my confusion cases student allowed", "GET", "/api/students/me/confusion-cases", {
        expected: 200,
      })
    );

    push(
      await publicClient.request("staff confusion cases unauth blocked", "GET", "/api/confusion/cases", {
        expected: 401,
      })
    );
    push(
      await student.request("staff confusion cases student forbidden", "GET", "/api/confusion/cases", {
        expected: 403,
      })
    );
    push(
      await teacher.request("staff confusion cases teacher allowed", "GET", "/api/confusion/cases?assigned_to_me=true", {
        expected: 200,
      })
    );
    push(
      await admin.request("staff confusion cases admin allowed", "GET", "/api/confusion/cases", {
        expected: 200,
      })
    );

    push(
      await publicClient.request("module staff upsert unauth blocked", "POST", "/api/confusion/module-staff-assignments", {
        body: { module_id: moduleId, user_id: teacherId, assignment_role: "teacher_referent", is_primary: true, is_active: true },
        expected: 401,
      })
    );
    push(
      await student.request("module staff upsert student forbidden", "POST", "/api/confusion/module-staff-assignments", {
        body: { module_id: moduleId, user_id: teacherId, assignment_role: "teacher_referent", is_primary: true, is_active: true },
        expected: 403,
      })
    );
    push(
      await teacher.request("module staff upsert teacher forbidden", "POST", "/api/confusion/module-staff-assignments", {
        body: { module_id: moduleId, user_id: teacherId, assignment_role: "teacher_referent", is_primary: true, is_active: true },
        expected: 403,
      })
    );
    push(
      await admin.request("module staff upsert admin allowed", "POST", "/api/confusion/module-staff-assignments", {
        body: { module_id: moduleId, user_id: teacherId, assignment_role: "teacher_referent", is_primary: true, is_active: true },
        expected: 200,
      })
    );

    push(
      await publicClient.request("module staff list unauth blocked", "GET", `/api/confusion/module-staff-assignments/${moduleId}`, {
        expected: 401,
      })
    );
    push(
      await student.request("module staff list student forbidden", "GET", `/api/confusion/module-staff-assignments/${moduleId}`, {
        expected: 403,
      })
    );
    push(
      await teacher.request("module staff list teacher forbidden", "GET", `/api/confusion/module-staff-assignments/${moduleId}`, {
        expected: 403,
      })
    );
    push(
      await admin.request("module staff list admin allowed", "GET", `/api/confusion/module-staff-assignments/${moduleId}`, {
        expected: 200,
      })
    );

    if (caseId) {
      push(
        await publicClient.request("case assign unauth blocked", "PATCH", `/api/confusion/cases/${caseId}/assign`, {
          body: { assignee_user_id: teacherId, reason: "Repartition" },
          expected: 401,
        })
      );
      push(
        await student.request("case assign student forbidden", "PATCH", `/api/confusion/cases/${caseId}/assign`, {
          body: { assignee_user_id: teacherId, reason: "Repartition" },
          expected: 403,
        })
      );
      push(
        await teacher.request("case assign teacher forbidden", "PATCH", `/api/confusion/cases/${caseId}/assign`, {
          body: { assignee_user_id: teacherId, reason: "Repartition" },
          expected: 403,
        })
      );
      push(
        await admin.request("case assign admin allowed", "PATCH", `/api/confusion/cases/${caseId}/assign`, {
          body: { assignee_user_id: teacherId, reason: "Affectation au referent" },
          expected: 200,
        })
      );

      push(
        await publicClient.request("case status unauth blocked", "PATCH", `/api/confusion/cases/${caseId}/status`, {
          body: { status: "en_cours", reason: "Traitement" },
          expected: 401,
        })
      );
      push(
        await student.request("case status student forbidden", "PATCH", `/api/confusion/cases/${caseId}/status`, {
          body: { status: "en_cours", reason: "Traitement" },
          expected: 403,
        })
      );
      push(
        await teacher.request("case status teacher allowed", "PATCH", `/api/confusion/cases/${caseId}/status`, {
          body: { status: "en_cours", reason: "Analyse en cours" },
          expected: 200,
        })
      );
      push(
        await admin.request("case status admin allowed", "PATCH", `/api/confusion/cases/${caseId}/status`, {
          body: { status: "resolu", reason: "Resolution admin" },
          expected: 200,
        })
      );

      push(
        await publicClient.request("case details unauth blocked", "GET", `/api/confusion/cases/${caseId}`, {
          expected: 401,
        })
      );
      push(
        await student.request("case details owner student allowed", "GET", `/api/confusion/cases/${caseId}`, {
          expected: 200,
        })
      );
      push(
        await outsider.request("case details outsider denied", "GET", `/api/confusion/cases/${caseId}`, {
          expected: [403, 404],
        })
      );
      push(
        await teacher.request("case details teacher allowed", "GET", `/api/confusion/cases/${caseId}`, {
          expected: 200,
        })
      );
      push(
        await admin.request("case details admin allowed", "GET", `/api/confusion/cases/${caseId}`, {
          expected: 200,
        })
      );

      push(
        await publicClient.request("case events unauth blocked", "GET", `/api/confusion/cases/${caseId}/events`, {
          expected: 401,
        })
      );
      push(
        await student.request("case events owner student allowed", "GET", `/api/confusion/cases/${caseId}/events?limit=20`, {
          expected: 200,
        })
      );
      push(
        await outsider.request("case events outsider denied", "GET", `/api/confusion/cases/${caseId}/events?limit=20`, {
          expected: [403, 404],
        })
      );
      push(
        await teacher.request("case events teacher allowed", "GET", `/api/confusion/cases/${caseId}/events?limit=20`, {
          expected: 200,
        })
      );
      push(
        await admin.request("case events admin allowed", "GET", `/api/confusion/cases/${caseId}/events?limit=20`, {
          expected: 200,
        })
      );

      // -----------------------------------------
      // Notifications endpoints - RBAC
      // -----------------------------------------
      push(await publicClient.request("notifications list unauth blocked", "GET", "/api/notifications", { expected: 401 }));
      push(await student.request("notifications list student allowed", "GET", "/api/notifications?unread_only=true", { expected: 200 }));
      push(await teacher.request("notifications list teacher allowed", "GET", "/api/notifications", { expected: 200 }));
      push(await admin.request("notifications list admin allowed", "GET", "/api/notifications", { expected: 200 }));

      const studentNotifs = await student.request("notifications list for read test", "GET", "/api/notifications", { expected: 200 });
      push(studentNotifs);
      const studentNotifId = studentNotifs.data?.data?.rows?.[0]?.id || null;

      if (studentNotifId) {
        push(
          await student.request("notification mark read owner allowed", "PATCH", `/api/notifications/${studentNotifId}/read`, {
            expected: 200,
          })
        );
        push(
          await teacher.request("notification mark read other user denied", "PATCH", `/api/notifications/${studentNotifId}/read`, {
            expected: 404,
          })
        );
      } else {
        push({ ok: false, status: 0, name: "notifications | read test setup", message: "Aucune notification etudiant disponible", data: null });
      }

      push(
        await publicClient.request("notification mark read unauth blocked", "PATCH", `/api/notifications/${studentNotifId || 1}/read`, {
          expected: 401,
        })
      );

      const deviceToken = `rbac-device-${random}-abcdefghijklmnopqrstuvwxyz`;

      push(
        await publicClient.request("push device register unauth blocked", "POST", "/api/notifications/push-devices", {
          body: { device_token: deviceToken, platform: "web", device_name: "RBAC Browser" },
          expected: 401,
        })
      );
      push(
        await student.request("push device register invalid payload", "POST", "/api/notifications/push-devices", {
          body: { device_token: "short", platform: "desktop" },
          expected: 422,
        })
      );
      push(
        await student.request("push device register valid", "POST", "/api/notifications/push-devices", {
          body: { device_token: deviceToken, platform: "web", device_name: "RBAC Browser" },
          expected: 201,
        })
      );

      push(await publicClient.request("push devices list unauth blocked", "GET", "/api/notifications/push-devices", { expected: 401 }));
      push(await student.request("push devices list student allowed", "GET", "/api/notifications/push-devices?active_only=true", { expected: 200 }));

      push(
        await publicClient.request("push device delete unauth blocked", "DELETE", `/api/notifications/push-devices/${encodeURIComponent(deviceToken)}`, {
          expected: 401,
        })
      );
      push(
        await teacher.request("push device delete other user denied", "DELETE", `/api/notifications/push-devices/${encodeURIComponent(deviceToken)}`, {
          expected: 404,
        })
      );
      push(
        await student.request("push device delete owner allowed", "DELETE", `/api/notifications/push-devices/${encodeURIComponent(deviceToken)}`, {
          expected: 200,
        })
      );

      push(await publicClient.sseRequest("notifications stream unauth blocked", "/api/notifications/stream", { expected: 401 }));
      push(await student.sseRequest("notifications stream student allowed", "/api/notifications/stream", { expected: 200 }));
      push(await teacher.sseRequest("notifications stream teacher allowed", "/api/notifications/stream", { expected: 200 }));
      push(await admin.sseRequest("notifications stream admin allowed", "/api/notifications/stream", { expected: 200 }));
    }
  }

  const failed = results.filter((r) => !r.ok);
  console.log("CONFUSION_NOTIFICATION_RBAC_E2E_START");
  for (const r of results) {
    console.log(`${r.ok ? "PASS" : "FAIL"} | ${r.status} | ${r.name}${r.message ? ` | ${r.message}` : ""}`);
  }
  console.log("CONFUSION_NOTIFICATION_RBAC_E2E_END");
  console.log(`TOTAL=${results.length} PASS=${results.length - failed.length} FAIL=${failed.length}`);

  if (failed.length) process.exit(1);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
