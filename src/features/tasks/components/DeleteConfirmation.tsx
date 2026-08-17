import React from 'react';
import {Modal, Pressable, StyleSheet, Text, View} from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6/static';
import type {Task} from '../types';
import {spacing} from '../../../theme/spacing';
import {typography} from '../../../theme/typography';
import {useTheme} from '../../../theme/ThemeProvider';

interface DeleteConfirmationProps {
  visible: boolean;
  task: Task | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmation({visible, task, onCancel, onConfirm}: DeleteConfirmationProps) {
  const {theme} = useTheme();
  const styles = createStyles(theme);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <View style={styles.icon}>
            <FontAwesome6 name="trash" size={20} color={theme.colors.danger} iconStyle="solid" />
          </View>
          <Text style={styles.title}>Delete task?</Text>
          <Text style={styles.message}>
            {task ? `"${task.title}" will be permanently removed.` : 'This task will be permanently removed.'}
          </Text>
          <View style={styles.actions}>
            <Pressable onPress={onCancel} style={styles.cancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={onConfirm} style={styles.confirm}>
              <Text style={styles.confirmText}>Delete</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

type AppTheme = ReturnType<typeof useTheme>['theme'];
const createStyles = (theme: AppTheme) => StyleSheet.create({
  overlay: {flex: 1, backgroundColor: theme.colors.overlay, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl},
  dialog: {width: '100%', backgroundColor: theme.colors.surface, borderRadius: 24, padding: spacing.xl, elevation: 24},
  icon: {width: 46, height: 46, borderRadius: 23, backgroundColor: theme.colors.dangerSoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg},
  title: {...typography.title, color: theme.colors.text},
  message: {...typography.body, color: theme.colors.textSecondary, lineHeight: 22, marginTop: spacing.sm},
  actions: {flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl},
  cancel: {flex: 1, height: 50, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center'},
  cancelText: {...typography.button, color: theme.colors.text},
  confirm: {flex: 1, height: 50, borderRadius: theme.radius.md, backgroundColor: theme.colors.danger, alignItems: 'center', justifyContent: 'center'},
  confirmText: {...typography.button, color: '#FFFFFF'},
});
