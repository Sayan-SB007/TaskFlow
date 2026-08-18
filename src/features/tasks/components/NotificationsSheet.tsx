import React from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6/static';
import type { Task } from '../types';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { useTheme } from '../../../app/providers/ThemeProvider';

interface NotificationsSheetProps {
  visible: boolean;
  notifications: Task[];
  onClose: () => void;
  onPress: (task: Task) => void;
}
export function NotificationsSheet({
  visible,
  notifications,
  onClose,
  onPress,
}: NotificationsSheetProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <FontAwesome6
                  name="bell"
                  size={17}
                  color={theme.colors.primary}
                  iconStyle="solid"
                />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.title}>Notifications</Text>
                <Text style={styles.subtitle}>Today's task reminders</Text>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close notifications"
              onPress={onClose}
              style={styles.close}
            >
              <FontAwesome6
                name="xmark"
                size={17}
                color={theme.colors.textSecondary}
                iconStyle="solid"
              />
            </Pressable>
          </View>
          {notifications.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <FontAwesome6
                  name="check"
                  size={22}
                  color={theme.colors.success}
                  iconStyle="solid"
                />
              </View>
              <Text style={styles.emptyTitle}>You're all caught up</Text>
              <Text style={styles.emptyText}>No task reminders for today.</Text>
            </View>
          ) : (
            <FlatList
              data={notifications}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Open task ${item.title}`}
                  onPress={() => onPress(item)}
                  style={({ pressed }) => [
                    styles.item,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.itemIcon}>
                    <FontAwesome6
                      name="clock"
                      size={15}
                      color={theme.colors.primary}
                      iconStyle="solid"
                    />
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.itemTime}>{item.dueTime}</Text>
                  </View>
                  <FontAwesome6
                    name="chevron-right"
                    size={14}
                    color={theme.colors.textMuted}
                    iconStyle="solid"
                  />
                </Pressable>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

type AppTheme = ReturnType<typeof useTheme>['theme'];
const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: theme.colors.overlay,
    },
    backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'transparent' },
    sheet: {
      width: '100%',
      maxHeight: '78%',
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingTop: spacing.md,
      paddingBottom: spacing.xxl,
      elevation: 24,
    },
    handle: {
      alignSelf: 'center',
      width: 42,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.border,
      marginBottom: spacing.lg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.lg,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    iconContainer: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor: theme.colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    headerText: { flex: 1 },
    title: { ...typography.title, color: theme.colors.text },
    subtitle: {
      ...typography.caption,
      color: theme.colors.textSecondary,
      marginTop: spacing.xs,
    },
    close: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    empty: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
      paddingVertical: 70,
    },
    emptyIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.successSoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    emptyTitle: {
      ...typography.title,
      color: theme.colors.text,
      textAlign: 'center',
    },
    emptyText: {
      ...typography.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
    list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 64,
      paddingHorizontal: spacing.md,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: spacing.sm,
    },
    itemIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: theme.colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    itemContent: { flex: 1 },
    itemTitle: {
      ...typography.bodyMedium,
      color: theme.colors.text,
      fontWeight: '600',
    },
    itemTime: {
      ...typography.caption,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    pressed: { opacity: 0.78 },
  });
