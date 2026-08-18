import type { Task } from './types';

import { taskRepository } from '../../database/repositories/taskRepository';
/**
 * TaskService
 *
 * Business/application layer between Redux/UI
 * and the local persistence layer.
 *
 * UI/Redux should not know how SQLite works.
 */
export const taskService = {
  /**
   * Load all locally stored tasks.
   */
  async getTasks(): Promise<Task[]> {
    return taskRepository.getTasks();
  },

  /**
   * Load a single task.
   */
  async getTaskById(id: string): Promise<Task | null> {
    return taskRepository.getTaskById(id);
  },

  /**
   * Create a task locally.
   *
   * The repository also places the mutation
   * into the offline sync queue.
   */
  async createTask(task: Task): Promise<Task> {
    validateTask(task);

    return taskRepository.createTask(task);
  },

  /**
   * Update an existing task.
   */
  async updateTask(task: Task): Promise<Task> {
    validateTask(task);

    const existing = await taskRepository.getTaskById(task.id);

    if (!existing) {
      throw new Error(`Task "${task.id}" was not found.`);
    }

    return taskRepository.updateTask(task);
  },

  /**
   * Toggle task completion state.
   */
  async toggleTask(task: Task): Promise<Task> {
    const updatedTask: Task = {
      ...task,
      status: task.status === 'completed' ? 'pending' : 'completed',
      updatedAt: new Date().toISOString(),
    };

    return taskRepository.updateTask(updatedTask);
  },

  /**
   * Delete a task.
   */
  async deleteTask(id: string): Promise<void> {
    const existing = await taskRepository.getTaskById(id);

    if (!existing) {
      throw new Error(`Task "${id}" was not found.`);
    }

    await taskRepository.deleteTask(id);
  },

  /**
   * Return tasks which still need to
   * be synchronized with the server.
   */
  async getPendingTasks(): Promise<Task[]> {
    return taskRepository.getPendingTasks();
  },

  /**
   * Mark a task as successfully synchronized.
   */
  async markTaskSynced(id: string): Promise<void> {
    await taskRepository.markSynced(id);
  },
};

/* ================================================= */
/* VALIDATION                                        */
/* ================================================= */

function validateTask(task: Task): void {
  if (!task.id.trim()) {
    throw new Error('Task ID is required.');
  }

  if (!task.title.trim()) {
    throw new Error('Task title is required.');
  }

  // if (!task.dueDate.trim()) {
  //   throw new Error(
  //     'Task due date is required.',
  //   );
  // }

  const validPriorities = ['low', 'medium', 'high'];

  if (!validPriorities.includes(task.priority)) {
    throw new Error(`Invalid task priority: ${task.priority}`);
  }

  const validStatuses = ['pending', 'completed'];

  if (!validStatuses.includes(task.status)) {
    throw new Error(`Invalid task status: ${task.status}`);
  }
}
