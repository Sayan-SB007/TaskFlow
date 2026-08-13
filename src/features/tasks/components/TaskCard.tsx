import React, {memo} from 'react';

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type {Task} from '../types';

import {lightTheme} from '../../../theme/lightTheme';
import {spacing} from '../../../theme/spacing';
import {typography} from '../../../theme/typography';
import {shadows} from '../../../theme/shadows';

interface TaskCardProps {
  task: Task;
  onPress: (task: Task) => void;
  onToggle: (task: Task) => void;
}

function TaskCardComponent({
  task,
  onPress,
  onToggle,
}: TaskCardProps) {
  const completed = task.status === 'completed';

  const priorityColor =
    task.priority === 'high'
      ? lightTheme.colors.danger
      : task.priority === 'medium'
        ? lightTheme.colors.warning
        : lightTheme.colors.success;

  return (
    <Pressable
      onPress={() => onPress(task)}
      style={({pressed}) => [
        styles.card,
        pressed && styles.pressed,
      ]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{
          checked: completed,
        }}
        accessibilityLabel={
          completed
            ? `Mark ${task.title} incomplete`
            : `Mark ${task.title} complete`
        }
        hitSlop={8}
        onPress={() => onToggle(task)}
        style={[
          styles.checkbox,
          completed && styles.checkboxCompleted,
        ]}>
        {completed && (
          <Text style={styles.check}>
            ✓
          </Text>
        )}
      </Pressable>

      <View style={styles.content}>
        <Text
          numberOfLines={1}
          style={[
            styles.title,
            completed && styles.completedTitle,
          ]}>
          {task.title}
        </Text>

        <View style={styles.meta}>
          <Text style={styles.date}>
            {task.dueDate}

            {task.dueTime
              ? ` · ${task.dueTime}`
              : ''}
          </Text>

          {!completed && (
            <View
              style={[
                styles.priority,
                {
                  backgroundColor:
                    `${priorityColor}18`,
                },
              ]}>
              <View
                style={[
                  styles.priorityDot,
                  {
                    backgroundColor:
                      priorityColor,
                  },
                ]}
              />

              <Text
                style={[
                  styles.priorityText,
                  {
                    color: priorityColor,
                  },
                ]}>
                {task.priority.toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </View>

      <Pressable
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={`More options for ${task.title}`}
        onPress={() => onPress(task)}
        style={styles.moreButton}>
        <Text style={styles.more}>•••</Text>
      </Pressable>
    </Pressable>
  );
}

export const TaskCard = memo(TaskCardComponent);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor:
      lightTheme.colors.surface,

    borderWidth: 1,
    borderColor:
      lightTheme.colors.border,

    borderRadius:
      lightTheme.radius.lg,

    paddingHorizontal:
      spacing.lg,

    paddingVertical:
      spacing.lg,

    marginBottom:
      spacing.md,

    ...shadows.card,
  },

  pressed: {
    opacity: 0.8,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  checkbox: {
    width: 23,
    height: 23,

    borderRadius: 12,

    borderWidth: 1.5,

    borderColor: '#C8CAD0',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: spacing.md,
  },

  checkboxCompleted: {
    backgroundColor:
      lightTheme.colors.primary,

    borderColor:
      lightTheme.colors.primary,
  },

  check: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  content: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    ...typography.bodyMedium,

    color:
      lightTheme.colors.text,
  },

  completedTitle: {
    color:
      lightTheme.colors.textMuted,

    textDecorationLine:
      'line-through',
  },

  meta: {
    flexDirection: 'row',
    alignItems: 'center',

    marginTop: spacing.xs,
  },

  date: {
    ...typography.caption,

    color:
      lightTheme.colors.textSecondary,
  },

  priority: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 7,
    paddingVertical: 3,

    borderRadius: 6,

    marginLeft: spacing.sm,
  },

  priorityDot: {
    width: 5,
    height: 5,

    borderRadius: 3,

    marginRight: 4,
  },

  priorityText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  moreButton: {
    marginLeft: spacing.sm,

    paddingHorizontal: 2,
    paddingVertical: 8,
  },

  more: {
    fontSize: 15,

    color:
      lightTheme.colors.textMuted,

    letterSpacing: 1,
  },
});