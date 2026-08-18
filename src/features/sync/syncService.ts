import NetInfo from '@react-native-community/netinfo';

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from 'firebase/firestore';

import { firebaseAuth, firestoreDb } from '../../config/firebase';

import type { Task } from '../tasks/types';

import { taskRepository } from '../../database/repositories/taskRepository';

/* ================================================= */
/* SYNC STATUS                                       */
/* ================================================= */

export type SyncStatus = 'offline' | 'syncing' | 'synced' | 'error';

export interface SyncStatusState {
  status: SyncStatus;

  pendingCount: number;

  isConnected: boolean;

  message?: string;
}

let syncStatus: SyncStatusState = {
  status: 'synced',

  pendingCount: 0,

  isConnected: true,
};

const syncStatusListeners = new Set<(state: SyncStatusState) => void>();

function notifySyncStatus() {
  const state = {
    ...syncStatus,
  };

  syncStatusListeners.forEach(listener => {
    listener(state);
  });
}

/* ================================================= */
/* STATUS SUBSCRIPTION                               */
/* ================================================= */

export function subscribeSyncStatus(
  listener: (state: SyncStatusState) => void,
): () => void {
  syncStatusListeners.add(listener);

  /*
   * Immediately provide the
   * current state to the subscriber.
   */
  listener({
    ...syncStatus,
  });

  return () => {
    syncStatusListeners.delete(listener);
  };
}

/* ================================================= */
/* UPDATE STATUS                                     */
/* ================================================= */

function setSyncStatus(update: Partial<SyncStatusState>) {
  syncStatus = {
    ...syncStatus,
    ...update,
  };

  notifySyncStatus();
}

/* ================================================= */
/* PENDING COUNT                                     */
/* ================================================= */

async function refreshPendingCount(): Promise<number> {
  try {
    const pendingTasks = await taskRepository.getPendingTasks();

    const count = pendingTasks.length;

    setSyncStatus({
      pendingCount: count,
    });

    return count;
  } catch (error) {
    console.error('SYNC: Unable to read pending count.', error);

    return syncStatus.pendingCount;
  }
}

/* ================================================= */
/* FIRESTORE TASK COLLECTION                         */
/* ================================================= */

function getTasksCollection() {
  const user = firebaseAuth.currentUser;

  if (!user) {
    return null;
  }

  return collection(firestoreDb, 'users', user.uid, 'tasks');
}

/* ================================================= */
/* PUSH LOCAL → FIRESTORE                            */
/* ================================================= */

async function pushPendingTasks(): Promise<void> {
  const user = firebaseAuth.currentUser;

  if (!user) {
    return;
  }

  const tasksCollection = getTasksCollection();

  if (!tasksCollection) {
    return;
  }

  const pendingTasks = await taskRepository.getPendingTasks();

  setSyncStatus({
    pendingCount: pendingTasks.length,
  });

  if (pendingTasks.length === 0) {
    return;
  }

  console.log(`SYNC: ${pendingTasks.length} pending task(s).`);

  /*
   * Process the current pending snapshot.
   *
   * New changes created while this sync is
   * running will remain pending and can be
   * picked up by the next sync cycle.
   */
  for (const task of pendingTasks) {
    try {
      await syncTaskToFirestore(task, tasksCollection);

      await taskRepository.markSynced(task.id);

      if (task.deletedAt) {
        await taskRepository.removeDeletedTask(task.id);
      }

      /*
       * Update pending count after each
       * successfully synchronized task.
       *
       * This is useful for the offline/reconnect
       * UI, but the normal online UI remains silent.
       */
      const remaining = await taskRepository.getPendingTasks();

      setSyncStatus({
        pendingCount: remaining.length,
      });

      console.log(`SYNC: ${task.id} synced.`);
    } catch (error) {
      /*
       * Do NOT mark the task as synced.
       *
       * It remains pending in SQLite and
       * can be retried later.
       */
      console.error(`SYNC: Failed ${task.id}`, error);
    }
  }
}

/* ================================================= */
/* SYNC TASK TO FIRESTORE                            */
/* ================================================= */

async function syncTaskToFirestore(
  task: Task,

  tasksCollection: ReturnType<typeof collection>,
): Promise<void> {
  const taskRef = doc(tasksCollection, task.id);

  /* ================================================= */
  /* DELETE                                            */
  /* ================================================= */

  if (task.deletedAt) {
    await deleteDoc(taskRef);

    return;
  }

  /* ================================================= */
  /* CREATE / UPDATE                                   */
  /* ================================================= */

  await setDoc(
    taskRef,
    {
      id: task.id,

      title: task.title,

      description: task.description ?? '',

      dueDate: task.dueDate,

      dueTime: task.dueTime ?? '',

      priority: task.priority,

      status: task.status,

      createdAt: task.createdAt,

      updatedAt: task.updatedAt,

      userId: firebaseAuth.currentUser?.uid ?? null,
    },
    {
      merge: true,
    },
  );
}

/* ================================================= */
/* PULL FIRESTORE → SQLITE                           */
/* ================================================= */

async function pullRemoteTasks(): Promise<void> {
  const user = firebaseAuth.currentUser;

  if (!user) {
    return;
  }

  const tasksCollection = getTasksCollection();

  if (!tasksCollection) {
    return;
  }

  const snapshot = await getDocs(tasksCollection);

  if (snapshot.empty) {
    console.log('SYNC: No remote tasks found.');

    return;
  }

  let imported = 0;

  for (const firestoreDoc of snapshot.docs) {
    const data = firestoreDoc.data();

    const remoteTask: Task = {
      id: String(data.id ?? firestoreDoc.id),

      title: String(data.title ?? ''),

      description: typeof data.description === 'string' ? data.description : '',

      dueDate: String(data.dueDate ?? ''),

      dueTime: typeof data.dueTime === 'string' ? data.dueTime : '',

      priority: normalizePriority(data.priority),

      status: normalizeStatus(data.status),

      createdAt: String(data.createdAt ?? new Date().toISOString()),

      updatedAt: String(data.updatedAt ?? new Date().toISOString()),
    };

    await taskRepository.upsertRemoteTask(remoteTask);

    imported += 1;
  }

  console.log(`SYNC: ${imported} remote task(s) processed.`);
}

/* ================================================= */
/* NORMALIZE PRIORITY                                */
/* ================================================= */

function normalizePriority(value: unknown): Task['priority'] {
  if (value === 'low' || value === 'medium' || value === 'high') {
    return value;
  }

  return 'medium';
}

/* ================================================= */
/* NORMALIZE STATUS                                  */
/* ================================================= */

function normalizeStatus(value: unknown): Task['status'] {
  if (value === 'pending' || value === 'completed') {
    return value;
  }

  return 'pending';
}

/* ================================================= */
/* SYNC LOCK                                         */
/* ================================================= */

let syncing = false;

/* ================================================= */
/* SYNC SCHEDULER                                    */
/* ================================================= */

/*
 * Small debounce window.
 *
 * Example:
 *
 * Create
 * Edit
 * Toggle
 * Delete
 *
 * within 400ms
 *
 * => one background sync cycle.
 */
const SYNC_DEBOUNCE_MS = 400;

let scheduledSyncTimer: ReturnType<typeof setTimeout> | null = null;

let scheduledSyncPromise: Promise<void> | null = null;

let scheduledSyncResolve: (() => void) | null = null;

function scheduleBackgroundSync(): Promise<void> {
  /*
   * If a sync has already been scheduled,
   * don't create another timer.
   */
  if (scheduledSyncPromise) {
    return scheduledSyncPromise;
  }

  scheduledSyncPromise = new Promise<void>(resolve => {
    scheduledSyncResolve = resolve;
  });

  scheduledSyncTimer = setTimeout(
    () => {
      scheduledSyncTimer = null;

      void syncPendingTasks({
        showOnlineStatus: false,
        refreshTasksAfterSync: false,
      }).finally(() => {
        const resolve = scheduledSyncResolve;

        scheduledSyncResolve = null;

        scheduledSyncPromise = null;

        resolve?.();
      });
    },

    SYNC_DEBOUNCE_MS,
  );

  return scheduledSyncPromise;
}

/* ================================================= */
/* FULL SYNC                                         */
/* ================================================= */

interface SyncOptions {
  /*
   * true:
   * Show "Syncing..." / "All changes synced".
   *
   * false:
   * Keep normal online background sync silent.
   */
  showOnlineStatus?: boolean;

  /*
   * Used by RootNavigator after initial sync
   * or reconnection.
   *
   * This refreshes Redux from SQLite after
   * Firestore data has been pulled.
   */
  refreshTasksAfterSync?: boolean;

  /*
   * Called after a successful sync when
   * Redux should re-read SQLite.
   */
  onTasksChanged?: () => void;
}

async function syncPendingTasks(options: SyncOptions = {}): Promise<void> {
  if (syncing) {
    return;
  }

  const user = firebaseAuth.currentUser;

  if (!user) {
    console.log('SYNC: No authenticated user.');

    return;
  }

  try {
    syncing = true;

    const network = await NetInfo.fetch();

    const isConnected = network.isConnected === true;

    setSyncStatus({
      isConnected,
    });

    /* ================================================= */
    /* OFFLINE                                           */
    /* ================================================= */

    if (!isConnected) {
      const pendingCount = await refreshPendingCount();

      setSyncStatus({
        status: 'offline',

        isConnected: false,

        pendingCount,

        message:
          pendingCount > 0
            ? `${pendingCount} change${
                pendingCount === 1 ? '' : 's'
              } waiting to sync`
            : 'Changes will sync when you are back online',
      });

      console.log('SYNC: Device is offline.');

      return;
    }

    /* ================================================= */
    /* ONLINE STATUS                                     */
    /* ================================================= */

    if (options.showOnlineStatus) {
      setSyncStatus({
        status: 'syncing',

        isConnected: true,

        message: 'Syncing your changes...',
      });
    } else {
      /*
       * Normal background sync.
       *
       * Keep the UI silent.
       */
      setSyncStatus({
        isConnected: true,

        status: 'syncing',

        message: undefined,
      });
    }

    console.log('SYNC: Online. Starting sync...');

    /* ================================================= */
    /* PUSH LOCAL → FIRESTORE                            */
    /* ================================================= */

    await pushPendingTasks();

    /* ================================================= */
    /* PULL FIRESTORE → SQLITE                           */
    /* ================================================= */

    await pullRemoteTasks();

    /* ================================================= */
    /* REFRESH PENDING COUNT                             */
    /* ================================================= */

    const pendingCount = await refreshPendingCount();

    /* ================================================= */
    /* REFRESH REDUX                                     */
    /* ================================================= */

    /*
     * Only initial/reconnection/manual flows
     * need to reload Redux from SQLite.
     *
     * Normal CRUD already updates Redux directly,
     * so doing loadTasks() after every background
     * sync would be unnecessary work.
     */
    if (options.refreshTasksAfterSync && options.onTasksChanged) {
      options.onTasksChanged();
    }

    /* ================================================= */
    /* FINAL STATUS                                      */
    /* ================================================= */

    if (options.showOnlineStatus) {
      setSyncStatus({
        status: 'synced',

        isConnected: true,

        pendingCount,

        message:
          pendingCount > 0
            ? `${pendingCount} change${
                pendingCount === 1 ? '' : 's'
              } waiting to sync`
            : 'All changes synced',
      });
    } else {
      /*
       * Background online sync remains silent.
       */
      setSyncStatus({
        status: 'synced',

        isConnected: true,

        pendingCount,

        message: undefined,
      });
    }

    console.log('SYNC: Completed.');
  } catch (error) {
    console.error('SYNC ERROR:', error);

    const pendingCount = await refreshPendingCount();

    setSyncStatus({
      status: 'error',

      pendingCount,

      isConnected: syncStatus.isConnected,

      message: 'Sync failed. We will retry automatically.',
    });
  } finally {
    syncing = false;
  }
}

/* ================================================= */
/* START LISTENER                                    */
/* ================================================= */

export function startSyncListener(onTasksChanged?: () => void): () => void {
  /*
   * Initial synchronization.
   *
   * This is important for a fresh installation.
   *
   * Firestore → SQLite
   * then Redux reloads from SQLite.
   */
  void syncPendingTasks({
    showOnlineStatus: false,

    refreshTasksAfterSync: true,

    onTasksChanged,
  });

  /* ================================================= */
  /* NETWORK LISTENER                                  */
  /* ================================================= */

  const unsubscribe = NetInfo.addEventListener(state => {
    const isConnected = state.isConnected === true;

    /* ============================================= */
    /* OFFLINE                                       */
    /* ============================================= */

    if (!isConnected) {
      void refreshPendingCount().then(pendingCount => {
        setSyncStatus({
          status: 'offline',

          isConnected: false,

          pendingCount,

          message:
            pendingCount > 0
              ? `${pendingCount} change${
                  pendingCount === 1 ? '' : 's'
                } waiting to sync`
              : 'Changes will sync when you are back online',
        });
      });

      return;
    }

    /* ============================================= */
    /* ONLINE / RECONNECTED                          */
    /* ============================================= */

    /*
     * Reconnection is different from a normal
     * online task operation.
     *
     * Here we DO show a useful status message.
     */
    setSyncStatus({
      isConnected: true,

      status: 'syncing',

      message: 'Back online · Syncing...',
    });

    /*
     * Run immediately on reconnection.
     *
     * No debounce here because the network
     * transition itself is the trigger.
     */
    void syncPendingTasks({
      showOnlineStatus: true,

      refreshTasksAfterSync: true,

      onTasksChanged,
    });
  });

  return () => {
    unsubscribe();

    /*
     * Cancel a scheduled background sync
     * when the authenticated sync lifecycle
     * is being stopped.
     */
    if (scheduledSyncTimer) {
      clearTimeout(scheduledSyncTimer);

      scheduledSyncTimer = null;
    }

    if (scheduledSyncResolve) {
      const resolve = scheduledSyncResolve;

      scheduledSyncResolve = null;

      scheduledSyncPromise = null;

      resolve();
    }
  };
}

/* ================================================= */
/* BACKGROUND SYNC                                   */
/* ================================================= */

/*
 * Called by task CRUD operations.
 *
 * IMPORTANT:
 *
 * This does NOT immediately run a sync.
 *
 * It schedules/coalesces background sync
 * so multiple rapid changes can be handled
 * by one synchronization cycle.
 */
export async function syncTasks(): Promise<void> {
  await scheduleBackgroundSync();
}

/* ================================================= */
/* MANUAL / IMMEDIATE SYNC                           */
/* ================================================= */

/*
 * Optional explicit sync function.
 *
 * Useful if another part of the app needs
 * to force synchronization immediately.
 */
export async function forceSyncTasks(
  onTasksChanged?: () => void,
): Promise<void> {
  await syncPendingTasks({
    showOnlineStatus: true,

    refreshTasksAfterSync: true,

    onTasksChanged,
  });
}

/* ================================================= */
/* GET CURRENT STATUS                                */
/* ================================================= */

export function getSyncStatus(): SyncStatusState {
  return {
    ...syncStatus,
  };
}
