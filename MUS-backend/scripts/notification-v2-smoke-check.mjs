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

const run = async () => {
  const random = Date.now();
  const student = new Client("student");

  push(
    await student.request("register", "POST", "/api/auth/register", {
      body: { email: `notif.v2.${random}@example.com`, password: "Pass1234!", full_name: "Notif V2 Student" },
      expected: 201,
    })
  );

  push(
    await student.request("login", "POST", "/api/auth/login", {
      body: { email: `notif.v2.${random}@example.com`, password: "Pass1234!" },
      expected: 200,
    })
  );

  const token = `device-token-${random}-abcdefghijklmnopqrstuvwxyz`;

  push(
    await student.request("register push device", "POST", "/api/notifications/push-devices", {
      body: { device_token: token, platform: "web", device_name: "Chrome Desktop" },
      expected: 201,
    })
  );

  push(await student.request("list push devices", "GET", "/api/notifications/push-devices", { expected: 200 }));
  push(await student.request("list notifications", "GET", "/api/notifications", { expected: 200 }));

  push(
    await student.request("unregister push device", "DELETE", `/api/notifications/push-devices/${encodeURIComponent(token)}`, {
      expected: 200,
    })
  );

  push(await student.request("list push devices active only", "GET", "/api/notifications/push-devices?active_only=true", { expected: 200 }));

  const failed = results.filter((r) => !r.ok);
  console.log("NOTIFICATION_V2_SMOKE_START");
  for (const r of results) {
    console.log(`${r.ok ? "PASS" : "FAIL"} | ${r.status} | ${r.name}${r.message ? ` | ${r.message}` : ""}`);
  }
  console.log("NOTIFICATION_V2_SMOKE_END");
  console.log(`TOTAL=${results.length} PASS=${results.length - failed.length} FAIL=${failed.length}`);

  if (failed.length) process.exit(1);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
