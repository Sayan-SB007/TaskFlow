import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6/static';
import {spacing} from '../../../theme/spacing';
import {typography} from '../../../theme/typography';
import {shadows} from '../../../theme/shadows';
import {useTheme} from '../../../app/providers/ThemeProvider';

interface TasksHeaderProps {
  greeting: string;
  userName: string;
  notificationCount: number;
  disabled?: boolean;
  onNotificationsPress: () => void;
}

export function TasksHeader({
  greeting,
  userName,
  notificationCount,
  disabled = false,
  onNotificationsPress,
}: TasksHeaderProps) {
  const {theme} = useTheme();
  const styles = createStyles(theme);

  const iconName =
    greeting === 'Good morning'
      ? 'sun'
      : greeting === 'Good afternoon'
        ? 'cloud-sun'
        : greeting === 'Good evening'
          ? 'moon'
          : 'moon';

  return (
    <View style={styles.header}>
      <View style={styles.greetingRow}>
        <View style={styles.greetingIcon}>
          <FontAwesome6
            name={iconName}
            size={13}
            color={theme.colors.primary}
            iconStyle="solid"
          />
        </View>

        <Text style={styles.greeting}>{greeting}</Text>
      </View>

      <View style={styles.headerBottomRow}>
        <View style={styles.nameContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {userName}
          </Text>
          <Text style={styles.headerHint}>Stay focused and keep moving.</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            notificationCount > 0
              ? `${notificationCount} notifications`
              : 'Notifications'
          }
          disabled={disabled}
          onPress={onNotificationsPress}
          style={({pressed}) => [
            styles.notificationButton,
            pressed && styles.pressed,
            disabled && styles.disabled,
          ]}>
          <FontAwesome6
            name="bell"
            size={18}
            color={theme.colors.primary}
            iconStyle="solid"
          />
          {notificationCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {notificationCount > 9 ? '9+' : notificationCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

type AppTheme = ReturnType<typeof useTheme>['theme'];
const createStyles = (theme: AppTheme) => StyleSheet.create({
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  greetingIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  greeting: {
    ...typography.bodyMedium,
    color: theme.colors.textSecondary,
  },
  headerBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameContainer: {
    flex: 1,
    paddingRight: spacing.lg,
  },
  name: {
    ...typography.display,
    color: theme.colors.text,
  },
  headerHint: {
    ...typography.caption,
    color: theme.colors.textMuted,
    marginTop: 3,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  badge: {
    position: 'absolute',
    top: 3,
    right: 3,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    paddingHorizontal: 3,
    backgroundColor: theme.colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  pressed: {opacity: 0.78},
  disabled: {opacity: 0.5},
});
