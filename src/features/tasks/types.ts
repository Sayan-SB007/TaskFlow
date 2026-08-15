export type TaskPriority =
  | 'low'
  | 'medium'
  | 'high';

export type TaskStatus =
  | 'pending'
  | 'completed';

export type TaskFilter =
  | 'all'
  | 'today'
  | 'upcoming';

export interface Task {
  id: string;

  title: string;

  description?: string;

  priority: TaskPriority;

  status: TaskStatus;

  dueDate: string;

  dueTime?: string;

  /*
   * SQLite soft-delete timestamp.
   *
   * This is normally undefined for an
   * active task.
   */
  deletedAt?: string;

  createdAt: string;

  updatedAt: string;
}