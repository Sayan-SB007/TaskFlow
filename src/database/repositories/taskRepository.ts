import type { Task } from '../../features/tasks/types';

import { db, initializeDatabase } from '../sqlite';

import { firebaseAuth } from '../../config/firebase';

/* ================================================= */
/* TYPES                                             */
/* ================================================= */

type TaskRow = {
  id: string;

  title: string;

  description: string | null;

  due_date: string;

  due_time: string | null;

  priority: string;

  status: string;

  user_id: string | null;

  sync_state: number;

  created_at: string;

  updated_at: string;

  deleted_at: string | null;
};

/* ================================================= */
/* FIREBASE USER                                     */
/* ================================================= */

function getCurrentUserId(): string | null {
  return firebaseAuth.currentUser?.uid ?? null;
}

/* ================================================= */
/* MAP SQLITE → TASK                                 */
/* ================================================= */

function mapRowToTask(row: TaskRow): Task {
  return {
    id: row.id,

    title: row.title,

    description: row.description ?? '',

    dueDate: row.due_date,

    dueTime: row.due_time ?? '',

    priority: row.priority as Task['priority'],

    status: row.status as Task['status'],

    /*
     * IMPORTANT:
     *
     * The previous implementation was not
     * mapping deleted_at.
     *
     * Without this, syncService cannot
     * know that a task was deleted locally.
     */
    deletedAt: row.deleted_at ?? undefined,

    createdAt: row.created_at,

    updatedAt: row.updated_at,
  };
}

/* ================================================= */
/* GET TASKS                                         */
/* ================================================= */

async function getTasks(): Promise<Task[]> {
  await initializeDatabase();

  const result = await db.execute(`
      SELECT
        id,
        title,
        description,
        due_date,
        due_time,
        priority,
        status,
        user_id,
        sync_state,
        created_at,
        updated_at,
        deleted_at
      FROM tasks
      WHERE deleted_at IS NULL
      ORDER BY
        CASE
          WHEN status = 'pending'
          THEN 0
          ELSE 1
        END,
        due_date ASC,
        due_time ASC;
    `);

  return result.rows.map(row => mapRowToTask(row as TaskRow));
}

/* ================================================= */
/* GET SINGLE TASK                                   */
/* ================================================= */

async function getTaskById(id: string): Promise<Task | null> {
  await initializeDatabase();

  const result = await db.execute(
    `
        SELECT
          id,
          title,
          description,
          due_date,
          due_time,
          priority,
          status,
          user_id,
          sync_state,
          created_at,
          updated_at,
          deleted_at
        FROM tasks
        WHERE id = ?
          AND deleted_at IS NULL
        LIMIT 1;
      `,
    [id],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapRowToTask(result.rows[0] as TaskRow);
}

/* ================================================= */
/* CREATE                                           */
/* ================================================= */

async function createTask(task: Task): Promise<Task> {
  await initializeDatabase();

  const now = new Date().toISOString();

  const userId = getCurrentUserId();

  await db.execute(
    `
      INSERT INTO tasks (
        id,
        title,
        description,
        due_date,
        due_time,
        priority,
        status,
        user_id,
        sync_state,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `,
    [
      task.id,

      task.title,

      task.description ?? '',

      task.dueDate,

      task.dueTime ?? '',

      task.priority,

      task.status,

      userId,

      /*
       * 1 = pending sync
       */
      1,

      task.createdAt || now,

      task.updatedAt || now,
    ],
  );

  await addToSyncQueue(task.id, 'create', task);

  return task;
}

/* ================================================= */
/* UPDATE                                           */
/* ================================================= */

async function updateTask(task: Task): Promise<Task> {
  await initializeDatabase();

  const now = new Date().toISOString();

  await db.execute(
    `
      UPDATE tasks
      SET
        title = ?,
        description = ?,
        due_date = ?,
        due_time = ?,
        priority = ?,
        status = ?,
        sync_state = 1,
        updated_at = ?,
        deleted_at = NULL
      WHERE id = ?;
    `,
    [
      task.title,

      task.description ?? '',

      task.dueDate,

      task.dueTime ?? '',

      task.priority,

      task.status,

      now,

      task.id,
    ],
  );

  const updatedTask: Task = {
    ...task,

    updatedAt: now,

    deletedAt: undefined,
  };

  await addToSyncQueue(task.id, 'update', updatedTask);

  return updatedTask;
}

/* ================================================= */
/* DELETE                                           */
/* ================================================= */

async function deleteTask(id: string): Promise<void> {
  await initializeDatabase();

  const now = new Date().toISOString();

  /*
   * Keep the row locally.
   *
   * Firestore needs to know that the
   * task was deleted.
   */
  await db.execute(
    `
      UPDATE tasks
      SET
        deleted_at = ?,
        sync_state = 2,
        updated_at = ?
      WHERE id = ?;
    `,
    [now, now, id],
  );

  await addToSyncQueue(id, 'delete', {
    id,

    deletedAt: now,
  });
}

/* ================================================= */
/* MARK SYNCED                                       */
/* ================================================= */

async function markSynced(id: string): Promise<void> {
  await initializeDatabase();

  await db.execute(
    `
      UPDATE tasks
      SET
        sync_state = 0
      WHERE id = ?;
    `,
    [id],
  );
}

/* ================================================= */
/* REMOVE LOCAL DELETED TASK                        */
/* ================================================= */

async function removeDeletedTask(id: string): Promise<void> {
  await initializeDatabase();

  await db.execute(
    `
      DELETE FROM tasks
      WHERE id = ?
        AND deleted_at IS NOT NULL;
    `,
    [id],
  );
}

/* ================================================= */
/* PENDING TASKS                                     */
/* ================================================= */

async function getPendingTasks(): Promise<Task[]> {
  await initializeDatabase();

  const result = await db.execute(`
      SELECT
        id,
        title,
        description,
        due_date,
        due_time,
        priority,
        status,
        user_id,
        sync_state,
        created_at,
        updated_at,
        deleted_at
      FROM tasks
      WHERE sync_state != 0;
    `);

  return result.rows.map(row => mapRowToTask(row as TaskRow));
}

/* ================================================= */
/* UPSERT REMOTE TASK                                */
/* ================================================= */

async function upsertRemoteTask(task: Task): Promise<void> {
  await initializeDatabase();

  const userId = getCurrentUserId();

  /*
   * Check whether a local task exists.
   */
  const existingResult = await db.execute(
    `
        SELECT
          id,
          title,
          description,
          due_date,
          due_time,
          priority,
          status,
          user_id,
          sync_state,
          created_at,
          updated_at,
          deleted_at
        FROM tasks
        WHERE id = ?
        LIMIT 1;
      `,
    [task.id],
  );

  if (existingResult.rows.length > 0) {
    const existing = existingResult.rows[0] as TaskRow;

    /*
     * Never overwrite a local pending change.
     *
     * The local version must sync first.
     */
    if (existing.sync_state !== 0) {
      return;
    }

    /*
     * Local version is newer.
     */
    if (
      new Date(existing.updated_at).getTime() >
      new Date(task.updatedAt).getTime()
    ) {
      return;
    }

    await db.execute(
      `
        UPDATE tasks
        SET
          title = ?,
          description = ?,
          due_date = ?,
          due_time = ?,
          priority = ?,
          status = ?,
          user_id = ?,
          sync_state = 0,
          created_at = ?,
          updated_at = ?,
          deleted_at = NULL
        WHERE id = ?;
      `,
      [
        task.title,

        task.description ?? '',

        task.dueDate,

        task.dueTime ?? '',

        task.priority,

        task.status,

        userId,

        task.createdAt,

        task.updatedAt,

        task.id,
      ],
    );

    return;
  }

  /*
   * Task doesn't exist locally.
   */
  await db.execute(
    `
      INSERT INTO tasks (
        id,
        title,
        description,
        due_date,
        due_time,
        priority,
        status,
        user_id,
        sync_state,
        created_at,
        updated_at,
        deleted_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, NULL);
    `,
    [
      task.id,

      task.title,

      task.description ?? '',

      task.dueDate,

      task.dueTime ?? '',

      task.priority,

      task.status,

      userId,

      task.createdAt,

      task.updatedAt,
    ],
  );
}

/* ================================================= */
/* SYNC QUEUE                                        */
/* ================================================= */

async function addToSyncQueue(
  entityId: string,

  operation: 'create' | 'update' | 'delete',

  payload: unknown,
): Promise<void> {
  await db.execute(
    `
      INSERT INTO sync_queue (
        entity_type,
        entity_id,
        operation,
        payload,
        created_at
      )
      VALUES (?, ?, ?, ?, ?);
    `,
    [
      'task',

      entityId,

      operation,

      JSON.stringify(payload),

      new Date().toISOString(),
    ],
  );
}

/* ================================================= */
/* EXPORT                                            */
/* ================================================= */

export const taskRepository = {
  getTasks,

  getTaskById,

  createTask,

  updateTask,

  deleteTask,

  markSynced,

  getPendingTasks,

  upsertRemoteTask,

  removeDeletedTask,
};
