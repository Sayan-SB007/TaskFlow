import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {TaskFilter} from '../types';
import {spacing} from '../../../theme/spacing';
import {typography} from '../../../theme/typography';
import {useTheme} from '../../../app/providers/ThemeProvider';

const FILTERS: {label: string; value: TaskFilter}[] = [
  {label: 'All', value: 'all'},
  {label: 'Today', value: 'today'},
  {label: 'Upcoming', value: 'upcoming'},
];

interface TaskFiltersProps {
  value: TaskFilter;
  disabled?: boolean;
  onChange: (value: TaskFilter) => void;
}

export function TaskFilters({value, disabled = false, onChange}: TaskFiltersProps) {
  const {theme} = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {FILTERS.map(item => {
        const active = value === item.value;
        return (
          <Pressable
            key={item.value}
            onPress={() => onChange(item.value)}
            disabled={disabled}
            style={({pressed}) => [
              styles.filter,
              active && styles.active,
              pressed && styles.pressed,
              disabled && styles.disabled,
            ]}>
            <Text style={[styles.text, active && styles.activeText]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

type AppTheme = ReturnType<typeof useTheme>['theme'];
const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {flexDirection: 'row', marginBottom: spacing.lg},
  filter: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
    marginRight: spacing.sm,
  },
  active: {
    backgroundColor: theme.colors.primarySoft,
  },
  text: {...typography.caption, color: theme.colors.textSecondary},
  activeText: {color: theme.colors.primary, fontWeight: '700'},
  pressed: {opacity: 0.75},
  disabled: {opacity: 0.5},
});
