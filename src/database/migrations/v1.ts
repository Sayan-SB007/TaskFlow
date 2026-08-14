import type {DB} from '@op-engineering/op-sqlite';

export default async function migrateV1(
  db: DB,
) {
  await db.transaction(async tx => {
    /*
     * Tasks are the local source of truth.
     *
     * sync_state:
     * 0 = synced
     * 1 = pending create/update
     * 2 = pending delete
     */

    await tx.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY NOT NULL,

        title TEXT NOT NULL,

        description TEXT,

        due_date TEXT NOT NULL,

        due_time TEXT,

        priority TEXT NOT NULL
          CHECK (
            priority IN (
              'low',
              'medium',
              'high'
            )
          ),

        status TEXT NOT NULL
          CHECK (
            status IN (
              'pending',
              'completed'
            )
          ),

        user_id TEXT,

        sync_state INTEGER NOT NULL DEFAULT 1,

        created_at TEXT NOT NULL,

        updated_at TEXT NOT NULL,

        deleted_at TEXT
      );
    `);

    await tx.execute(`
      CREATE INDEX IF NOT EXISTS
      idx_tasks_due_date
      ON tasks(due_date);
    `);

    await tx.execute(`
      CREATE INDEX IF NOT EXISTS
      idx_tasks_status
      ON tasks(status);
    `);

    await tx.execute(`
      CREATE INDEX IF NOT EXISTS
      idx_tasks_sync_state
      ON tasks(sync_state);
    `);

    await tx.execute(`
      CREATE INDEX IF NOT EXISTS
      idx_tasks_user_id
      ON tasks(user_id);
    `);

    /*
     * Offline mutation queue.
     *
     * Every local change is recorded here.
     * When internet returns, SyncService will
     * process these operations.
     */

    await tx.execute(`
      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        entity_type TEXT NOT NULL,

        entity_id TEXT NOT NULL,

        operation TEXT NOT NULL
          CHECK (
            operation IN (
              'create',
              'update',
              'delete'
            )
          ),

        payload TEXT NOT NULL,

        created_at TEXT NOT NULL,

        retry_count INTEGER NOT NULL DEFAULT 0,

        last_error TEXT
      );
    `);

    await tx.execute(`
      CREATE INDEX IF NOT EXISTS
      idx_sync_queue_created_at
      ON sync_queue(created_at);
    `);

    await tx.execute(`
      CREATE INDEX IF NOT EXISTS
      idx_sync_queue_entity
      ON sync_queue(entity_type, entity_id);
    `);
  });
}