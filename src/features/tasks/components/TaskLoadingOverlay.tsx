import React from 'react';
import {ActivityIndicator, Modal, StyleSheet, Text, View} from 'react-native';
import {spacing} from '../../../theme/spacing';
import {typography} from '../../../theme/typography';
import {useTheme} from '../../../app/providers/ThemeProvider';

interface TaskLoadingOverlayProps {visible: boolean; message: string;}
export function TaskLoadingOverlay({visible, message}: TaskLoadingOverlayProps) {
  const {theme} = useTheme();
  const styles = createStyles(theme);
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={() => {}}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.title}>Please wait</Text>
          <Text style={styles.text}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}

type AppTheme = ReturnType<typeof useTheme>['theme'];
const createStyles = (theme: AppTheme) => StyleSheet.create({
  overlay: {flex: 1, backgroundColor: theme.colors.overlay, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl},
  card: {width: '100%', maxWidth: 300, backgroundColor: theme.colors.surface, borderRadius: 24, padding: spacing.xl, alignItems: 'center', elevation: 20},
  title: {...typography.title, color: theme.colors.text, marginTop: spacing.lg},
  text: {...typography.body, color: theme.colors.textSecondary, marginTop: spacing.xs, textAlign: 'center'},
});
