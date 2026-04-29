const baseUrl = process.env.BASE_URL || "http://127.0.0.1:5000";

class Client {
  constructor(name) {
    this.name = name;
    this.cookie = "";
  }

  async request(testName, method, path, { body, expectedStatus } = {}) {
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
        `Cannot reach API at ${baseUrl}. Start backend or set BASE_URL. Cause: ${reason}`
      );
    }

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
      : expectedStatus === undefined
      ? res.status >= 200 && res.status < 300
      : res.status === expectedStatus;

    return {
      ok,
      status: res.status,
      name: `${this.name} | ${testName}`,
      message: payload?.message || "",
      payload,
    };
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const requestWithRetry = async (
  client,
  testName,
  method,
  path,
  options,
  { retries = 3, delayMs = 1200 } = {}
) => {
  let last;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    last = await client.request(testName, method, path, options);
    if (last.status !== 429) return last;
    if (attempt < retries) await sleep(delayMs * (attempt + 1));
  }
  return last;
};

const tests = [];
const record = (result) => tests.push(result);
const must = (result, note = "") => {
  record(result);
  if (!result.ok) {
    throw new Error(`FAILED: ${result.name} | status=${result.status} ${note} ${result.message}`.trim());
  }
  return result;
};

const getData = (result) => result?.payload?.data;

const randomSuffix = Date.now();
const adminCreds = {
  email: process.env.ADMIN_EMAIL || "user@gmail.com",
  password: process.env.ADMIN_PASSWORD || "user1234!",
};

const studentCreds = {
  email: `session.student.${randomSuffix}@example.com`,
  password: "Pass1234!",
  full_name: "Session Student",
};

const teacherCreds = {
  email: `session.teacher.${randomSuffix}@example.com`,
  password: "Pass1234!",
  full_name: "Session Teacher",
};


const admin = new Client("admin");
const student = new Client("student");
const teacher = new Client("teacher");
const pub = new Client("public");

const run = async () => {
  must(await requestWithRetry(admin, "admin login", "POST", "/api/auth/login", { body: adminCreds, expectedStatus: 200 }));

  const rolesRes = must(await admin.request("roles list", "GET", "/api/roles", { expectedStatus: 200 }));
  const roles = getData(rolesRes) || [];
  const teacherRole = roles.find((r) => String(r?.name || "").toLowerCase() === "teacher");
  if (!teacherRole?.id) throw new Error("Teacher role not found");

  must(await student.request("register student", "POST", "/api/auth/register", { body: studentCreds, expectedStatus: 201 }));
  must(await requestWithRetry(student, "student login", "POST", "/api/auth/login", {
    body: { email: studentCreds.email, password: studentCreds.password },
    expectedStatus: 200,
  }));

  const studentMe = must(await student.request("student me", "GET", "/api/auth/me", { expectedStatus: 200 }));
  const studentId = getData(studentMe)?.user?.id;
  if (!studentId) throw new Error("Student id missing");

  must(await teacher.request("register teacher user", "POST", "/api/auth/register", { body: teacherCreds, expectedStatus: 201 }));
  must(await requestWithRetry(teacher, "teacher login temp", "POST", "/api/auth/login", {
    body: { email: teacherCreds.email, password: teacherCreds.password },
    expectedStatus: 200,
  }));
  const teacherMeTmp = must(await teacher.request("teacher me temp", "GET", "/api/auth/me", { expectedStatus: 200 }));
  const teacherId = getData(teacherMeTmp)?.user?.id;
  if (!teacherId) throw new Error("Teacher id missing");

  must(await admin.request("assign teacher role", "POST", "/api/user-roles/assign", {
    body: { userId: teacherId, roleId: teacherRole.id },
    expectedStatus: [200, 201],
  }));
  must(await requestWithRetry(teacher, "teacher relogin", "POST", "/api/auth/login", {
    body: { email: teacherCreds.email, password: teacherCreds.password },
    expectedStatus: 200,
  }));

  must(await pub.request("public list slots initially", "GET", "/api/sessions/slots", { expectedStatus: 200 }));

  must(await student.request("student cannot create slot", "POST", "/api/sessions/teacher/slots", {
    body: {
      start_at: new Date(Date.now() + 3600_000).toISOString(),
      end_at: new Date(Date.now() + 5400_000).toISOString(),
      timezone: "UTC",
    },
    expectedStatus: 403,
  }));

  const slotStart = new Date(Date.now() + 2 * 3600_000).toISOString();
  const slotEnd = new Date(Date.now() + 3 * 3600_000).toISOString();

  const createSlotRes = must(await teacher.request("teacher creates slot", "POST", "/api/sessions/teacher/slots", {
    body: { start_at: slotStart, end_at: slotEnd, timezone: "UTC" },
    expectedStatus: 201,
  }));
  const slot = getData(createSlotRes);
  const slotId = slot?.id;
  if (!slotId) throw new Error("Slot id missing");

  must(await teacher.request("teacher list own slots", "GET", "/api/sessions/teacher/slots?include_inactive=true", { expectedStatus: 200 }));
  must(await pub.request("public list slots after create", "GET", `/api/sessions/slots?teacher_id=${teacherId}`, { expectedStatus: 200 }));

  must(await teacher.request("teacher updates own slot", "PATCH", `/api/sessions/teacher/slots/${slotId}`, {
    body: { timezone: "Africa/Casablanca" },
    expectedStatus: 200,
  }));

  const bookingRes = must(await student.request("student books slot", "POST", "/api/sessions/bookings", {
    body: { slot_id: slotId, note: "I need help with calculus" },
    expectedStatus: 201,
  }));
  const booking = getData(bookingRes);
  const bookingId = booking?.id;
  if (!bookingId) throw new Error("Booking id missing");

  must(await student.request("student cannot double-book same slot", "POST", "/api/sessions/bookings", {
    body: { slot_id: slotId },
    expectedStatus: 409,
  }));

  must(await teacher.request("teacher sees booking list", "GET", "/api/sessions/bookings?status=confirmed", { expectedStatus: 200 }));
  must(await student.request("student sees own booking list", "GET", "/api/sessions/bookings?status=confirmed", { expectedStatus: 200 }));

  must(await student.request("student reads booking details", "GET", `/api/sessions/bookings/${bookingId}`, { expectedStatus: 200 }));
  must(await teacher.request("teacher reads booking details", "GET", `/api/sessions/bookings/${bookingId}`, { expectedStatus: 200 }));

  must(await student.request("student sends first message", "POST", `/api/sessions/bookings/${bookingId}/messages`, {
    body: { body: "Hello teacher!" },
    expectedStatus: 201,
  }));

  must(await teacher.request("teacher sends reply message", "POST", `/api/sessions/bookings/${bookingId}/messages`, {
    body: { body: "Hello, happy to help." },
    expectedStatus: 201,
  }));

  must(await teacher.request("teacher lists messages", "GET", `/api/sessions/bookings/${bookingId}/messages`, { expectedStatus: 200 }));

  must(await teacher.request("teacher marks booking completed", "PATCH", `/api/sessions/bookings/${bookingId}/complete`, {
    expectedStatus: 200,
  }));

  must(await student.request("cannot cancel completed booking", "PATCH", `/api/sessions/bookings/${bookingId}/cancel`, {
    body: { reason: "Too late" },
    expectedStatus: 400,
  }));

  const slot2Start = new Date(Date.now() + 4 * 3600_000).toISOString();
  const slot2End = new Date(Date.now() + 5 * 3600_000).toISOString();
  const createSlot2Res = must(await teacher.request("teacher creates second slot", "POST", "/api/sessions/teacher/slots", {
    body: { start_at: slot2Start, end_at: slot2End, timezone: "UTC" },
    expectedStatus: 201,
  }));
  const slot2Id = getData(createSlot2Res)?.id;
  if (!slot2Id) throw new Error("Second slot id missing");

  const booking2Res = must(await student.request("student books second slot", "POST", "/api/sessions/bookings", {
    body: { slot_id: slot2Id },
    expectedStatus: 201,
  }));
  const booking2Id = getData(booking2Res)?.id;
  if (!booking2Id) throw new Error("Second booking id missing");

  must(await teacher.request("teacher cancels second booking", "PATCH", `/api/sessions/bookings/${booking2Id}/cancel`, {
    body: { reason: "Schedule conflict" },
    expectedStatus: 200,
  }));

  must(await teacher.request("teacher deletes unbooked second slot", "DELETE", `/api/sessions/teacher/slots/${slot2Id}`, {
    expectedStatus: 200,
  }));

  console.log("\nSession API E2E completed.\n");
  const failed = tests.filter((t) => !t.ok);
  tests.forEach((t) => {
    const icon = t.ok ? "PASS" : "FAIL";
    console.log(`${icon} ${t.name} -> ${t.status} ${t.message ? `| ${t.message}` : ""}`);
  });
  console.log(`\nSummary: ${tests.length - failed.length}/${tests.length} passed`);
  if (failed.length) process.exit(1);
};

run().catch((error) => {
  console.error("\nSession E2E failed:", error.message);
  console.error(error.stack);
  process.exit(1);
});
