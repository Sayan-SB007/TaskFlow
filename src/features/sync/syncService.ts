import NetInfo from '@react-native-community/netinfo';

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from 'firebase/firestore';

import {
  firebaseAuth,
  firestoreDb,
} from '../../config/firebase';

import {
  taskRepository,
} from '../../database/repositories/taskRepository';

import type {
  Task,
} from '../tasks/types';


/* ================================================= */
/* SYNC STATE                                        */
/* ================================================= */

let syncing = false;


/* ================================================= */
/* FIRESTORE TASK COLLECTION                         */
/* ================================================= */

function getTasksCollection() {
  const user =
    firebaseAuth.currentUser;

  if (!user) {
    return null;
  }

  return collection(
    firestoreDb,
    'users',
    user.uid,
    'tasks',
  );
}


/* ================================================= */
/* PUSH LOCAL → FIRESTORE                            */
/* ================================================= */

async function pushPendingTasks(): Promise<void> {
  const user =
    firebaseAuth.currentUser;

  if (!user) {
    return;
  }

  const tasksCollection =
    getTasksCollection();

  if (!tasksCollection) {
    return;
  }

  const pendingTasks =
    await taskRepository.getPendingTasks();

  if (
    pendingTasks.length === 0
  ) {
    return;
  }

  console.log(
    `SYNC: ${pendingTasks.length} pending task(s).`,
  );

  for (
    const task of pendingTasks
  ) {
    try {
      await syncTaskToFirestore(
        task,
        tasksCollection,
      );

      /*
       * Only mark the task synced
       * after Firestore succeeds.
       */
      await taskRepository.markSynced(
        task.id,
      );

      /*
       * Deleted tasks don't need to
       * stay in SQLite forever.
       */
      if (task.deletedAt) {
        await taskRepository.removeDeletedTask(
          task.id,
        );
      }

      console.log(
        `SYNC: ${task.id} synced.`,
      );
    } catch (error) {
      /*
       * Keep the task pending.
       *
       * It will be retried next time.
       */
      console.error(
        `SYNC: Failed ${task.id}`,
        error,
      );
    }
  }
}


/* ================================================= */
/* SYNC TASK TO FIRESTORE                            */
/* ================================================= */

async function syncTaskToFirestore(
  task: Task,
  tasksCollection: ReturnType<
    typeof collection
  >,
): Promise<void> {
  const taskRef =
    doc(
      tasksCollection,
      task.id,
    );

  /*
   * DELETE
   */
  if (task.deletedAt) {
    await deleteDoc(
      taskRef,
    );

    return;
  }

  /*
   * CREATE / UPDATE
   */
  await setDoc(
    taskRef,
    {
      id: task.id,

      title: task.title,

      description:
        task.description ?? '',

      dueDate: task.dueDate,

      dueTime:
        task.dueTime ?? '',

      priority: task.priority,

      status: task.status,

      createdAt: task.createdAt,

      updatedAt: task.updatedAt,

      userId:
        firebaseAuth.currentUser
          ?.uid ?? null,
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
  const user =
    firebaseAuth.currentUser;

  if (!user) {
    return;
  }

  const tasksCollection =
    getTasksCollection();

  if (!tasksCollection) {
    return;
  }

  const snapshot =
    await getDocs(
      tasksCollection,
    );

  if (snapshot.empty) {
    console.log(
      'SYNC: No remote tasks found.',
    );

    return;
  }

  let imported = 0;

  for (
    const firestoreDoc of snapshot.docs
  ) {
    const data =
      firestoreDoc.data();

    /*
     * Convert Firestore document
     * to our local Task structure.
     */
    const remoteTask: Task = {
      id:
        String(
          data.id ??
          firestoreDoc.id,
        ),

      title:
        String(
          data.title ?? '',
        ),

      description:
        typeof data.description ===
        'string'
          ? data.description
          : '',

      dueDate:
        String(
          data.dueDate ?? '',
        ),

      dueTime:
        typeof data.dueTime ===
        'string'
          ? data.dueTime
          : '',

      priority:
        normalizePriority(
          data.priority,
        ),

      status:
        normalizeStatus(
          data.status,
        ),

      createdAt:
        String(
          data.createdAt ??
          new Date().toISOString(),
        ),

      updatedAt:
        String(
          data.updatedAt ??
          new Date().toISOString(),
        ),
    };

    await taskRepository.upsertRemoteTask(
      remoteTask,
    );

    imported += 1;
  }

  console.log(
    `SYNC: ${imported} remote task(s) processed.`,
  );
}


/* ================================================= */
/* NORMALIZE PRIORITY                                */
/* ================================================= */

function normalizePriority(
  value: unknown,
): Task['priority'] {
  if (
    value === 'low' ||
    value === 'medium' ||
    value === 'high'
  ) {
    return value;
  }

  return 'medium';
}


/* ================================================= */
/* NORMALIZE STATUS                                  */
/* ================================================= */

function normalizeStatus(
  value: unknown,
): Task['status'] {
  if (
    value === 'pending' ||
    value === 'completed'
  ) {
    return value;
  }

  return 'pending';
}


/* ================================================= */
/* FULL SYNC                                         */
/* ================================================= */

async function syncPendingTasks(): Promise<void> {
  /*
   * Prevent simultaneous sync operations.
   */
  if (syncing) {
    return;
  }

  const user =
    firebaseAuth.currentUser;

  if (!user) {
    console.log(
      'SYNC: No authenticated user.',
    );

    return;
  }

  try {
    syncing = true;

    const network =
      await NetInfo.fetch();

    /*
     * Offline:
     *
     * SQLite continues working normally.
     *
     * Nothing is sent to Firestore.
     */
    if (
      network.isConnected !== true
    ) {
      console.log(
        'SYNC: Device is offline.',
      );

      return;
    }

    console.log(
      'SYNC: Online. Starting sync...',
    );

    /*
     * IMPORTANT ORDER:
     *
     * 1. Push local pending changes
     * 2. Pull remote changes
     *
     * This prevents a remote version from
     * overwriting a local pending change.
     */
    await pushPendingTasks();

    await pullRemoteTasks();

    console.log(
      'SYNC: Completed.',
    );
  } catch (error) {
    console.error(
      'SYNC ERROR:',
      error,
    );
  } finally {
    syncing = false;
  }
}


/* ================================================= */
/* START LISTENER                                    */
/* ================================================= */

export function startSyncListener(): () => void {
  /*
   * Initial sync.
   */
  void syncPendingTasks();

  /*
   * Network listener.
   *
   * Offline → Online
   * triggers another sync.
   */
  const unsubscribe =
    NetInfo.addEventListener(
      state => {
        if (
          state.isConnected === true
        ) {
          void syncPendingTasks();
        }
      },
    );

  return unsubscribe;
}


/* ================================================= */
/* MANUAL SYNC                                       */
/* ================================================= */

export async function syncTasks(): Promise<void> {
  await syncPendingTasks();
}