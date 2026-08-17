import React, { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { useTheme } from '../../../app/providers/ThemeProvider';

interface ProductivityCardProps { total: number; completed: number; remaining: number; progress: number; }

function ProductivityCardComponent({ total, completed, remaining, progress }: ProductivityCardProps) {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);
  const percentage = Math.round(progress * 100);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.label}>YOUR PRODUCTIVITY</Text>
          <Text style={styles.title}>Keep the momentum going</Text>
        </View>
        <Text style={styles.percentage}>{percentage}%</Text>
      </View>
      <View style={styles.progressTrack}><View style={[styles.progress, { width: `${percentage}%` }]} /></View>
      <View style={styles.stats}>
        <Stat value={total} label="Tasks" styles={styles} />
        <Divider styles={styles} />
        <Stat value={completed} label="Done" styles={styles} />
        <Divider styles={styles} />
        <Stat value={remaining} label="Remaining" styles={styles} />
      </View>
    </View>
  );
}

function Stat({ value, label, styles }: { value: number; label: string; styles: ReturnType<typeof createStyles> }) {
  return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}
function Divider({ styles }: { styles: ReturnType<typeof createStyles> }) { return <View style={styles.divider} />; }
export const ProductivityCard = memo(ProductivityCardComponent);

type AppTheme = ReturnType<typeof useTheme>['theme'];
const createStyles = (theme: AppTheme, isDark: boolean) => StyleSheet.create({
  card: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.xxl, padding: spacing.xl, marginBottom: spacing.xxxl, borderWidth: isDark ? 1 : 0, borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'transparent' },
  header: { flexDirection: 'row', justifyContent: 'space-between' },
  titleContainer: { flex: 1 },
  label: { ...typography.caption, color: 'rgba(255,255,255,0.70)', letterSpacing: 0.8 },
  title: { ...typography.heading, color: '#FFFFFF', marginTop: spacing.xs },
  percentage: { fontSize: 26, fontWeight: '700', color: '#FFFFFF', marginLeft: spacing.md },
  progressTrack: { height: 7, backgroundColor: 'rgba(255,255,255,0.20)', borderRadius: 4, overflow: 'hidden', marginTop: spacing.xl },
  progress: { height: '100%', backgroundColor: '#FFFFFF', borderRadius: 4 },
  stats: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xl },
  stat: { flex: 1 },
  statValue: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  statLabel: { ...typography.caption, color: 'rgba(255,255,255,0.68)', marginTop: 2 },
  divider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.20)', marginHorizontal: spacing.md },
});
