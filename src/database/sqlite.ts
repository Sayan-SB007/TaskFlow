import {open} from '@op-engineering/op-sqlite';

import migrateV1 from './migrations/v1';

export const db = open({
  name: 'taskflow.sqlite',
});

let initialized = false;

export async function initializeDatabase() {
  if (initialized) {
    return db;
  }

  // Enable foreign-key enforcement.
  await db.execute(
    'PRAGMA foreign_keys = ON;',
  );

  // Better durability/performance balance.
  await db.execute(
    'PRAGMA journal_mode = WAL;',
  );

  await db.execute(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  const result = await db.execute(
    `
      SELECT version
      FROM schema_migrations
      ORDER BY version DESC
      LIMIT 1;
    `,
  );

  const currentVersion =
    result.rows.length > 0
      ? Number(result.rows[0].version)
      : 0;

  if (currentVersion < 1) {
    await migrateV1(db);

    await db.execute(
      `
        INSERT INTO schema_migrations (
          version,
          applied_at
        )
        VALUES (?, ?);
      `,
      [1, new Date().toISOString()],
    );
  }

  initialized = true;

  return db;
}