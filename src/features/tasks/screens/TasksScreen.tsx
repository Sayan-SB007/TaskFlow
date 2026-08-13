import React, { useCallback } from 'react';
import {
    FlatList,
    Platform,
    Pressable,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useAppSelector';

import {
    selectCompletedCount,
    selectProgress,
    selectRemainingCount,
    selectTaskCount,
    selectTaskFilter,
    selectVisibleTasks,
} from '../taskSelectors';

import {
    setFilter,
    toggleTask,
} from '../taskSlice';

import type {
    Task,
    TaskFilter,
} from '../types';

import { TaskCard } from '../components/TaskCard';
import { ProductivityCard } from '../components/ProductivityCard';

import { lightTheme } from '../../../theme/lightTheme';
import { spacing } from '../../../theme/spacing';
import { typography } from '../../../theme/typography';
import { shadows } from '../../../theme/shadows';

const FILTERS: {
    label: string;
    value: TaskFilter;
}[] = [
        {
            label: 'All',
            value: 'all',
        },
        {
            label: 'Today',
            value: 'today',
        },
        {
            label: 'Upcoming',
            value: 'upcoming',
        },
    ];

export function TasksScreen() {
    const dispatch = useAppDispatch();

    const tasks = useAppSelector(
        selectVisibleTasks,
    );

    const filter = useAppSelector(
        selectTaskFilter,
    );

    const total = useAppSelector(
        selectTaskCount,
    );

    const completed = useAppSelector(
        selectCompletedCount,
    );

    const remaining = useAppSelector(
        selectRemainingCount,
    );

    const progress = useAppSelector(
        selectProgress,
    );

    const handleToggle = useCallback(
        (task: Task) => {
            dispatch(toggleTask(task.id));
        },
        [dispatch],
    );

    const handleTaskPress = useCallback(
        (task: Task) => {
            // Task details screen will be added next.
            console.log(
                'Selected task:',
                task.id,
            );
        },
        [],
    );

    const handleFilter = useCallback(
        (value: TaskFilter) => {
            dispatch(setFilter(value));
        },
        [dispatch],
    );

    const renderTask = useCallback(
        ({
            item,
        }: {
            item: Task;
        }) => (
            <TaskCard
                task={item}
                onToggle={handleToggle}
                onPress={handleTaskPress}
            />
        ),
        [
            handleToggle,
            handleTaskPress,
        ],
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor={
                    lightTheme.colors.background
                }
            />

            <FlatList
                data={tasks}
                keyExtractor={item => item.id}
                renderItem={renderTask}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={
                    styles.content
                }
                initialNumToRender={8}
                maxToRenderPerBatch={8}
                windowSize={7}
                removeClippedSubviews
                ListHeaderComponent={
                    <>
                        <View style={styles.header}>
                            <View>
                                <Text style={styles.greeting}>
                                    Good morning 👋
                                </Text>

                                <Text style={styles.name}>
                                    Sayan
                                </Text>
                            </View>

                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Notifications"
                                style={
                                    styles.notificationButton
                                }>
                                <Text
                                    style={
                                        styles.notificationIcon
                                    }>
                                      🔔
                                </Text>

                                <View
                                    style={
                                        styles.notificationDot
                                    }
                                />
                            </Pressable>
                        </View>

                        <ProductivityCard
                            total={total}
                            completed={completed}
                            remaining={remaining}
                            progress={progress}
                        />

                        <View
                            style={styles.sectionHeader}>
                            <Text
                                style={styles.sectionTitle}>
                                My Tasks
                            </Text>

                            <Pressable>
                                <Text
                                    style={styles.seeAll}>
                                    See all
                                </Text>
                            </Pressable>
                        </View>

                        <View style={styles.filters}>
                            {FILTERS.map(item => {
                                const active =
                                    filter === item.value;

                                return (
                                    <Pressable
                                        key={item.value}
                                        onPress={() =>
                                            handleFilter(
                                                item.value,
                                            )
                                        }
                                        style={[
                                            styles.filter,
                                            active &&
                                            styles.filterActive,
                                        ]}>
                                        <Text
                                            style={[
                                                styles.filterText,
                                                active &&
                                                styles.filterTextActive,
                                            ]}>
                                            {item.label}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </>
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyIcon}>
                            ✓
                        </Text>

                        <Text
                            style={styles.emptyTitle}>
                            No tasks here
                        </Text>

                        <Text
                            style={styles.emptyText}>
                            You're all caught up.
                            Enjoy the moment.
                        </Text>
                    </View>
                }
            />

            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Create new task"
                style={styles.fab}>
                <Text style={styles.fabText}>
                    +
                </Text>
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,

        backgroundColor:
            lightTheme.colors.background,

        paddingTop:
            Platform.OS === 'android'
                ? StatusBar.currentHeight ?? 0
                : 0,
    },
    content: {
        paddingHorizontal: spacing.xl,
        paddingBottom: 150,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        paddingTop: spacing.md,
        paddingBottom: spacing.xxl,
    },

    greeting: {
        ...typography.body,

        color:
            lightTheme.colors.textSecondary,
    },

    name: {
        ...typography.display,

        color:
            lightTheme.colors.text,

        marginTop: 2,
    },

    notificationButton: {
        width: 46,
        height: 46,

        borderRadius: 15,

        backgroundColor:
            lightTheme.colors.surface,

        borderWidth: 1,

        borderColor:
            lightTheme.colors.border,

        alignItems: 'center',
        justifyContent: 'center',
    },

notificationIcon: {
  fontSize: 19,
},

    notificationDot: {
        position: 'absolute',

        top: 10,
        right: 10,

        width: 7,
        height: 7,

        borderRadius: 4,

        backgroundColor:
            lightTheme.colors.danger,
    },

    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        marginBottom: spacing.md,
    },

    sectionTitle: {
        ...typography.title,

        color:
            lightTheme.colors.text,
    },

    seeAll: {
        ...typography.bodyMedium,

        color:
            lightTheme.colors.primary,
    },

    filters: {
        flexDirection: 'row',

        marginBottom: spacing.lg,
    },

    filter: {
        paddingHorizontal: 15,
        paddingVertical: 9,

        borderRadius: 10,

        marginRight: spacing.sm,
    },

    filterActive: {
        backgroundColor:
            lightTheme.colors.primarySoft,
    },

    filterText: {
        ...typography.caption,

        color:
            lightTheme.colors.textSecondary,
    },

    filterTextActive: {
        color:
            lightTheme.colors.primary,

        fontWeight: '700',
    },

    empty: {
        alignItems: 'center',

        paddingTop: spacing.huge,
    },

    emptyIcon: {
        width: 52,
        height: 52,

        textAlign: 'center',
        textAlignVertical: 'center',

        borderRadius: 26,

        backgroundColor:
            lightTheme.colors.successSoft,

        color:
            lightTheme.colors.success,

        fontSize: 24,
        fontWeight: '700',
    },

    emptyTitle: {
        ...typography.heading,

        color:
            lightTheme.colors.text,

        marginTop: spacing.lg,
    },

    emptyText: {
        ...typography.body,

        color:
            lightTheme.colors.textSecondary,

        textAlign: 'center',

        marginTop: spacing.xs,
    },

fab: {
  position: 'absolute',

  right: 20,
  bottom: 34,

  width: 58,
  height: 58,

  borderRadius: 18,

  backgroundColor:
    lightTheme.colors.primary,

  borderWidth: 1,
  borderColor:
    'rgba(255,255,255,0.15)',

  alignItems: 'center',
  justifyContent: 'center',

  ...shadows.floating,
},
    fabText: {
        fontSize: 30,
        lineHeight: 32,
        fontWeight: '300',

        color: '#FFFFFF',
    },
});