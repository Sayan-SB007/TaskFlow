import notifee, {
  AndroidImportance,
  AndroidNotificationSetting,
  AuthorizationStatus,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';
import { Task } from '../tasks/types';




/* ================================================= */
/* CONSTANTS                                         */
/* ================================================= */

const TASK_CHANNEL_ID =
  'task-reminders';

const TASK_CHANNEL_NAME =
  'Task reminders';


/* ================================================= */
/* INITIALIZE                                        */
/* ================================================= */

export async function initializeNotifications(): Promise<void> {
  /*
   * Create Android notification channel.
   *
   * Calling createChannel repeatedly is safe.
   */
  await notifee.createChannel({
    id: TASK_CHANNEL_ID,

    name: TASK_CHANNEL_NAME,

    importance:
      AndroidImportance.DEFAULT,

    vibration: true,

    lights: true,
  });
}


/* ================================================= */
/* REQUEST PERMISSION                                */
/* ================================================= */

export async function requestNotificationPermission(): Promise<boolean> {
  try {

    const settings =
      await notifee.requestPermission();

    return (
      settings.authorizationStatus ===
      AuthorizationStatus.AUTHORIZED
    );

  } catch (error) {

    console.warn(
      'NOTIFICATION: Permission request failed',
      error,
    );

    return false;
  }
}


/* ================================================= */
/* CHECK PERMISSION                                  */
/* ================================================= */

export async function hasNotificationPermission(): Promise<boolean> {
  try {

    const settings =
      await notifee.getNotificationSettings();

    return (
      settings.authorizationStatus ===
      AuthorizationStatus.AUTHORIZED
    );

  } catch (error) {

    console.warn(
      'NOTIFICATION: Permission check failed',
      error,
    );

    return false;
  }
}


/* ================================================= */
/* CHECK EXACT ALARM                                 */
/* ================================================= */

async function hasExactAlarmPermission(): Promise<boolean> {

  try {

    const settings =
      await notifee.getNotificationSettings();

    /*
     * On Android, Notifee exposes the
     * alarm setting through settings.android.alarm.
     */
    return (
      settings.android?.alarm ===
      AndroidNotificationSetting.ENABLED
    );

  } catch (error) {

    console.warn(
      'NOTIFICATION: Exact alarm check failed',
      error,
    );

    /*
     * If this information is unavailable,
     * don't block scheduling.
     *
     * Notifee will report an actual scheduling
     * error if the platform rejects it.
     */
    return true;
  }
}


/* ================================================= */
/* REQUEST EXACT ALARM ACCESS                        */
/* ================================================= */

export async function requestExactAlarmPermission(): Promise<boolean> {

  try {

    const allowed =
      await hasExactAlarmPermission();

    if (allowed) {
      return true;
    }

    /*
     * Open Android's Alarms & reminders
     * settings page.
     */
    await notifee.openAlarmPermissionSettings();

    return false;

  } catch (error) {

    console.warn(
      'NOTIFICATION: Could not open exact alarm settings',
      error,
    );

    return false;
  }
}


/* ================================================= */
/* BUILD NOTIFICATION ID                             */
/* ================================================= */

function getNotificationId(
  taskId: string,
): string {

  return `task-reminder-${taskId}`;
}


/* ================================================= */
/* BUILD TASK DATE                                   */
/* ================================================= */

function getTaskDate(
  task: Task,
): Date | null {

  if (
    !task.dueDate ||
    !task.dueTime
  ) {
    return null;
  }


  /*
   * Your date picker stores a date string
   * and time is stored separately.
   *
   * We first try the normal ISO format.
   */
  const dateTimeString =
    `${task.dueDate}T${task.dueTime}:00`;


  const date =
    new Date(dateTimeString);


  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
  }


  return date;
}


/* ================================================= */
/* CANCEL TASK REMINDER                              */
/* ================================================= */

export async function cancelTaskReminder(
  taskId: string,
): Promise<void> {

  try {

    const notificationId =
      getNotificationId(taskId);

    await notifee.cancelNotification(
      notificationId,
    );

  } catch (error) {

    console.warn(
      `NOTIFICATION: Failed to cancel reminder for ${taskId}`,
      error,
    );

  }
}


/* ================================================= */
/* SCHEDULE TASK REMINDER                             */
/* ================================================= */

export async function scheduleTaskReminder(
  task: Task,
): Promise<void> {

  /*
   * No reminder for completed tasks.
   */
  if (
    task.status === 'completed'
  ) {

    await cancelTaskReminder(
      task.id,
    );

    return;
  }


  /*
   * No reminder if there is no
   * complete date/time.
   */
  const scheduledDate =
    getTaskDate(task);

  if (!scheduledDate) {

    await cancelTaskReminder(
      task.id,
    );

    return;
  }


  /*
   * Don't schedule reminders in the past.
   */
  if (
    scheduledDate.getTime() <=
    Date.now()
  ) {

    await cancelTaskReminder(
      task.id,
    );

    return;
  }


  /*
   * Make sure the notification channel exists.
   */
  await initializeNotifications();


  /*
   * Check notification permission.
   */
  const permissionGranted =
    await hasNotificationPermission();

  if (!permissionGranted) {

    console.warn(
      'NOTIFICATION: Permission not granted. Reminder not scheduled.',
    );

    return;
  }


  /*
   * Android exact alarm permission.
   */
  const exactAlarmAllowed =
    await hasExactAlarmPermission();

  if (!exactAlarmAllowed) {

    console.warn(
      'NOTIFICATION: Exact alarm permission is not enabled.',
    );

    return;
  }


  /*
   * Always cancel the previous reminder first.
   *
   * This is important when the user edits
   * the due date/time.
   */
  await cancelTaskReminder(
    task.id,
  );


  const notificationId =
    getNotificationId(task.id);


  /*
   * Timestamp trigger.
   *
   * AlarmManager gives us the best chance
   * of firing at the requested task time
   * on Android.
   */
  const trigger: TimestampTrigger = {

    type:
      TriggerType.TIMESTAMP,

    timestamp:
      scheduledDate.getTime(),

    alarmManager: {
      allowWhileIdle: true,
    },

  };


  await notifee.createTriggerNotification(

    {
      id:
        notificationId,

      title:
        'TaskFlow reminder',

      body:
        `It's time for: ${task.title}`,

      data: {
        taskId:
          task.id,
      },

      android: {

        channelId:
          TASK_CHANNEL_ID,

        pressAction: {
          id:
            'open-task',
        },

      },

    },

    trigger,

  );


  console.log(
    'NOTIFICATION: Reminder scheduled',
    {
      taskId:
        task.id,

      title:
        task.title,

      scheduledFor:
        scheduledDate.toISOString(),
    },
  );
}


/* ================================================= */
/* RESCHEDULE TASK                                   */
/* ================================================= */

export async function rescheduleTaskReminder(
  task: Task,
): Promise<void> {

  await scheduleTaskReminder(
    task,
  );
}


/* ================================================= */
/* REMOVE TASK REMINDER                              */
/* ================================================= */

export async function removeTaskReminder(
  taskId: string,
): Promise<void> {

  await cancelTaskReminder(
    taskId,
  );
}


/* ================================================= */
/* GET SCHEDULED REMINDERS                           */
/* ================================================= */

export async function getScheduledTaskReminders() {

  try {

    return await notifee.getTriggerNotifications();

  } catch (error) {

    console.warn(
      'NOTIFICATION: Failed to get scheduled reminders',
      error,
    );

    return [];
  }
}