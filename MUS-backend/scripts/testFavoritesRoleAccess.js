import "dotenv/config";
import app from "../src/app.js";
import { sequelize } from "../src/models/index.js";

const api = async (baseUrl, path, { method = "GET", token, body } = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
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

const ensureAdminRoleForUser = async (userId) => {
  const [roleRows] = await sequelize.query(
    `
    INSERT INTO public.roles(name, description)
    VALUES ('admin', 'Administrator role')
    ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
    RETURNING id
    `
  );
  const roleId = roleRows[0]?.id;

  await sequelize.query(
    `
    INSERT INTO public.user_roles(user_id, role_id)
    VALUES (:user_id, :role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING
    `,
    { replacements: { user_id: userId, role_id: roleId } }
  );
};

const main = async () => {
  await sequelize.authenticate();
  const server = app.listen(5095);
  const baseUrl = "http://127.0.0.1:5095/api";

  try {
    const email = `fav.admin.${Date.now()}@example.com`;
    const password = "TestPass123!";

    await api(baseUrl, "/auth/register", {
      method: "POST",
      body: { full_name: "Fav Admin", email, password },
    });

    const login = await api(baseUrl, "/auth/login", {
      method: "POST",
      body: { email, password },
    });
    const token = login.json?.data?.token;

    const me = await api(baseUrl, "/auth/me", { token });
    await ensureAdminRoleForUser(me.json?.data?.user?.id);

    const login2 = await api(baseUrl, "/auth/login", {
      method: "POST",
      body: { email, password },
    });
    const adminToken = login2.json?.data?.token;

    const favorites = await api(baseUrl, "/favorites/my-favorites", { token: adminToken });
    console.log("[FavoritesRoleTest]", {
      status: favorites.status,
      ok: favorites.ok,
      message: favorites.json?.message,
    });
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await sequelize.close();
  }
};

main().catch((error) => {
  console.error("[FavoritesRoleTest] FAILED", error.message);
  process.exit(1);
});
