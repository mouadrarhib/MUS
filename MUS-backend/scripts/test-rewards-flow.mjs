import "dotenv/config";
import { Client } from "pg";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:5001/api";
const PASSWORD = "Password123!";

const pg = new Client({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT),
  ssl: { rejectUnauthorized: false },
});

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const parseCookie = (response) => {
  const cookie = response.headers.get("set-cookie");
  if (!cookie) return null;
  return cookie.split(";")[0];
};

const api = async (path, { method = "GET", body, cookie } = {}) => {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (cookie) headers.Cookie = cookie;

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (_error) {
    payload = null;
  }

  return { response, payload, cookie: parseCookie(response) };
};

const registerAndLogin = async (email, fullName) => {
  const registerResult = await api("/auth/register", {
    method: "POST",
    body: { email, password: PASSWORD, full_name: fullName },
  });

  if (registerResult.response.ok) {
    const user = registerResult.payload?.data?.user;
    const cookie = registerResult.cookie;
    assert(cookie, `Missing auth cookie after register for ${email}`);
    return { user, cookie };
  }

  const registerMessage = registerResult.payload?.message || "";
  const canLogin =
    registerResult.response.status === 409 ||
    registerMessage.toLowerCase().includes("already") ||
    registerMessage.toLowerCase().includes("exists");

  if (!canLogin) {
    throw new Error(
      `Register failed for ${email}: ${registerResult.response.status} ${registerMessage}`
    );
  }

  const loginResult = await api("/auth/login", {
    method: "POST",
    body: { email, password: PASSWORD },
  });

  if (!loginResult.response.ok) {
    const msg = loginResult.payload?.message || "Unknown login error";
    throw new Error(`Login failed for ${email}: ${loginResult.response.status} ${msg}`);
  }

  const user = loginResult.payload?.data?.user;
  const cookie = loginResult.cookie;
  assert(cookie, `Missing auth cookie after login for ${email}`);
  return { user, cookie };
};

const getUserPoints = async (userId) => {
  const res = await pg.query("SELECT COALESCE(points, 0) AS points FROM public.users WHERE id = $1", [
    userId,
  ]);
  assert(res.rows.length === 1, `User not found for id ${userId}`);
  return Number(res.rows[0].points);
};

const getAnyResourceTypeId = async () => {
  const res = await pg.query("SELECT id FROM public.resource_types ORDER BY id LIMIT 1");
  assert(res.rows.length > 0, "No resource types found in database");
  return Number(res.rows[0].id);
};

const getResourceIdFromResponse = (payload) => {
  const data = payload?.data;
  if (!data) return null;
  if (typeof data.id === "number") return data.id;
  if (Array.isArray(data) && data[0]?.id) return Number(data[0].id);
  return null;
};

const run = async () => {
  console.log("Testing reward flow with virtual API data...");
  await pg.connect();

  try {
    const ts = Date.now();
    const creatorEmail = `creator_rewards_${ts}@virtual.test`;
    const downloaderEmail = `downloader_rewards_${ts}@virtual.test`;

    const creatorAuth = await registerAndLogin(creatorEmail, "Virtual Creator");
    const downloaderAuth = await registerAndLogin(downloaderEmail, "Virtual Downloader");

    const creatorId = creatorAuth.user?.id;
    assert(creatorId, "Creator ID missing after authentication");

    const resourceTypeId = await getAnyResourceTypeId();

    const createRes = await api("/resources", {
      method: "POST",
      cookie: creatorAuth.cookie,
      body: {
        title: `Virtual Reward Resource ${ts}`,
        description: "Resource created for downloads/favorites points test",
        resource_type_id: resourceTypeId,
        url: "https://example.com/virtual-resource.pdf",
        language: "en",
        license: "CC BY 4.0",
        educational_type: "course",
        format: "pdf",
      },
    });

    assert(createRes.response.ok, `Resource creation failed: ${createRes.payload?.message}`);
    const resourceId = getResourceIdFromResponse(createRes.payload);
    assert(resourceId, "Could not extract resource ID from create response");

    await pg.query(
      "UPDATE public.resources SET status = 'published'::resource_status WHERE id = $1",
      [resourceId]
    );

    const pointsBefore = await getUserPoints(creatorId);

    const download1 = await api(`/resources/${resourceId}/download`, {
      method: "POST",
      cookie: downloaderAuth.cookie,
    });
    assert(download1.response.ok, `First download failed: ${download1.payload?.message}`);

    const pointsAfterDownload1 = await getUserPoints(creatorId);
    assert(
      pointsAfterDownload1 === pointsBefore + 10,
      `Expected +10 points after first download, got ${pointsAfterDownload1 - pointsBefore}`
    );

    const download2 = await api(`/resources/${resourceId}/download`, {
      method: "POST",
      cookie: downloaderAuth.cookie,
    });
    assert(download2.response.ok, `Second download failed: ${download2.payload?.message}`);

    const pointsAfterDownload2 = await getUserPoints(creatorId);
    assert(
      pointsAfterDownload2 === pointsAfterDownload1,
      "Points changed on repeated download; expected no additional points"
    );

    const addFavorite = await api("/favorites", {
      method: "POST",
      cookie: downloaderAuth.cookie,
      body: { resource_id: resourceId },
    });
    assert(addFavorite.response.ok, `Add favorite failed: ${addFavorite.payload?.message}`);

    const pointsAfterFavorite = await getUserPoints(creatorId);
    assert(
      pointsAfterFavorite === pointsAfterDownload2 + 2,
      `Expected +2 points after favorite, got ${pointsAfterFavorite - pointsAfterDownload2}`
    );

    const removeFavorite = await api(`/favorites/${resourceId}`, {
      method: "DELETE",
      cookie: downloaderAuth.cookie,
    });
    assert(removeFavorite.response.ok, `Remove favorite failed: ${removeFavorite.payload?.message}`);

    const pointsAfterUnfavorite = await getUserPoints(creatorId);
    assert(
      pointsAfterUnfavorite === pointsAfterFavorite - 2,
      `Expected -2 points after unfavorite, got ${pointsAfterFavorite - pointsAfterUnfavorite}`
    );

    console.log("\nPASS - Downloads/Favorites reward flow works correctly");
    console.table([
      { step: "Initial", points: pointsBefore },
      { step: "After first download", points: pointsAfterDownload1 },
      { step: "After second download", points: pointsAfterDownload2 },
      { step: "After favorite", points: pointsAfterFavorite },
      { step: "After unfavorite", points: pointsAfterUnfavorite },
    ]);

    console.log("\nAPI checks:");
    console.log(`- POST /api/resources/${resourceId}/download -> ${download1.response.status}`);
    console.log(`- POST /api/resources/${resourceId}/download (repeat) -> ${download2.response.status}`);
    console.log(`- POST /api/favorites -> ${addFavorite.response.status}`);
    console.log(`- DELETE /api/favorites/${resourceId} -> ${removeFavorite.response.status}`);
  } finally {
    await pg.end();
  }
};

run().catch((error) => {
  console.error("\nFAIL - Rewards API test failed");
  console.error(error.message);
  process.exitCode = 1;
});
