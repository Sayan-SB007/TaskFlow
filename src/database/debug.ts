import {db, initializeDatabase} from './sqlite';

export async function debugTasks() {
  await initializeDatabase();

  const result = await db.execute(`
    SELECT * FROM tasks;
  `);

  console.log('📦 SQLite TASKS:', result.rows);
}