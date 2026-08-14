import React from 'react';

import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type {Task} from '../types';

import {lightTheme} from '../../../theme/lightTheme';
import {spacing} from '../../../theme/spacing';
import {typography} from '../../../theme/typography';

interface TaskDetailsSheetProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onToggle: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskDetailsSheet({
  visible,
  task,
  onClose,
  onEdit,
  onToggle,
  onDelete,
}: TaskDetailsSheetProps) {
  if (!task) {
    return null;
  }

  const completed =
    task.status === 'completed';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
        />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          {/* Header */}

          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              Task details
            </Text>

            <Pressable
              onPress={onClose}
              style={styles.closeButton}>
              <Text style={styles.closeText}>
                ×
              </Text>
            </Pressable>
          </View>

          {/* Task */}

          <View style={styles.taskSection}>
            <View
              style={[
                styles.statusIcon,
                completed &&
                  styles.statusIconCompleted,
              ]}>
              <Text
                style={[
                  styles.statusIconText,
                  completed &&
                    styles.statusIconTextCompleted,
                ]}>
                {completed ? '✓' : ''}
              </Text>
            </View>

            <View style={styles.taskContent}>
              <Text
                style={[
                  styles.title,
                  completed &&
                    styles.completedTitle,
                ]}>
                {task.title}
              </Text>

              {task.description ? (
                <Text style={styles.description}>
                  {task.description}
                </Text>
              ) : (
                <Text
                  style={styles.noDescription}>
                  No description added.
                </Text>
              )}
            </View>
          </View>

          {/* Metadata */}

          <View style={styles.metadata}>
            <InfoItem
              label="DUE DATE"
              value={task.dueDate}
            />

            {task.dueTime ? (
              <InfoItem
                label="TIME"
                value={task.dueTime}
              />
            ) : null}

            <InfoItem
              label="PRIORITY"
              value={capitalize(
                task.priority,
              )}
              priority={task.priority}
            />
          </View>

          {/* Actions */}

          <View style={styles.actions}>
            <Pressable
              onPress={() =>
                onToggle(task)
              }
              style={[
                styles.primaryButton,
                completed &&
                  styles.secondaryButton,
              ]}>
              <Text
                style={[
                  styles.primaryButtonText,
                  completed &&
                    styles.secondaryButtonText,
                ]}>
                {completed
                  ? 'Mark as incomplete'
                  : 'Mark as complete'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => onEdit(task)}
              style={styles.outlineButton}>
              <Text
                style={styles.outlineButtonText}>
                Edit task
              </Text>
            </Pressable>

            <Pressable
              onPress={() => onDelete(task)}
              style={styles.deleteButton}>
              <Text
                style={styles.deleteButtonText}>
                Delete task
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function InfoItem({
  label,
  value,
  priority,
}: {
  label: string;
  value: string;
  priority?: Task['priority'];
}) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>
        {label}
      </Text>

      <View style={styles.infoValueRow}>
        {priority ? (
          <View
            style={[
              styles.priorityDot,
              {
                backgroundColor:
                  getPriorityColor(priority),
              },
            ]}
          />
        ) : null}

        <Text style={styles.infoValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function getPriorityColor(
  priority: Task['priority'],
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

function capitalize(value: string) {
  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
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
    backgroundColor:
      lightTheme.colors.background,

    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,

    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: 36,
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

    justifyContent:
      'space-between',

    marginBottom: spacing.xxl,
  },

  headerTitle: {
    ...typography.title,

    color:
      lightTheme.colors.text,
  },

  closeButton: {
    width: 38,
    height: 38,

    borderRadius: 19,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      lightTheme.colors.surface,

    borderWidth: 1,

    borderColor:
      lightTheme.colors.border,
  },

  closeText: {
    fontSize: 25,

    lineHeight: 27,

    color:
      lightTheme.colors.textSecondary,
  },

  taskSection: {
    flexDirection: 'row',

    marginBottom: spacing.xxl,
  },

  statusIcon: {
    width: 30,
    height: 30,

    borderRadius: 15,

    borderWidth: 1.5,

    borderColor:
      lightTheme.colors.border,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: spacing.md,

    marginTop: 2,
  },

  statusIconCompleted: {
    backgroundColor:
      lightTheme.colors.primary,

    borderColor:
      lightTheme.colors.primary,
  },

  statusIconText: {
    color:
      lightTheme.colors.textMuted,

    fontSize: 16,

    fontWeight: '700',
  },

  statusIconTextCompleted: {
    color: '#FFFFFF',
  },

  taskContent: {
    flex: 1,
  },

  title: {
    ...typography.title,

    color:
      lightTheme.colors.text,
  },

  completedTitle: {
    textDecorationLine:
      'line-through',

    color:
      lightTheme.colors.textMuted,
  },

  description: {
    ...typography.body,

    color:
      lightTheme.colors.textSecondary,

    marginTop: spacing.sm,

    lineHeight: 23,
  },

  noDescription: {
    ...typography.body,

    color:
      lightTheme.colors.textMuted,

    fontStyle: 'italic',

    marginTop: spacing.sm,
  },

  metadata: {
    flexDirection: 'row',

    backgroundColor:
      lightTheme.colors.surface,

    borderWidth: 1,

    borderColor:
      lightTheme.colors.border,

    borderRadius:
      lightTheme.radius.lg,

    padding: spacing.lg,

    marginBottom: spacing.xxl,
  },

  infoItem: {
    flex: 1,
  },

  infoLabel: {
    ...typography.caption,

    color:
      lightTheme.colors.textMuted,

    fontWeight: '700',

    letterSpacing: 0.6,

    marginBottom: spacing.xs,
  },

  infoValueRow: {
    flexDirection: 'row',

    alignItems: 'center',
  },

  infoValue: {
    ...typography.bodyMedium,

    color:
      lightTheme.colors.text,
  },

  priorityDot: {
    width: 7,
    height: 7,

    borderRadius: 4,

    marginRight: 6,
  },

  actions: {
    gap: spacing.md,
  },

  primaryButton: {
    minHeight: 54,

    borderRadius:
      lightTheme.radius.md,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      lightTheme.colors.primary,
  },

  primaryButtonText: {
    ...typography.button,

    color: '#FFFFFF',
  },

  secondaryButton: {
    backgroundColor:
      lightTheme.colors.surface,

    borderWidth: 1,

    borderColor:
      lightTheme.colors.primary,
  },

  secondaryButtonText: {
    color:
      lightTheme.colors.primary,
  },

  outlineButton: {
    minHeight: 54,

    borderRadius:
      lightTheme.radius.md,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      lightTheme.colors.surface,

    borderWidth: 1,

    borderColor:
      lightTheme.colors.border,
  },

  outlineButtonText: {
    ...typography.button,

    color:
      lightTheme.colors.text,
  },

  deleteButton: {
    minHeight: 48,

    alignItems: 'center',
    justifyContent: 'center',
  },

  deleteButtonText: {
    ...typography.bodyMedium,

    color:
      lightTheme.colors.danger,
  },
});