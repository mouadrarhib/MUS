import 'dotenv/config';
import sequelize from '../src/config/database.js';
import { deleteObject } from '../src/services/storage/r2Service.js';

const parseMeta = (value) => {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

const run = async () => {
  const [rows] = await sequelize.query('SELECT id, object_key, metadata FROM public.resources');

  const keys = new Set();
  for (const row of rows) {
    if (row?.object_key) keys.add(String(row.object_key));
    const metadata = parseMeta(row?.metadata);
    const thumbKey =
      metadata?.thumbnail?.object_key ||
      metadata?.storage?.thumbnail_object_key ||
      null;
    if (thumbKey) keys.add(String(thumbKey));
  }

  let deleted = 0;
  let failed = 0;
  for (const key of keys) {
    try {
      await deleteObject(key);
      deleted += 1;
    } catch {
      failed += 1;
    }
  }

  await sequelize.query('TRUNCATE TABLE public.resources RESTART IDENTITY CASCADE');

  return {
    resources_found: rows.length,
    r2_keys_found: keys.size,
    r2_deleted: deleted,
    r2_delete_failed: failed,
    db_truncated: true,
  };
};

run()
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
  })
  .catch((error) => {
    console.error('PURGE_FAILED', error?.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
