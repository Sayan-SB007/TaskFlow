import React, {useEffect, useState} from 'react';

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

import type {
  Task,
  TaskPriority,
} from '../types';

import {useAppDispatch} from '../../../hooks/useAppDispatch';

import {
  addTask,
  updateTask,
} from '../taskSlice';

import {lightTheme} from '../../../theme/lightTheme';
import {spacing} from '../../../theme/spacing';
import {typography} from '../../../theme/typography';

interface TaskFormSheetProps {
  visible: boolean;
  task?: Task | null;
  onClose: () => void;
}

const PRIORITIES: TaskPriority[] = [
  'low',
  'medium',
  'high',
];

export function TaskFormSheet({
  visible,
  task,
  onClose,
}: TaskFormSheetProps) {
  const dispatch = useAppDispatch();

  const editing = Boolean(task);

  const [title, setTitle] = useState('');
  const [description, setDescription] =
    useState('');

  const [priority, setPriority] =
    useState<TaskPriority>('medium');

  const [dueDate, setDueDate] =
    useState('Today');

  const [dueTime, setDueTime] =
    useState('');

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      setPriority(task.priority);
      setDueDate(task.dueDate);
      setDueTime(task.dueTime ?? '');
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('Today');
      setDueTime('');
    }

    setError(null);
  }, [visible, task]);

  const handleSubmit = () => {
    const trimmedTitle =
      title.trim();

    if (!trimmedTitle) {
      setError('Task title is required.');
      return;
    }

    if (editing && task) {
      dispatch(
        updateTask({
          id: task.id,
          title: trimmedTitle,
          description:
            description.trim() || undefined,
          priority,
          dueDate: dueDate.trim() || 'Today',
          dueTime:
            dueTime.trim() || undefined,
        }),
      );
    } else {
      dispatch(
        addTask({
          title: trimmedTitle,
          description:
            description.trim() || undefined,
          priority,
          dueDate: dueDate.trim() || 'Today',
          dueTime:
            dueTime.trim() || undefined,
        }),
      );
    }

    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
        style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
        />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View>
              <Text style={styles.title}>
                {editing
                  ? 'Edit task'
                  : 'Create task'}
              </Text>

              <Text style={styles.subtitle}>
                {editing
                  ? 'Update your task details'
                  : 'Add something you want to accomplish'}
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={styles.closeButton}>
              <Text style={styles.close}>
                ×
              </Text>
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={
              styles.form
            }>
            <View>
              <Text style={styles.label}>
                TITLE
              </Text>

              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="What needs to be done?"
                placeholderTextColor={
                  lightTheme.colors.textMuted
                }
                style={styles.input}
                autoFocus={!editing}
              />

              {error && (
                <Text style={styles.error}>
                  {error}
                </Text>
              )}
            </View>

            <View>
              <Text style={styles.label}>
                DESCRIPTION
              </Text>

              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Add some context..."
                placeholderTextColor={
                  lightTheme.colors.textMuted
                }
                style={[
                  styles.input,
                  styles.textarea,
                ]}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View>
              <Text style={styles.label}>
                PRIORITY
              </Text>

              <View style={styles.priorityRow}>
                {PRIORITIES.map(item => {
                  const active =
                    priority === item;

                  return (
                    <Pressable
                      key={item}
                      onPress={() =>
                        setPriority(item)
                      }
                      style={[
                        styles.priorityOption,
                        active &&
                          styles.priorityActive,
                      ]}>
                      <View
                        style={[
                          styles.priorityDot,
                          {
                            backgroundColor:
                              getPriorityColor(
                                item,
                              ),
                          },
                        ]}
                      />

                      <Text
                        style={[
                          styles.priorityText,
                          active &&
                            styles.priorityTextActive,
                        ]}>
                        {capitalize(item)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.label}>
                  DUE DATE
                </Text>

                <TextInput
                  value={dueDate}
                  onChangeText={setDueDate}
                  placeholder="Today"
                  placeholderTextColor={
                    lightTheme.colors.textMuted
                  }
                  style={styles.input}
                />
              </View>

              <View style={styles.half}>
                <Text style={styles.label}>
                  TIME
                </Text>

                <TextInput
                  value={dueTime}
                  onChangeText={setDueTime}
                  placeholder="10:30 AM"
                  placeholderTextColor={
                    lightTheme.colors.textMuted
                  }
                  style={styles.input}
                />
              </View>
            </View>

            <Pressable
              onPress={handleSubmit}
              style={({pressed}) => [
                styles.submitButton,
                pressed &&
                  styles.submitPressed,
              ]}>
              <Text
                style={styles.submitText}>
                {editing
                  ? 'Save changes'
                  : 'Create task'}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function capitalize(
  value: string,
) {
  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}

function getPriorityColor(
  priority: TaskPriority,
) {
  switch (priority) {
    case 'high':
      return lightTheme.colors.danger;

    case 'medium':
      return lightTheme.colors.warning;

    default:
      return lightTheme.colors.success;
  }
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor:
      'rgba(15, 18, 25, 0.45)',
  },

  sheet: {
    maxHeight: '92%',

    backgroundColor:
      lightTheme.colors.background,

    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,

    paddingTop: spacing.md,
  },

  handle: {
    alignSelf: 'center',

    width: 40,
    height: 4,

    borderRadius: 2,

    backgroundColor:
      lightTheme.colors.border,

    marginBottom: spacing.lg,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },

  title: {
    ...typography.title,
    color: lightTheme.colors.text,
  },

  subtitle: {
    ...typography.caption,

    color:
      lightTheme.colors.textSecondary,

    marginTop: spacing.xs,
  },

  closeButton: {
    width: 38,
    height: 38,

    borderRadius: 19,

    backgroundColor:
      lightTheme.colors.surface,

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 1,
    borderColor:
      lightTheme.colors.border,
  },

  close: {
    fontSize: 26,
    lineHeight: 28,

    color:
      lightTheme.colors.textSecondary,
  },

  form: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 36,

    gap: spacing.xl,
  },

  label: {
    ...typography.caption,

    color:
      lightTheme.colors.textSecondary,

    fontWeight: '700',

    letterSpacing: 0.7,

    marginBottom: spacing.sm,
  },

  input: {
    minHeight: 52,

    backgroundColor:
      lightTheme.colors.surface,

    borderWidth: 1,
    borderColor:
      lightTheme.colors.border,

    borderRadius:
      lightTheme.radius.md,

    paddingHorizontal: spacing.lg,

    color:
      lightTheme.colors.text,

    fontSize: 15,
  },

  textarea: {
    minHeight: 100,

    paddingTop: spacing.md,
  },

  error: {
    ...typography.caption,

    color:
      lightTheme.colors.danger,

    marginTop: spacing.xs,
  },

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

    borderRadius:
      lightTheme.radius.md,

    borderWidth: 1,
    borderColor:
      lightTheme.colors.border,

    backgroundColor:
      lightTheme.colors.surface,
  },

  priorityActive: {
    backgroundColor:
      lightTheme.colors.primarySoft,

    borderColor:
      lightTheme.colors.primary,
  },

  priorityDot: {
    width: 7,
    height: 7,

    borderRadius: 4,

    marginRight: 6,
  },

  priorityText: {
    ...typography.caption,

    color:
      lightTheme.colors.textSecondary,
  },

  priorityTextActive: {
    color:
      lightTheme.colors.primary,

    fontWeight: '700',
  },

  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  half: {
    flex: 1,
  },

  submitButton: {
    minHeight: 54,

    borderRadius:
      lightTheme.radius.md,

    backgroundColor:
      lightTheme.colors.primary,

    alignItems: 'center',
    justifyContent: 'center',

    marginTop: spacing.sm,
  },

  submitPressed: {
    opacity: 0.8,
  },

  submitText: {
    ...typography.button,

    color: '#FFFFFF',
  },
});