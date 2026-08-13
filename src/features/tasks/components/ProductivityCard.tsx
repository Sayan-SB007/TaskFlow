import React, {memo} from 'react';

import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {lightTheme} from '../../../theme/lightTheme';
import {spacing} from '../../../theme/spacing';
import {typography} from '../../../theme/typography';

interface ProductivityCardProps {
  total: number;
  completed: number;
  remaining: number;
  progress: number;
}

function ProductivityCardComponent({
  total,
  completed,
  remaining,
  progress,
}: ProductivityCardProps) {
  const percentage =
    Math.round(progress * 100);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.label}>
            YOUR PRODUCTIVITY
          </Text>

          <Text style={styles.title}>
            Keep the momentum going
          </Text>
        </View>

        <Text style={styles.percentage}>
          {percentage}%
        </Text>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progress,
            {
              width: `${percentage}%`,
            },
          ]}
        />
      </View>

      <View style={styles.stats}>
        <Stat
          value={total}
          label="Tasks"
        />

        <Divider />

        <Stat
          value={completed}
          label="Done"
        />

        <Divider />

        <Stat
          value={remaining}
          label="Remaining"
        />
      </View>
    </View>
  );
}

function Stat({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>
        {value}
      </Text>

      <Text style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

export const ProductivityCard =
  memo(ProductivityCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor:
      lightTheme.colors.primary,

    borderRadius:
      lightTheme.radius.xxl,

    padding: spacing.xl,

    marginBottom:
      spacing.xxxl,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  titleContainer: {
    flex: 1,
  },

  label: {
    ...typography.caption,

    color:
      'rgba(255,255,255,0.68)',

    letterSpacing: 0.8,
  },

  title: {
    ...typography.heading,

    color: '#FFFFFF',

    marginTop: spacing.xs,
  },

  percentage: {
    fontSize: 26,
    fontWeight: '700',

    color: '#FFFFFF',

    marginLeft: spacing.md,
  },

  progressTrack: {
    height: 7,

    backgroundColor:
      'rgba(255,255,255,0.2)',

    borderRadius: 4,

    overflow: 'hidden',

    marginTop: spacing.xl,
  },

  progress: {
    height: '100%',

    backgroundColor: '#FFFFFF',

    borderRadius: 4,
  },

  stats: {
    flexDirection: 'row',
    alignItems: 'center',

    marginTop: spacing.xl,
  },

  stat: {
    flex: 1,
  },

  statValue: {
    fontSize: 20,
    fontWeight: '700',

    color: '#FFFFFF',
  },

  statLabel: {
    ...typography.caption,

    color:
      'rgba(255,255,255,0.65)',

    marginTop: 2,
  },

  divider: {
    width: 1,
    height: 32,

    backgroundColor:
      'rgba(255,255,255,0.2)',

    marginHorizontal: spacing.md,
  },
});