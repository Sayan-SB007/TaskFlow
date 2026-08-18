import React, { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6/static';
import type { Task } from '../types';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { shadows } from '../../../theme/shadows';
import { useTheme } from '../../../app/providers/ThemeProvider';

interface TaskCardProps {
  task: Task;
  onPress: (task: Task) => void;
  onToggle: (task: Task) => void;
}

function TaskCardComponent({ task, onPress, onToggle }: TaskCardProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const completed = task.status === 'completed';
  const priorityColor =
    task.priority === 'high'
      ? theme.colors.danger
      : task.priority === 'medium'
      ? theme.colors.warning
      : theme.colors.success;

  return (
    <Pressable
      onPress={() => onPress(task)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: completed }}
        accessibilityLabel={
          completed
            ? `Mark ${task.title} incomplete`
            : `Mark ${task.title} complete`
        }
        hitSlop={8}
        onPress={() => onToggle(task)}
        style={[styles.checkbox, completed && styles.checkboxCompleted]}
      >
        {completed && (
          <FontAwesome6
            name="check"
            size={12}
            color="#FFFFFF"
            iconStyle="solid"
          />
        )}
      </Pressable>

      <View style={styles.content}>
        <Text
          numberOfLines={1}
          style={[styles.title, completed && styles.completedTitle]}
        >
          {task.title}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.date} numberOfLines={1}>
            {task.dueDate || 'No due date'}
            {task.dueTime ? ` · ${task.dueTime}` : ''}
          </Text>
          {!completed && (
            <View
              style={[
                styles.priority,
                { backgroundColor: `${priorityColor}18` },
              ]}
            >
              <View
                style={[styles.priorityDot, { backgroundColor: priorityColor }]}
              />
              <Text style={[styles.priorityText, { color: priorityColor }]}>
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
        style={styles.moreButton}
      >
        <FontAwesome6
          name="ellipsis"
          size={17}
          color={theme.colors.textMuted}
          iconStyle="solid"
        />
      </Pressable>
    </Pressable>
  );
}

export const TaskCard = memo(TaskCardComponent);

type AppTheme = ReturnType<typeof useTheme>['theme'];
const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.lg,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      ...shadows.card,
    },
    pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
    checkbox: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    checkboxCompleted: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    content: { flex: 1, minWidth: 0 },
    title: { ...typography.bodyMedium, color: theme.colors.text },
    completedTitle: {
      color: theme.colors.textMuted,
      textDecorationLine: 'line-through',
    },
    meta: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
    date: {
      ...typography.caption,
      color: theme.colors.textSecondary,
      flexShrink: 1,
    },
    priority: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 6,
      marginLeft: spacing.sm,
    },
    priorityDot: { width: 5, height: 5, borderRadius: 3, marginRight: 4 },
    priorityText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.4 },
    moreButton: {
      marginLeft: spacing.sm,
      paddingHorizontal: 4,
      paddingVertical: 8,
    },
  });
