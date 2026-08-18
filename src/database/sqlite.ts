import { open } from '@op-engineering/op-sqlite';

import migrateV1 from './migrations/v1';

export const db = open({
  name: 'taskflow.sqlite',
});

/**
 * Database initialization lock.
 *
 * Important:
 * Multiple parts of the app can call initializeDatabase()
 * at the same time.
 *
 * Without this promise lock, two callers can both see
 * initialized === false and execute the same migration.
 */
let initializationPromise: Promise<void> | null = null;

async function runDatabaseInitialization(): Promise<void> {
  // Enable foreign-key enforcement.
  await db.execute('PRAGMA foreign_keys = ON;');

  // WAL provides better concurrency and durability.
  await db.execute('PRAGMA journal_mode = WAL;');

  /**
   * Migration tracking table.
   */
  await db.execute(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  /**
   * Find the latest migration already applied.
   */
  const result = await db.execute(`
    SELECT
      version
    FROM schema_migrations
    ORDER BY version DESC
    LIMIT 1;
  `);

  const currentVersion =
    result.rows.length > 0 ? Number(result.rows[0].version) : 0;

  /**
   * Migration V1.
   */
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
}

/**
 * Initialize the database exactly once.
 *
 * If several parts of the application call this function
 * simultaneously, they all wait for the SAME Promise.
 */
export async function initializeDatabase() {
  if (!initializationPromise) {
    initializationPromise = runDatabaseInitialization();
  }

  try {
    await initializationPromise;

    return db;
  } catch (error) {
    /**
     * Allow another initialization attempt if the
     * first initialization failed.
     */
    initializationPromise = null;

    throw error;
  }
}
