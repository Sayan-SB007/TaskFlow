import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6/static';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { useTheme } from '../../../app/providers/ThemeProvider';

interface TaskEmptyStateProps {
  disabled?: boolean;
  onCreate: () => void;
}

export function TaskEmptyState({
  disabled = false,
  onCreate,
}: TaskEmptyStateProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <FontAwesome6
          name="check"
          size={23}
          color={theme.colors.success}
          iconStyle="solid"
        />
      </View>
      <Text style={styles.title}>No tasks here</Text>
      <Text style={styles.text}>
        You're all caught up.{'\n'}Enjoy the moment.
      </Text>
      <Pressable
        onPress={onCreate}
        disabled={disabled}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.pressed,
          disabled && styles.disabled,
        ]}
      >
        <Text style={styles.buttonText}>Create a task</Text>
      </Pressable>
    </View>
  );
}

type AppTheme = ReturnType<typeof useTheme>['theme'];
const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
      paddingVertical: 60,
    },
    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.successSoft,
    },
    title: {
      ...typography.title,
      color: theme.colors.text,
      marginTop: spacing.lg,
    },
    text: {
      ...typography.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 23,
      marginTop: spacing.sm,
    },
    button: {
      minWidth: 180,
      height: 52,
      paddingHorizontal: spacing.xl,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.xl,
      elevation: 3,
    },
    buttonText: { ...typography.button, color: '#FFFFFF' },
    pressed: { opacity: 0.82 },
    disabled: { opacity: 0.5 },
  });
