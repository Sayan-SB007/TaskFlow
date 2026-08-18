import React, { useEffect, useState } from 'react';

import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import FontAwesome6 from '@react-native-vector-icons/fontawesome6/static';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Task, TaskPriority } from '../types';

import { useAppDispatch } from '../../../hooks/useAppDispatch';

import { addTask, updateTask } from '../taskSlice';

import { spacing } from '../../../theme/spacing';

import { typography } from '../../../theme/typography';

import { useTheme } from '../../../app/providers/ThemeProvider';

/* ================================================= */
/* TYPES                                             */
/* ================================================= */

interface TaskFormSheetProps {
  visible: boolean;
  task?: Task | null;
  onClose: () => void;
}

/* ================================================= */
/* CONSTANTS                                         */
/* ================================================= */

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];

/* ================================================= */
/* HELPERS                                           */
/* ================================================= */

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/*
 * Converts an existing task date such as:
 *
 * 27 Aug 2026
 *
 * back into a Date object for editing.
 */
function parseTaskDate(value?: string): Date | null {
  if (!value || value === 'Today') {
    return value === 'Today' ? new Date() : null;
  }

  const parsed = new Date(value);

  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  /*
   * Handles strings such as:
   * 27 Aug 2026
   */
  const parts = value.trim().split(' ');

  if (parts.length === 3) {
    const day = Number(parts[0]);

    const month = parts[1];

    const year = Number(parts[2]);

    const monthIndex = [
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
    ].indexOf(month);

    if (day && monthIndex >= 0 && year) {
      return new Date(year, monthIndex, day);
    }
  }

  return null;
}

/*
 * Converts existing task time such as:
 *
 * 4:00 AM
 *
 * into a Date object.
 */
function parseTaskTime(value?: string): Date | null {
  if (!value) {
    return null;
  }

  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (!match) {
    return null;
  }

  let hour = Number(match[1]);

  const minute = Number(match[2]);

  const period = match[3].toUpperCase();

  if (period === 'PM' && hour !== 12) {
    hour += 12;
  }

  if (period === 'AM' && hour === 12) {
    hour = 0;
  }

  const date = new Date();

  date.setHours(hour, minute, 0, 0);

  return date;
}

/* ================================================= */
/* COMPONENT                                         */
/* ================================================= */

export function TaskFormSheet({ visible, task, onClose }: TaskFormSheetProps) {
  const { theme } = useTheme();

  const styles = createStyles(theme);

  const dispatch = useAppDispatch();

  /*
   * Safe-area inset is important on Android.
   *
   * It prevents the bottom action button from
   * being hidden behind:
   *
   * - Android navigation buttons
   * - Android gesture area
   * - device bottom inset
   */
  const insets = useSafeAreaInsets();

  const editing = Boolean(task);

  /* ================================================= */
  /* FORM STATE                                        */
  /* ================================================= */

  const [title, setTitle] = useState('');

  const [description, setDescription] = useState('');

  const [priority, setPriority] = useState<TaskPriority>('medium');

  /*
   * Keep UI date state separate from
   * database string representation.
   */
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [selectedTime, setSelectedTime] = useState<Date | null>(null);

  /* ================================================= */
  /* PICKER STATE                                      */
  /* ================================================= */

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [showTimePicker, setShowTimePicker] = useState(false);

  /* ================================================= */
  /* VALIDATION                                        */
  /* ================================================= */

  const [error, setError] = useState<string | null>(null);

  /* ================================================= */
  /* INITIALIZE FORM                                   */
  /* ================================================= */

  useEffect(() => {
    if (!visible) {
      return;
    }

    /*
     * Reset picker state whenever
     * the sheet opens.
     */
    setShowDatePicker(false);

    setShowTimePicker(false);

    setError(null);

    /*
     * EDIT EXISTING TASK
     */
    if (task) {
      setTitle(task.title);

      setDescription(task.description ?? '');

      setPriority(task.priority);

      /*
       * Restore existing date.
       */
      setSelectedDate(parseTaskDate(task.dueDate));

      /*
       * Restore existing time.
       */
      setSelectedTime(parseTaskTime(task.dueTime));
    } else {

    /*
     * CREATE NEW TASK
     */
      setTitle('');

      setDescription('');

      setPriority('medium');

      /*
       * Date and time are optional.
       */
      setSelectedDate(null);

      setSelectedTime(null);
    }
  }, [visible, task]);

  /* ================================================= */
  /* DATE PICKER                                       */
  /* ================================================= */

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    /*
     * Android sends dismissed when
     * user presses back.
     */
    if (event.type === 'dismissed') {
      setShowDatePicker(false);

      return;
    }

    setShowDatePicker(false);

    if (date) {
      setSelectedDate(date);

      setError(null);
    }
  };

  /* ================================================= */
  /* TIME PICKER                                       */
  /* ================================================= */

  const handleTimeChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === 'dismissed') {
      setShowTimePicker(false);

      return;
    }

    setShowTimePicker(false);

    if (date) {
      setSelectedTime(date);

      setError(null);
    }
  };

  /* ================================================= */
  /* CLEAR DATE                                        */
  /* ================================================= */

  const handleClearDate = () => {
    setSelectedDate(null);

    setShowDatePicker(false);
  };

  /* ================================================= */
  /* CLEAR TIME                                        */
  /* ================================================= */

  const handleClearTime = () => {
    setSelectedTime(null);

    setShowTimePicker(false);
  };

  /* ================================================= */
  /* SUBMIT                                            */
  /* ================================================= */

  const handleSubmit = () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError('Task title is required.');
      return;
    }
    const dueDate = selectedDate ? formatDate(selectedDate) : 'Today';

    const dueTime = selectedTime ? formatTime(selectedTime) : undefined;

    /* ================================================= */
    /* EDIT EXISTING TASK                                */
    /* ================================================= */

    if (editing && task) {
      dispatch(
        updateTask({
          id: task.id,

          title: trimmedTitle,

          description: description.trim() || undefined,

          priority,

          dueDate,

          dueTime,
        }),
      );

      onClose();

      return;
    }

    /* ================================================= */
    /* CREATE NEW TASK                                   */
    /* ================================================= */

    dispatch(
      addTask({
        title: trimmedTitle,

        description: description.trim() || undefined,

        priority,

        dueDate,

        dueTime,
      }),
    );

    onClose();
  };

  /* ================================================= */
  /* RENDER                                             */
  /* ================================================= */

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ================================================= */}
        {/* BACKDROP                                           */}
        {/* ================================================= */}

        <Pressable style={styles.backdrop} onPress={onClose} />

        {/* ================================================= */}
        {/* SHEET                                              */}
        {/* ================================================= */}

        <View style={styles.sheet}>
          {/* ================================================= */}
          {/* HANDLE                                             */}
          {/* ================================================= */}

          <View style={styles.handle} />

          {/* ================================================= */}
          {/* HEADER                                             */}
          {/* ================================================= */}

          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>
                {editing ? 'Edit task' : 'Create task'}
              </Text>

              <Text style={styles.subtitle}>
                {editing
                  ? 'Update your task details'
                  : 'Add something you want to accomplish'}
              </Text>
            </View>

            {/* ================================================= */}
            {/* CLOSE BUTTON                                      */}
            {/* ================================================= */}

            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close task form"
            >
              <FontAwesome6
                name="xmark"
                size={18}
                color={theme.colors.textSecondary}
                iconStyle="solid"
              />
            </Pressable>
          </View>

          {/* ================================================= */}
          {/* SCROLLABLE FORM                                    */}
          {/* ================================================= */}

          <ScrollView
            style={styles.formScroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.form}
          >
            {/* ================================================= */}
            {/* TITLE                                              */}
            {/* ================================================= */}

            <View>
              <Text style={styles.label}>TITLE</Text>

              <TextInput
                value={title}
                onChangeText={value => {
                  setTitle(value);

                  if (error) {
                    setError(null);
                  }
                }}
                placeholder="What needs to be done?"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.input}
                autoFocus={!editing}
                editable
                returnKeyType="next"
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}
            </View>

            {/* ================================================= */}
            {/* DESCRIPTION                                        */}
            {/* ================================================= */}

            <View>
              <Text style={styles.label}>DESCRIPTION</Text>

              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Add some context..."
                placeholderTextColor={theme.colors.textMuted}
                style={[styles.input, styles.textarea]}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* ================================================= */}
            {/* PRIORITY                                           */}
            {/* ================================================= */}

            <View>
              <Text style={styles.label}>PRIORITY</Text>

              <View style={styles.priorityRow}>
                {PRIORITIES.map(item => {
                  const active = priority === item;

                  return (
                    <Pressable
                      key={item}
                      onPress={() => setPriority(item)}
                      style={[
                        styles.priorityOption,

                        active && styles.priorityActive,
                      ]}
                      accessibilityRole="button"
                      accessibilityState={{
                        selected: active,
                      }}
                    >
                      <View
                        style={[
                          styles.priorityDot,
                          {
                            backgroundColor: getPriorityColor(theme, item),
                          },
                        ]}
                      />

                      <Text
                        style={[
                          styles.priorityText,

                          active && styles.priorityTextActive,
                        ]}
                      >
                        {capitalize(item)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* ================================================= */}
            {/* DATE + TIME                                       */}
            {/* ================================================= */}

            <View>
              <View style={styles.row}>
                {/* ================================================= */}
                {/* DATE                                               */}
                {/* ================================================= */}

                <View style={styles.half}>
                  <Text style={styles.label}>DUE DATE</Text>

                  <Pressable
                    onPress={() => {
                      /*
                       * Only one picker should
                       * be visible at a time.
                       */
                      setShowTimePicker(false);

                      setShowDatePicker(value => !value);
                    }}
                    style={styles.dateTimeInput}
                    accessibilityRole="button"
                    accessibilityLabel="Select due date"
                  >
                    <Text
                      style={[
                        styles.dateTimeText,

                        !selectedDate && styles.placeholderText,
                      ]}
                      numberOfLines={1}
                    >
                      {selectedDate ? formatDate(selectedDate) : 'Select date'}
                    </Text>

                    <FontAwesome6
                      name="calendar-days"
                      size={16}
                      color={theme.colors.textMuted}
                      iconStyle="solid"
                    />
                  </Pressable>

                  {/* ================================================= */}
                  {/* CLEAR DATE                                         */}
                  {/* ================================================= */}

                  {selectedDate ? (
                    <Pressable
                      onPress={handleClearDate}
                      style={styles.clearButton}
                    >
                      <Text style={styles.clearText}>Clear date</Text>
                    </Pressable>
                  ) : null}
                </View>

                {/* ================================================= */}
                {/* TIME                                               */}
                {/* ================================================= */}

                <View style={styles.half}>
                  <Text style={styles.label}>TIME</Text>

                  <Pressable
                    onPress={() => {
                      /*
                       * Only one picker should
                       * be visible at a time.
                       */
                      setShowDatePicker(false);

                      setShowTimePicker(value => !value);
                    }}
                    style={styles.dateTimeInput}
                    accessibilityRole="button"
                    accessibilityLabel="Select due time"
                  >
                    <Text
                      style={[
                        styles.dateTimeText,

                        !selectedTime && styles.placeholderText,
                      ]}
                      numberOfLines={1}
                    >
                      {selectedTime ? formatTime(selectedTime) : 'Select time'}
                    </Text>

                    <FontAwesome6
                      name="clock"
                      size={16}
                      color={theme.colors.textMuted}
                      iconStyle="solid"
                    />
                  </Pressable>

                  {/* ================================================= */}
                  {/* CLEAR TIME                                         */}
                  {/* ================================================= */}

                  {selectedTime ? (
                    <Pressable
                      onPress={handleClearTime}
                      style={styles.clearButton}
                    >
                      <Text style={styles.clearText}>Clear time</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>

              {/* ================================================= */}
              {/* DATE PICKER                                       */}
              {/* ================================================= */}

              {showDatePicker ? (
                <View style={styles.pickerContainer}>
                  <DateTimePicker
                    value={selectedDate ?? new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    minimumDate={new Date()}
                    onChange={handleDateChange}
                  />
                </View>
              ) : null}

              {/* ================================================= */}
              {/* TIME PICKER                                       */}
              {/* ================================================= */}

              {showTimePicker ? (
                <View style={styles.pickerContainer}>
                  <DateTimePicker
                    value={selectedTime ?? new Date()}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                  />
                </View>
              ) : null}

              {/* ================================================= */}
              {/* OPTIONAL MESSAGE                                  */}
              {/* ================================================= */}

              <Text style={styles.optionalText}>
                Due date and time are optional
              </Text>
            </View>

            {/*
             * IMPORTANT:
             *
             * There is intentionally NO submit button here.
             *
             * The button is fixed outside the ScrollView
             * so Android navigation cannot overlap it.
             */}
          </ScrollView>

          {/* ================================================= */}
          {/* FIXED SUBMIT FOOTER                               */}
          {/* ================================================= */}

          <View
            style={[
              styles.submitFooter,

              {
                /*
                 * Protect the button from the
                 * Android bottom navigation area.
                 *
                 * Math.max() also provides a minimum
                 * comfortable bottom spacing on devices
                 * where inset.bottom is 0.
                 */
                paddingBottom: Math.max(insets.bottom, 12) + 8,
              },
            ]}
          >
            <Pressable
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.submitButton,

                pressed && styles.submitPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={editing ? 'Save task changes' : 'Create task'}
            >
              <Text style={styles.submitText}>
                {editing ? 'Save changes' : 'Create task'}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* ================================================= */
/* HELPERS                                           */
/* ================================================= */

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

type AppTheme = ReturnType<typeof useTheme>['theme'];

function getPriorityColor(theme: AppTheme, priority: TaskPriority) {
  switch (priority) {
    case 'high':
      return theme.colors.danger;

    case 'medium':
      return theme.colors.warning;

    default:
      return theme.colors.success;
  }
}

/* ================================================= */
/* STYLES                                            */
/* ================================================= */

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    /* ================================================= */
    /* MODAL                                             */
    /* ================================================= */

    overlay: {
      flex: 1,

      justifyContent: 'flex-end',
    },

    /* ================================================= */
    /* BACKDROP                                           */
    /* ================================================= */

    backdrop: {
      ...StyleSheet.absoluteFill,

      backgroundColor: 'rgba(15, 18, 25, 0.52)',
    },

    /* ================================================= */
    /* SHEET                                              */
    /* ================================================= */

    sheet: {
      width: '100%',

      /*
       * Don't force the sheet to occupy 92% of the screen.
       * It will now wrap around the actual form content.
       *
       * If the content becomes too large, it can still grow
       * only up to this limit and the ScrollView will handle it.
       */
      maxHeight: '88%',

      backgroundColor: theme.colors.surface,

      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,

      paddingTop: spacing.md,

      elevation: 24,

      shadowColor: '#000000',

      shadowOffset: {
        width: 0,
        height: -8,
      },

      shadowOpacity: 0.18,

      shadowRadius: 20,

      overflow: 'hidden',
    },

    /* ================================================= */
    /* HANDLE                                             */
    /* ================================================= */

    handle: {
      alignSelf: 'center',

      width: 42,

      height: 4,

      borderRadius: 2,

      backgroundColor: theme.colors.border,

      marginBottom: spacing.lg,
    },

    /* ================================================= */
    /* HEADER                                             */
    /* ================================================= */

    header: {
      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'space-between',

      paddingHorizontal: spacing.xl,

      paddingBottom: spacing.lg,
    },

    headerContent: {
      flex: 1,

      paddingRight: spacing.md,
    },

    title: {
      ...typography.title,

      color: theme.colors.text,
    },

    subtitle: {
      ...typography.caption,

      color: theme.colors.textSecondary,

      marginTop: spacing.xs,
    },

    /* ================================================= */
    /* CLOSE BUTTON                                      */
    /* ================================================= */

    closeButton: {
      width: 40,

      height: 40,

      borderRadius: 20,

      backgroundColor: theme.colors.background,

      alignItems: 'center',

      justifyContent: 'center',

      borderWidth: 1,

      borderColor: theme.colors.border,
    },

    /* ================================================= */
    /* SCROLL VIEW                                       */
    /* ================================================= */

    formScroll: {
      /*
       * Let the ScrollView use only the space it actually needs.
       * It can shrink when the sheet reaches maxHeight.
       */
      flexGrow: 0,
      flexShrink: 1,
    },

    /* ================================================= */
    /* FORM                                               */
    /* ================================================= */

    form: {
      paddingHorizontal: spacing.xl,

      paddingTop: spacing.xs,

      /*
       * Only a small gap before the footer.
       * The button itself is outside the ScrollView.
       */
      paddingBottom: spacing.sm,

      gap: spacing.xl,
    },

    /* ================================================= */
    /* LABELS                                             */
    /* ================================================= */

    label: {
      ...typography.caption,

      color: theme.colors.textSecondary,

      fontWeight: '700',

      letterSpacing: 0.7,

      marginBottom: spacing.sm,
    },

    /* ================================================= */
    /* TEXT INPUTS                                       */
    /* ================================================= */

    input: {
      minHeight: 52,

      backgroundColor: theme.colors.background,

      borderWidth: 1,

      borderColor: theme.colors.border,

      borderRadius: theme.radius.md,

      paddingHorizontal: spacing.lg,

      color: theme.colors.text,

      fontSize: 15,
    },

    textarea: {
      minHeight: 100,

      paddingTop: spacing.md,
    },

    error: {
      ...typography.caption,

      color: theme.colors.danger,

      marginTop: spacing.xs,
    },

    /* ================================================= */
    /* PRIORITY                                           */
    /* ================================================= */

    priorityRow: {
      flexDirection: 'row',

      gap: spacing.sm,
    },

    priorityOption: {
      flex: 1,

      minHeight: 48,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'center',

      borderRadius: theme.radius.md,

      borderWidth: 1,

      borderColor: theme.colors.border,

      backgroundColor: theme.colors.background,
    },

    priorityActive: {
      backgroundColor: theme.colors.primarySoft,

      borderColor: theme.colors.primary,
    },

    priorityDot: {
      width: 7,

      height: 7,

      borderRadius: 4,

      marginRight: 6,
    },

    priorityText: {
      ...typography.caption,

      color: theme.colors.textSecondary,
    },

    priorityTextActive: {
      color: theme.colors.primary,

      fontWeight: '700',
    },

    /* ================================================= */
    /* DATE / TIME                                       */
    /* ================================================= */

    row: {
      flexDirection: 'row',

      gap: spacing.md,
    },

    half: {
      flex: 1,

      minWidth: 0,
    },

    /*
     * Date/time deliberately use a muted gray
     * border rather than the blue primary border.
     *
     * Priority selection remains blue.
     */
    dateTimeInput: {
      minHeight: 52,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'space-between',

      backgroundColor: theme.colors.background,

      borderWidth: 1,

      borderColor: '#D7DCE3',

      borderRadius: theme.radius.md,

      paddingHorizontal: spacing.lg,
    },

    dateTimeText: {
      flex: 1,

      color: theme.colors.text,

      fontSize: 15,

      marginRight: spacing.sm,
    },

    placeholderText: {
      color: theme.colors.textMuted,
    },

    /* ================================================= */
    /* CLEAR BUTTONS                                     */
    /* ================================================= */

    clearButton: {
      alignSelf: 'flex-start',

      marginTop: 6,

      paddingVertical: 2,
    },

    clearText: {
      fontSize: 12,

      fontWeight: '600',

      color: theme.colors.primary,
    },

    /* ================================================= */
    /* PICKER                                             */
    /* ================================================= */

    pickerContainer: {
      marginTop: spacing.md,

      alignItems: 'center',

      backgroundColor: theme.colors.background,

      borderRadius: theme.radius.md,

      borderWidth: 1,

      borderColor: theme.colors.border,

      overflow: 'hidden',
    },

    /* ================================================= */
    /* OPTIONAL TEXT                                     */
    /* ================================================= */

    optionalText: {
      fontSize: 12,

      color: theme.colors.textMuted,

      marginTop: spacing.sm,
    },

    /* ================================================= */
    /* FIXED SUBMIT FOOTER                               */
    /* ================================================= */

    submitFooter: {
      paddingHorizontal: spacing.xl,

      /*
       * Small separation between the last field
       * and the button.
       */
      paddingTop: spacing.sm,

      backgroundColor: theme.colors.surface,

      borderTopWidth: 1,

      borderTopColor: '#EEF1F5',
    },

    /* ================================================= */
    /* SUBMIT BUTTON                                     */
    /* ================================================= */

    submitButton: {
      minHeight: 54,

      borderRadius: theme.radius.md,

      backgroundColor: theme.colors.primary,

      alignItems: 'center',

      justifyContent: 'center',

      /*
       * Small elevation for the primary
       * action without making it look heavy.
       */
      elevation: 3,

      shadowColor: '#000000',

      shadowOffset: {
        width: 0,

        height: 2,
      },

      shadowOpacity: 0.12,

      shadowRadius: 4,
    },

    /* ================================================= */
    /* BUTTON PRESSED                                    */
    /* ================================================= */

    submitPressed: {
      opacity: 0.82,

      transform: [
        {
          scale: 0.99,
        },
      ],
    },

    /* ================================================= */
    /* BUTTON TEXT                                       */
    /* ================================================= */

    submitText: {
      ...typography.button,

      color: '#FFFFFF',
    },
  });
