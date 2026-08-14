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

  const isCompleted =
    task.status === 'completed';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Backdrop */}

        <Pressable
          style={styles.backdrop}
          onPress={onClose}
        />

        {/* Bottom Sheet */}

        <View style={styles.sheet}>
          {/* Handle */}

          <View style={styles.handle} />

          {/* Header */}

          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              Task details
            </Text>

            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close task details">
              <Text style={styles.closeText}>
                ×
              </Text>
            </Pressable>
          </View>

          {/* Task Information */}

          <View style={styles.taskRow}>
            <View
              style={[
                styles.statusCircle,
                isCompleted &&
                  styles.statusCircleCompleted,
              ]}>
              {isCompleted && (
                <Text
                  style={
                    styles.checkmark
                  }>
                  ✓
                </Text>
              )}
            </View>

            <View
              style={styles.taskContent}>
              <Text
                style={[
                  styles.taskTitle,
                  isCompleted &&
                    styles.completedTitle,
                ]}>
                {task.title}
              </Text>

              {task.description ? (
                <Text
                  style={styles.description}>
                  {task.description}
                </Text>
              ) : (
                <Text
                  style={styles.emptyDescription}>
                  No description added.
                </Text>
              )}
            </View>
          </View>

          {/* Task Metadata */}

          <View style={styles.metadataCard}>
            <MetadataItem
              label="DUE DATE"
              value={task.dueDate}
            />

            {task.dueTime ? (
              <MetadataItem
                label="TIME"
                value={task.dueTime}
              />
            ) : (
              <MetadataItem
                label="TIME"
                value="Not set"
              />
            )}

            <MetadataItem
              label="PRIORITY"
              value={capitalize(
                task.priority,
              )}
              priority={task.priority}
            />
          </View>

          {/* Actions */}

          <View style={styles.actions}>
            {/* Complete */}

            <Pressable
              onPress={() =>
                onToggle(task)
              }
              style={[
                styles.primaryButton,
                isCompleted &&
                  styles.completedButton,
              ]}
              accessibilityRole="button">
              <Text
                style={[
                  styles.primaryButtonText,
                  isCompleted &&
                    styles.completedButtonText,
                ]}>
                {isCompleted
                  ? 'Mark as incomplete'
                  : 'Mark as complete'}
              </Text>
            </Pressable>

            {/* Edit */}

            <Pressable
              onPress={() =>
                onEdit(task)
              }
              style={styles.secondaryButton}
              accessibilityRole="button">
              <Text
                style={
                  styles.secondaryButtonText
                }>
                Edit task
              </Text>
            </Pressable>

            {/* Delete */}

            <Pressable
              onPress={() =>
                onDelete(task)
              }
              style={styles.deleteButton}
              accessibilityRole="button">
              <Text
                style={styles.deleteText}>
                Delete task
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* ================================================= */
/* METADATA ITEM                                     */
/* ================================================= */

interface MetadataItemProps {
  label: string;
  value: string;
  priority?: Task['priority'];
}

function MetadataItem({
  label,
  value,
  priority,
}: MetadataItemProps) {
  return (
    <View style={styles.metadataItem}>
      <Text style={styles.metadataLabel}>
        {label}
      </Text>

      <View
        style={styles.metadataValueRow}>
        {priority && (
          <View
            style={[
              styles.priorityDot,
              {
                backgroundColor:
                  getPriorityColor(
                    priority,
                  ),
              },
            ]}
          />
        )}

        <Text
          numberOfLines={1}
          style={styles.metadataValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

/* ================================================= */
/* HELPERS                                           */
/* ================================================= */

function capitalize(value: string) {
  if (!value) {
    return '';
  }

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
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

    case 'low':
    default:
      return lightTheme.colors.success;
  }
}

/* ================================================= */
/* STYLES                                            */
/* ================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,

    justifyContent: 'flex-end',
  },

  backdrop: {
    ...StyleSheet.absoluteFill,

    backgroundColor:
      'rgba(15, 18, 25, 0.50)',
  },

  sheet: {
    backgroundColor:
      lightTheme.colors.background,

    borderTopLeftRadius: 28,

    borderTopRightRadius: 28,

    paddingHorizontal:
      spacing.xl,

    paddingTop: spacing.md,

    paddingBottom: 34,

    /*
     * Prevent the sheet from becoming
     * too tall on smaller devices.
     */
    maxHeight: '88%',
  },

  handle: {
    alignSelf: 'center',

    width: 42,

    height: 4,

    borderRadius: 2,

    backgroundColor:
      lightTheme.colors.border,

    marginBottom: spacing.lg,
  },

  /* ========================= */
  /* HEADER */
  /* ========================= */

  header: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent:
      'space-between',

    marginBottom:
      spacing.xxl,
  },

  headerTitle: {
    ...typography.title,

    color:
      lightTheme.colors.text,
  },

  closeButton: {
    width: 40,

    height: 40,

    borderRadius: 20,

    alignItems: 'center',

    justifyContent: 'center',

    backgroundColor:
      lightTheme.colors.surface,

    borderWidth: 1,

    borderColor:
      lightTheme.colors.border,
  },

  closeText: {
    fontSize: 26,

    lineHeight: 28,

    fontWeight: '300',

    color:
      lightTheme.colors.textSecondary,
  },

  /* ========================= */
  /* TASK */
  /* ========================= */

  taskRow: {
    flexDirection: 'row',

    marginBottom:
      spacing.xxl,
  },

  statusCircle: {
    width: 32,

    height: 32,

    borderRadius: 16,

    borderWidth: 1.5,

    borderColor:
      lightTheme.colors.border,

    alignItems: 'center',

    justifyContent: 'center',

    marginTop: 2,

    marginRight: spacing.md,
  },

  statusCircleCompleted: {
    backgroundColor:
      lightTheme.colors.primary,

    borderColor:
      lightTheme.colors.primary,
  },

  checkmark: {
    color: '#FFFFFF',

    fontSize: 17,

    fontWeight: '700',
  },

  taskContent: {
    flex: 1,
  },

  taskTitle: {
    ...typography.title,

    color:
      lightTheme.colors.text,

    lineHeight: 25,
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

    lineHeight: 22,

    marginTop: spacing.sm,
  },

  emptyDescription: {
    ...typography.body,

    color:
      lightTheme.colors.textMuted,

    fontStyle: 'italic',

    marginTop: spacing.sm,
  },

  /* ========================= */
  /* METADATA */
  /* ========================= */

  metadataCard: {
    flexDirection: 'row',

    backgroundColor:
      lightTheme.colors.surface,

    borderWidth: 1,

    borderColor:
      lightTheme.colors.border,

    borderRadius:
      lightTheme.radius.lg,

    paddingHorizontal:
      spacing.md,

    paddingVertical:
      spacing.lg,

    marginBottom:
      spacing.xxl,
  },

  metadataItem: {
    flex: 1,

    minWidth: 0,
  },

  metadataLabel: {
    ...typography.caption,

    color:
      lightTheme.colors.textMuted,

    fontWeight: '700',

    letterSpacing: 0.6,

    marginBottom: spacing.xs,
  },

  metadataValueRow: {
    flexDirection: 'row',

    alignItems: 'center',

    minWidth: 0,
  },

  metadataValue: {
    ...typography.bodyMedium,

    color:
      lightTheme.colors.text,

    flexShrink: 1,
  },

  priorityDot: {
    width: 7,

    height: 7,

    borderRadius: 4,

    marginRight: 6,
  },

  /* ========================= */
  /* ACTIONS */
  /* ========================= */

  actions: {
    gap: spacing.md,
  },

  primaryButton: {
    height: 54,

    borderRadius:
      lightTheme.radius.md,

    backgroundColor:
      lightTheme.colors.primary,

    alignItems: 'center',

    justifyContent: 'center',
  },

  primaryButtonText: {
    ...typography.button,

    color: '#FFFFFF',
  },

  completedButton: {
    backgroundColor:
      lightTheme.colors.surface,

    borderWidth: 1,

    borderColor:
      lightTheme.colors.primary,
  },

  completedButtonText: {
    color:
      lightTheme.colors.primary,
  },

  secondaryButton: {
    height: 54,

    borderRadius:
      lightTheme.radius.md,

    backgroundColor:
      lightTheme.colors.surface,

    borderWidth: 1,

    borderColor:
      lightTheme.colors.border,

    alignItems: 'center',

    justifyContent: 'center',
  },

  secondaryButtonText: {
    ...typography.button,

    color:
      lightTheme.colors.text,
  },

  deleteButton: {
    height: 46,

    alignItems: 'center',

    justifyContent: 'center',
  },

  deleteText: {
    ...typography.bodyMedium,

    color:
      lightTheme.colors.danger,
  },
});