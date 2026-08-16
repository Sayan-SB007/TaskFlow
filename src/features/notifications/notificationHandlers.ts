import AsyncStorage from '@react-native-async-storage/async-storage';

import notifee, {
  EventType,
  type Event,
} from '@notifee/react-native';


/* ================================================= */
/* CONSTANTS                                         */
/* ================================================= */

export const TASK_NOTIFICATION_PRESS_ACTION =
  'open-task';

const PENDING_TASK_NOTIFICATION_KEY =
  '@taskflow/pending-task-notification';


/* ================================================= */
/* STORE PENDING TASK                                 */
/* ================================================= */

async function storePendingTaskNotification(
  taskId: string,
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      PENDING_TASK_NOTIFICATION_KEY,
      taskId,
    );

    console.log(
      'NOTIFICATION: Pending task stored',
      {
        taskId,
      },
    );
  } catch (error) {
    console.warn(
      'NOTIFICATION: Failed to store pending task',
      error,
    );
  }
}


/* ================================================= */
/* GET PENDING TASK                                   */
/* ================================================= */

export async function getPendingTaskNotification(): Promise<
  string | null
> {
  try {
    const taskId =
      await AsyncStorage.getItem(
        PENDING_TASK_NOTIFICATION_KEY,
      );

    return taskId;
  } catch (error) {
    console.warn(
      'NOTIFICATION: Failed to read pending task',
      error,
    );

    return null;
  }
}


/* ================================================= */
/* CLEAR PENDING TASK                                 */
/* ================================================= */

export async function clearPendingTaskNotification(): Promise<void> {
  try {
    await AsyncStorage.removeItem(
      PENDING_TASK_NOTIFICATION_KEY,
    );
  } catch (error) {
    console.warn(
      'NOTIFICATION: Failed to clear pending task',
      error,
    );
  }
}


/* ================================================= */
/* BACKGROUND HANDLER                                 */
/* ================================================= */

export function registerNotificationBackgroundHandler(): void {
  notifee.onBackgroundEvent(
    async ({
      type,
      detail,
    }: Event) => {

      const notification =
        detail.notification;

      const taskId =
        notification?.data?.taskId;


      console.log(
        'NOTIFICATION: Background event',
        {
          type,
          taskId,
          notificationId:
            notification?.id,
          pressAction:
            detail.pressAction?.id,
        },
      );


      /* ============================================= */
      /* NOTIFICATION PRESSED                          */
      /* ============================================= */

      if (
        type === EventType.PRESS &&
        typeof taskId === 'string'
      ) {

        await storePendingTaskNotification(
          taskId,
        );

        return;
      }


      /* ============================================= */
      /* ACTION PRESSED                                */
      /* ============================================= */

      if (
        type === EventType.ACTION_PRESS &&
        typeof taskId === 'string'
      ) {

        if (
          detail.pressAction?.id ===
          TASK_NOTIFICATION_PRESS_ACTION
        ) {

          await storePendingTaskNotification(
            taskId,
          );
        }

        return;
      }


      /* ============================================= */
      /* DISMISSED                                     */
      /* ============================================= */

      if (
        type === EventType.DISMISSED
      ) {

        console.log(
          'NOTIFICATION: Notification dismissed',
          {
            taskId,
          },
        );

        return;
      }
    },
  );
}


/* ================================================= */
/* FOREGROUND HANDLER                                 */
/* ================================================= */

export function subscribeToForegroundNotifications(
  onTaskNotificationPress?: (
    taskId: string,
  ) => void,
): () => void {

  return notifee.onForegroundEvent(
    ({
      type,
      detail,
    }: Event) => {

      const notification =
        detail.notification;

      const taskId =
        notification?.data?.taskId;


      console.log(
        'NOTIFICATION: Foreground event',
        {
          type,
          taskId,
          notificationId:
            notification?.id,
          pressAction:
            detail.pressAction?.id,
        },
      );


      if (
        (
          type === EventType.PRESS ||
          type === EventType.ACTION_PRESS
        ) &&
        detail.pressAction?.id ===
          TASK_NOTIFICATION_PRESS_ACTION &&
        typeof taskId === 'string'
      ) {

        onTaskNotificationPress?.(
          taskId,
        );
      }
    },
  );
}


/* ================================================= */
/* INITIAL NOTIFICATION                              */
/* ================================================= */

export async function getInitialTaskNotification(): Promise<
  string | null
> {

  try {

    const initialNotification =
      await notifee.getInitialNotification();


    if (
      !initialNotification
    ) {
      return null;
    }


    const taskId =
      initialNotification
        .notification
        ?.data
        ?.taskId;


    console.log(
      'NOTIFICATION: App opened from notification',
      {
        taskId,

        pressAction:
          initialNotification
            .pressAction
            ?.id,
      },
    );


    if (
      typeof taskId !== 'string'
    ) {
      return null;
    }


    return taskId;


  } catch (error) {

    console.warn(
      'NOTIFICATION: Failed to read initial notification',
      error,
    );

    return null;
  }
}