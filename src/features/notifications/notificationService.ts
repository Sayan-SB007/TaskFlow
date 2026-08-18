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

const TASK_REMINDER_CHANNEL_ID = 'task-reminders';

const TASK_REMINDER_CHANNEL_NAME = 'Task reminders';

/* ================================================= */
/* CHANNEL                                            */
/* ================================================= */

export async function createNotificationChannel(): Promise<string> {
  const channelId = await notifee.createChannel({
    id: TASK_REMINDER_CHANNEL_ID,

    name: TASK_REMINDER_CHANNEL_NAME,

    importance: AndroidImportance.HIGH,

    vibration: true,

    lights: true,
  });

  return channelId;
}

/* ================================================= */
/* PERMISSION                                         */
/* ================================================= */

export async function requestNotificationPermission(): Promise<boolean> {
  const settings = await notifee.requestPermission();

  return settings.authorizationStatus === AuthorizationStatus.AUTHORIZED;
}

/* ================================================= */
/* INITIALIZATION                                     */
/* ================================================= */

export async function initializeNotifications(): Promise<boolean> {
  try {
    /*
     * Create Android notification channel.
     */
    await createNotificationChannel();

    /*
     * Request notification permission.
     */
    const granted = await requestNotificationPermission();

    if (!granted) {
      console.warn('NOTIFICATION: Permission denied.');

      return false;
    }

    /*
     * Check Android exact-alarm permission.
     *
     * This is important because task reminders use
     * TimestampTrigger + alarmManager.
     */
    const settings = await notifee.getNotificationSettings();

    if (settings.android?.alarm === AndroidNotificationSetting.DISABLED) {
      console.warn('NOTIFICATION: Exact alarm permission is disabled.');

      /*
       * Notification permission itself is granted,
       * but exact task reminders may not work until
       * the user enables exact alarms.
       *
       * We still return true because notification
       * permission was granted.
       */
    }

    return true;
  } catch (error) {
    console.warn('NOTIFICATION: Initialization failed.', error);

    return false;
  }
}

/* ================================================= */
/* DATE PARSING                                       */
/* ================================================= */

/*
 * Your task form can store dates such as:
 *
 * 27 Aug 2026
 * Today
 *
 * This helper converts supported values
 * into a Date object.
 */

function parseTaskDate(value?: string): Date | null {
  if (!value) {
    return null;
  }

  /*
   * "Today"
   */
  if (value === 'Today') {
    const today = new Date();

    /*
     * Keep today's actual date.
     */
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }

  /*
   * Try normal JavaScript date parsing first.
   *
   * Example:
   * "2026-08-27"
   */
  const parsed = new Date(value);

  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  /*
   * Support:
   *
   * "27 Aug 2026"
   */
  const parts = value.trim().split(' ');

  if (parts.length !== 3) {
    return null;
  }

  const day = Number(parts[0]);

  const month = parts[1];

  const year = Number(parts[2]);

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const monthIndex = months.indexOf(month);

  if (!day || monthIndex < 0 || !year) {
    return null;
  }

  return new Date(year, monthIndex, day);
}

/* ================================================= */
/* TIME PARSING                                       */
/* ================================================= */

function parseTaskTime(value?: string): {
  hour: number;
  minute: number;
} | null {
  if (!value) {
    return null;
  }

  /*
   * Supported format:
   *
   * 4:00 AM
   * 10:30 AM
   * 7:45 PM
   */
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (!match) {
    return null;
  }

  let hour = Number(match[1]);

  const minute = Number(match[2]);

  const period = match[3].toUpperCase();

  /*
   * Basic validation.
   */
  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
    return null;
  }

  /*
   * Convert PM to 24-hour format.
   */
  if (period === 'PM' && hour !== 12) {
    hour += 12;
  }

  /*
   * Convert 12 AM to 00.
   */
  if (period === 'AM' && hour === 12) {
    hour = 0;
  }

  return {
    hour,
    minute,
  };
}

/* ================================================= */
/* BUILD REMINDER DATE                                */
/* ================================================= */

function getTaskReminderDate(task: Task): Date | null {
  /*
   * A reminder requires BOTH:
   *
   * due date
   * due time
   *
   * Both fields are optional in your UI.
   */

  if (!task.dueDate || !task.dueTime) {
    return null;
  }

  const date = parseTaskDate(task.dueDate);

  if (!date) {
    return null;
  }

  const time = parseTaskTime(task.dueTime);

  if (!time) {
    return null;
  }

  /*
   * Apply selected time.
   */
  date.setHours(time.hour, time.minute, 0, 0);

  return date;
}

/* ================================================= */
/* NOTIFICATION ID                                    */
/* ================================================= */

function getTaskNotificationId(taskId: string): string {
  return `task-reminder-${taskId}`;
}

/* ================================================= */
/* EXACT ALARM PERMISSION                             */
/* ================================================= */

/*
 * Check whether Android allows exact alarms.
 *
 * Your task reminders use:
 *
 * TimestampTrigger
 * +
 * alarmManager.allowWhileIdle
 *
 * so this permission is relevant on Android versions
 * that enforce exact alarm restrictions.
 */

async function hasExactAlarmPermission(): Promise<boolean> {
  try {
    const settings = await notifee.getNotificationSettings();

    const alarmSetting = settings.android?.alarm;

    /*
     * If Notifee reports that exact alarms are
     * explicitly disabled, don't schedule.
     */
    if (alarmSetting === AndroidNotificationSetting.DISABLED) {
      console.warn('NOTIFICATION: Exact alarm permission is disabled.');

      return false;
    }

    return true;
  } catch (error) {
    console.warn(
      'NOTIFICATION: Failed to check exact alarm permission.',
      error,
    );

    /*
     * Don't block scheduling if the platform does
     * not expose the setting.
     */
    return true;
  }
}

/* ================================================= */
/* SCHEDULE TASK REMINDER                             */
/* ================================================= */

export async function scheduleTaskReminder(task: Task): Promise<void> {
  const notificationId = getTaskNotificationId(task.id);

  /*
   * Always cancel the previous reminder first.
   *
   * This prevents duplicate notifications when
   * the task is edited.
   */
  await notifee.cancelNotification(notificationId);

  /*
   * Completed tasks should never have
   * an active reminder.
   */
  if (task.status === 'completed') {
    return;
  }

  /*
   * Build reminder date.
   *
   * Both due date and due time are optional.
   */
  const reminderDate = getTaskReminderDate(task);

  /*
   * No date/time means:
   *
   * - Don't schedule notification.
   */
  if (!reminderDate) {
    return;
  }

  /*
   * Don't schedule reminders in the past.
   */
  if (reminderDate.getTime() <= Date.now()) {
    console.warn('NOTIFICATION: Task reminder time is in the past.', {
      taskId: task.id,

      reminderAt: reminderDate.toISOString(),
    });

    return;
  }

  /*
   * Make sure notification permission/channel
   * exists.
   */
  const channelId = await createNotificationChannel();

  /*
   * Check exact alarm permission.
   */
  const exactAlarmAllowed = await hasExactAlarmPermission();

  if (!exactAlarmAllowed) {
    console.warn(
      'NOTIFICATION: Reminder was not scheduled because exact alarm permission is disabled.',
      {
        taskId: task.id,
      },
    );

    return;
  }

  /*
   * Create timestamp trigger.
   */
  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,

    timestamp: reminderDate.getTime(),

    alarmManager: {
      allowWhileIdle: true,
    },
  };

  /*
   * Create the actual notification.
   */
  await notifee.createTriggerNotification(
    {
      id: notificationId,

      title: task.title,

      body: task.description?.trim()
        ? task.description
        : 'You have a task due now.',

      android: {
        channelId,

        /*
         * This ID is used by the notification
         * handler when the user taps the notification.
         */
        pressAction: {
          id: 'open-task',
        },

        /*
         * Uses your existing launcher icon.
         */
        smallIcon: 'ic_launcher',
      },

      /*
       * IMPORTANT:
       *
       * taskId allows us to know exactly which
       * task the notification belongs to.
       */
      data: {
        taskId: task.id,
      },
    },

    trigger,
  );

  console.log('NOTIFICATION: Reminder scheduled.', {
    taskId: task.id,

    notificationId,

    reminderAt: reminderDate.toISOString(),
  });
}

/* ================================================= */
/* CANCEL TASK REMINDER                               */
/* ================================================= */

export async function cancelTaskReminder(taskId: string): Promise<void> {
  const notificationId = getTaskNotificationId(taskId);

  await notifee.cancelNotification(notificationId);

  console.log('NOTIFICATION: Reminder cancelled.', {
    taskId,

    notificationId,
  });
}

/* ================================================= */
/* GET SCHEDULED REMINDERS                            */
/* ================================================= */

export async function getScheduledTaskReminders(): Promise<string[]> {
  return await notifee.getTriggerNotificationIds();
}

/* ================================================= */
/* OPEN NOTIFICATION SETTINGS                         */
/* ================================================= */

export async function openNotificationSettings(): Promise<void> {
  await notifee.openNotificationSettings();
}
