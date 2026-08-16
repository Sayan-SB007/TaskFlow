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



import type {
  Task,
} from '../tasks/types';
import { taskRepository } from '../../database/repositories/taskRepository';


/* ================================================= */
/* SYNC STATUS                                       */
/* ================================================= */

export type SyncStatus =
  | 'offline'
  | 'syncing'
  | 'synced'
  | 'error';


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


const syncStatusListeners =
  new Set<
    (
      state: SyncStatusState,
    ) => void
  >();


function notifySyncStatus() {

  const state = {
    ...syncStatus,
  };


  syncStatusListeners.forEach(
    listener => {

      listener(state);

    },
  );
}


/* ================================================= */
/* STATUS SUBSCRIPTION                               */
/* ================================================= */

export function subscribeSyncStatus(
  listener: (
    state: SyncStatusState,
  ) => void,
): () => void {

  syncStatusListeners.add(
    listener,
  );


  /*
   * Give the subscriber the
   * current state immediately.
   */
  listener({
    ...syncStatus,
  });


  return () => {

    syncStatusListeners.delete(
      listener,
    );

  };
}


/* ================================================= */
/* UPDATE STATUS                                     */
/* ================================================= */

function setSyncStatus(
  update: Partial<SyncStatusState>,
) {

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

    const pendingTasks =
      await taskRepository.getPendingTasks();


    const count =
      pendingTasks.length;


    setSyncStatus({
      pendingCount: count,
    });


    return count;

  } catch (error) {

    console.error(
      'SYNC: Unable to read pending count.',
      error,
    );


    return syncStatus.pendingCount;

  }

}


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


  setSyncStatus({
    pendingCount:
      pendingTasks.length,
  });


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


      await taskRepository.markSynced(
        task.id,
      );


      if (task.deletedAt) {

        await taskRepository.removeDeletedTask(
          task.id,
        );

      }


      /*
       * Refresh the number shown
       * to the user after every task.
       */
      const remaining =
        await taskRepository.getPendingTasks();


      setSyncStatus({
        pendingCount:
          remaining.length,
      });


      console.log(
        `SYNC: ${task.id} synced.`,
      );


    } catch (error) {

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

      id:
        task.id,

      title:
        task.title,

      description:
        task.description ?? '',

      dueDate:
        task.dueDate,

      dueTime:
        task.dueTime ?? '',

      priority:
        task.priority,

      status:
        task.status,

      createdAt:
        task.createdAt,

      updatedAt:
        task.updatedAt,

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


    const isConnected =
      network.isConnected === true;


    /*
     * Update network state immediately.
     */
    setSyncStatus({
      isConnected,
    });


    /*
     * OFFLINE
     */
    if (!isConnected) {

      const pendingCount =
        await refreshPendingCount();


      setSyncStatus({

        status:
          'offline',

        isConnected: false,

        pendingCount,

        message:
          pendingCount > 0
            ? `${pendingCount} change${
                pendingCount === 1
                  ? ''
                  : 's'
              } waiting to sync`
            : 'Changes will sync when you are back online',

      });


      console.log(
        'SYNC: Device is offline.',
      );


      return;

    }


    /*
     * ONLINE
     */
    setSyncStatus({

      status:
        'syncing',

      isConnected: true,

      message:
        'Syncing your changes...',

    });


    console.log(
      'SYNC: Online. Starting sync...',
    );


    /*
     * Push local changes first.
     */
    await pushPendingTasks();


    /*
     * Then pull remote changes.
     */
    await pullRemoteTasks();


    const pendingCount =
      await refreshPendingCount();


    /*
     * Everything synced.
     */
    setSyncStatus({

      status:
        'synced',

      isConnected: true,

      pendingCount,

      message:
        pendingCount > 0
          ? `${pendingCount} change${
              pendingCount === 1
                ? ''
                : 's'
            } waiting to sync`
          : 'All changes synced',

    });


    console.log(
      'SYNC: Completed.',
    );


  } catch (error) {

    console.error(
      'SYNC ERROR:',
      error,
    );


    const pendingCount =
      await refreshPendingCount();


    setSyncStatus({

      status:
        'error',

      pendingCount,

      message:
        'Sync failed. We will retry automatically.',

    });


  } finally {

    syncing = false;

  }

}


/* ================================================= */
/* SYNC LOCK                                         */
/* ================================================= */

let syncing = false;


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
   */
  const unsubscribe =
    NetInfo.addEventListener(
      state => {

        const isConnected =
          state.isConnected === true;


        if (!isConnected) {

          void refreshPendingCount()
            .then(
              pendingCount => {

                setSyncStatus({

                  status:
                    'offline',

                  isConnected:
                    false,

                  pendingCount,

                  message:
                    pendingCount > 0
                      ? `${pendingCount} change${
                          pendingCount === 1
                            ? ''
                            : 's'
                        } waiting to sync`
                      : 'Changes will sync when you are back online',

                });

              },
            );


          return;

        }


        /*
         * Internet returned.
         */
        setSyncStatus({

          isConnected: true,

          status:
            'syncing',

          message:
            'Back online · Syncing...',

        });


        void syncPendingTasks();

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


/* ================================================= */
/* GET CURRENT STATUS                                */
/* ================================================= */

export function getSyncStatus(): SyncStatusState {

  return {
    ...syncStatus,
  };

}