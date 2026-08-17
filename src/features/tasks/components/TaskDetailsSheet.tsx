import React from 'react';

import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import FontAwesome6 from
  '@react-native-vector-icons/fontawesome6/static';

import type {
  Task,
} from '../types';

import {
  useTheme,
} from '../../../app/providers/ThemeProvider';

import {
  spacing,
} from '../../../theme/spacing';

import {
  typography,
} from '../../../theme/typography';


/* ================================================= */
/* TYPES                                             */
/* ================================================= */

interface TaskDetailsSheetProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onToggle: (task: Task) => void;
  onDelete: (task: Task) => void;
}


/* ================================================= */
/* COMPONENT                                         */
/* ================================================= */

export function TaskDetailsSheet({
  visible,
  task,
  onClose,
  onEdit,
  onToggle,
  onDelete,
}: TaskDetailsSheetProps) {

  const insets =
    useSafeAreaInsets();

  const {
    theme,
  } = useTheme();

  const styles =
    createStyles(theme);


  /*
   * Keep hooks above the conditional return.
   *
   * This is important for React's Rules of Hooks.
   */
  if (!task) {
    return null;
  }


  const completed =
    task.status ===
    'completed';


  return (
    <Modal
      visible={
        visible
      }

      transparent

      animationType="slide"

      statusBarTranslucent

      onRequestClose={
        onClose
      }
    >

      <View
        style={
          styles.overlay
        }
      >

        {/* ================================================= */}
        {/* BACKDROP                                           */}
        {/* ================================================= */}

        <Pressable
          style={
            styles.backdrop
          }

          onPress={
            onClose
          }
        />


        {/* ================================================= */}
        {/* SHEET                                              */}
        {/* ================================================= */}

        <View
          style={[
            styles.sheet,

            {
              paddingBottom:
                Math.max(
                  insets.bottom,
                  12,
                ) + 12,
            },
          ]}
        >

          {/* ================================================= */}
          {/* HANDLE                                             */}
          {/* ================================================= */}

          <View
            style={
              styles.handle
            }
          />


          {/* ================================================= */}
          {/* HEADER                                             */}
          {/* ================================================= */}

          <View
            style={
              styles.header
            }
          >

            <View
              style={
                styles.headerContent
              }
            >

              <Text
                style={
                  styles.headerTitle
                }
              >
                Task details
              </Text>


              <Text
                style={
                  styles.subtitle
                }
              >
                View and manage your task
              </Text>

            </View>


            {/* ================================================= */}
            {/* CLOSE                                             */}
            {/* ================================================= */}

            <Pressable
              onPress={
                onClose
              }

              style={
                styles.closeButton
              }

              accessibilityRole="button"

              accessibilityLabel={
                'Close task details'
              }
            >

              <FontAwesome6
                name="xmark"
                size={18}
                color={
                  theme.colors
                    .textSecondary
                }
                iconStyle="solid"
              />

            </Pressable>

          </View>


          {/* ================================================= */}
          {/* TASK INFORMATION                                  */}
          {/* ================================================= */}

          <View
            style={
              styles.taskRow
            }
          >

            {/* STATUS */}

            <View
              style={[
                styles.statusCircle,

                completed &&
                  styles.statusCircleCompleted,
              ]}
            >

              {completed ? (

                <FontAwesome6
                  name="check"
                  size={15}
                  color="#FFFFFF"
                  iconStyle="solid"
                />

              ) : null}

            </View>


            {/* CONTENT */}

            <View
              style={
                styles.taskContent
              }
            >

              <Text
                style={[
                  styles.taskTitle,

                  completed &&
                    styles.completedTitle,
                ]}
              >
                {
                  task.title
                }
              </Text>


              {task.description ? (

                <Text
                  style={
                    styles.description
                  }
                >
                  {
                    task.description
                  }
                </Text>

              ) : (

                <Text
                  style={
                    styles.emptyDescription
                  }
                >
                  No description added.
                </Text>

              )}

            </View>

          </View>


          {/* ================================================= */}
          {/* METADATA                                          */}
          {/* ================================================= */}

          <View
            style={
              styles.metadataCard
            }
          >

            <MetadataItem
              label="DUE DATE"
              value={
                task.dueDate ||
                'Not set'
              }
              theme={theme}
            />


            <MetadataItem
              label="TIME"
              value={
                task.dueTime ||
                'Not set'
              }
              theme={theme}
            />


            <MetadataItem
              label="PRIORITY"
              value={
                capitalize(
                  task.priority,
                )
              }
              priority={
                task.priority
              }
              theme={theme}
            />

          </View>


          {/* ================================================= */}
          {/* ACTIONS                                           */}
          {/* ================================================= */}

          <View
            style={
              styles.actions
            }
          >

            {/* ================================================= */}
            {/* COMPLETE / INCOMPLETE                             */}
            {/* ================================================= */}

            <Pressable
              onPress={() =>
                onToggle(
                  task,
                )
              }

              style={({pressed}) => [
                styles.primaryButton,

                completed &&
                  styles.completedButton,

                pressed &&
                  styles.buttonPressed,
              ]}

              accessibilityRole="button"

              accessibilityLabel={
                completed
                  ? 'Mark task as incomplete'
                  : 'Mark task as complete'
              }
            >

              <Text
                style={[
                  styles.primaryButtonText,

                  completed &&
                    styles.completedButtonText,
                ]}
              >
                {
                  completed
                    ? 'Mark as incomplete'
                    : 'Mark as complete'
                }
              </Text>

            </Pressable>


            {/* ================================================= */}
            {/* EDIT                                               */}
            {/* ================================================= */}

            <Pressable
              onPress={() =>
                onEdit(
                  task,
                )
              }

              style={({pressed}) => [
                styles.secondaryButton,

                pressed &&
                  styles.buttonPressed,
              ]}

              accessibilityRole="button"

              accessibilityLabel="Edit task"
            >

              <Text
                style={
                  styles.secondaryButtonText
                }
              >
                Edit task
              </Text>

            </Pressable>


            {/* ================================================= */}
            {/* DELETE                                             */}
            {/* ================================================= */}

            <Pressable
              onPress={() =>
                onDelete(
                  task,
                )
              }

              style={({pressed}) => [
                styles.deleteButton,

                pressed &&
                  styles.deletePressed,
              ]}

              accessibilityRole="button"

              accessibilityLabel="Delete task"
            >

              <FontAwesome6
                name="trash"
                size={14}
                color={
                  theme.colors.danger
                }
                iconStyle="solid"
              />

              <Text
                style={
                  styles.deleteText
                }
              >
                Delete task
              </Text>

            </Pressable>

          </View>

        </View>

      </View>

    </Modal>
  );
}


/* ================================================= */
/* METADATA ITEM                                     */
/* ================================================= */

interface MetadataItemProps {
  label: string;
  value: string;
  priority?: Task['priority'];
  theme: ReturnType<typeof useTheme>['theme'];
}


function MetadataItem({
  label,
  value,
  priority,
  theme,
}: MetadataItemProps) {

  const styles =
    createStyles(theme);

  return (
    <View
      style={
        styles.metadataItem
      }
    >

      <Text
        style={
          styles.metadataLabel
        }
      >
        {
          label
        }
      </Text>


      <View
        style={
          styles.metadataValueRow
        }
      >

        {priority ? (

          <View
            style={[
              styles.priorityDot,

              {
                backgroundColor:
                  getPriorityColor(
                    theme,
                    priority,
                  ),
              },
            ]}
          />

        ) : null}


        <Text
          numberOfLines={
            1
          }

          style={
            styles.metadataValue
          }
        >
          {
            value
          }
        </Text>

      </View>

    </View>
  );
}


/* ================================================= */
/* HELPERS                                           */
/* ================================================= */

function capitalize(
  value: string,
): string {

  if (!value) {
    return '';
  }

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}


function getPriorityColor(
  theme: ReturnType<typeof useTheme>['theme'],
  priority: Task['priority'],
) {

  switch (
    priority
  ) {

    case 'high':
      return theme.colors.danger;

    case 'medium':
      return theme.colors.warning;

    case 'low':
    default:
      return theme.colors.success;
  }
}


/* ================================================= */
/* STYLES                                            */
/* ================================================= */

const createStyles = (
  theme: ReturnType<typeof useTheme>['theme'],
) =>
  StyleSheet.create({

    /* ================================================= */
    /* OVERLAY                                           */
    /* ================================================= */

    overlay: {
      flex: 1,

      justifyContent:
        'flex-end',

      /*
       * Same backdrop as Create Task.
       * Keeping the dim layer on the full modal container
       * makes the sheet clearly appear above the task list.
       */
      backgroundColor:
        theme.colors.overlay,
    },


    /* ================================================= */
    /* BACKDROP                                          */
    /* ================================================= */

    backdrop: {
      ...StyleSheet.absoluteFill,

      /*
       * The overlay supplies the dimming.
       * This view only catches outside presses.
       */
      backgroundColor:
        'transparent',
    },


    /* ================================================= */
    /* SHEET                                             */
    /* ================================================= */

    sheet: {
      width:
        '100%',

      maxHeight:
        '88%',

      backgroundColor:
        theme.colors.surface,

      borderTopLeftRadius:
        28,

      borderTopRightRadius:
        28,

      paddingTop:
        spacing.md,

      elevation:
        24,

      shadowColor:
        '#000000',

      shadowOffset: {
        width: 0,

        height: -8,
      },

      shadowOpacity:
        0.18,

      shadowRadius:
        20,
      /*
       * Keep the rounded top corners clean.
       */
      overflow: 'hidden',
    },


    /* ================================================= */
    /* HANDLE                                             */
    /* ================================================= */

    handle: {
      alignSelf:
        'center',

      width:
        42,

      height:
        4,

      borderRadius:
        2,

      backgroundColor:
        theme.colors.border,

      marginBottom:
        spacing.lg,
    },


    /* ================================================= */
    /* HEADER                                             */
    /* ================================================= */

    header: {
      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      paddingHorizontal:
        spacing.xl,

      paddingBottom:
        spacing.lg,
    },


    headerContent: {
      flex: 1,

      paddingRight:
        spacing.md,
    },


    headerTitle: {
      ...typography.title,

      color:
        theme.colors.text,
    },


    subtitle: {
      ...typography.caption,

      color:
        theme.colors.textSecondary,

      marginTop:
        spacing.xs,
    },


    closeButton: {
      width:
        40,

      height:
        40,

      borderRadius:
        20,

      backgroundColor:
        theme.colors.background,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderWidth:
        1,

      borderColor:
        theme.colors.border,
    },


    /* ================================================= */
    /* TASK                                               */
    /* ================================================= */

    taskRow: {
      flexDirection:
        'row',

      paddingHorizontal:
        spacing.xl,

      marginBottom:
        spacing.xxl,
    },


    statusCircle: {
      width:
        32,

      height:
        32,

      borderRadius:
        16,

      borderWidth:
        1.5,

      borderColor:
        theme.colors.border,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginTop:
        2,

      marginRight:
        spacing.md,
    },


    statusCircleCompleted: {
      backgroundColor:
        theme.colors.primary,

      borderColor:
        theme.colors.primary,
    },


    taskContent: {
      flex: 1,

      minWidth: 0,
    },


    taskTitle: {
      ...typography.title,

      color:
        theme.colors.text,

      lineHeight:
        25,
    },


    completedTitle: {
      textDecorationLine:
        'line-through',

      color:
        theme.colors.textMuted,
    },


    description: {
      ...typography.body,

      color:
        theme.colors.textSecondary,

      lineHeight:
        22,

      marginTop:
        spacing.sm,
    },


    emptyDescription: {
      ...typography.body,

      color:
        theme.colors.textMuted,

      fontStyle:
        'italic',

      marginTop:
        spacing.sm,
    },


    /* ================================================= */
    /* METADATA                                          */
    /* ================================================= */

    metadataCard: {
      flexDirection:
        'row',

      marginHorizontal:
        spacing.xl,

      backgroundColor:
        theme.colors.background,

      borderWidth:
        1,

      borderColor:
        theme.colors.border,

      borderRadius:
        theme.radius.lg,

      paddingHorizontal:
        spacing.md,

      paddingVertical:
        spacing.lg,

      marginBottom:
        spacing.xxl,
    },


    metadataItem: {
      flex: 1,

      minWidth:
        0,
    },


    metadataLabel: {
      ...typography.caption,

      color:
        theme.colors.textMuted,

      fontWeight:
        '700',

      letterSpacing:
        0.6,

      marginBottom:
        spacing.xs,
    },


    metadataValueRow: {
      flexDirection:
        'row',

      alignItems:
        'center',

      minWidth:
        0,
    },


    metadataValue: {
      ...typography.bodyMedium,

      color:
        theme.colors.text,

      flexShrink:
        1,
    },


    priorityDot: {
      width:
        7,

      height:
        7,

      borderRadius:
        4,

      marginRight:
        6,
    },


    /* ================================================= */
    /* ACTIONS                                           */
    /* ================================================= */

    actions: {
      paddingHorizontal:
        spacing.xl,

      gap:
        spacing.md,
    },


    primaryButton: {
      minHeight:
        54,

      borderRadius:
        theme.radius.md,

      backgroundColor:
        theme.colors.primary,

      alignItems:
        'center',

      justifyContent:
        'center',

      elevation:
        2,
    },


    primaryButtonText: {
      ...typography.button,

      color:
        '#FFFFFF',
    },


    completedButton: {
      backgroundColor:
        theme.colors.surface,

      borderWidth:
        1,

      borderColor:
        theme.colors.primary,

      elevation:
        0,
    },


    completedButtonText: {
      color:
        theme.colors.primary,
    },


    secondaryButton: {
      minHeight:
        54,

      borderRadius:
        theme.radius.md,

      backgroundColor:
        theme.colors.surface,

      borderWidth:
        1,

      borderColor:
        theme.colors.border,

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    secondaryButtonText: {
      ...typography.button,

      color:
        theme.colors.text,
    },


    deleteButton: {
      minHeight:
        46,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      gap:
        spacing.sm,

      marginTop:
        spacing.xs,
    },


    deleteText: {
      ...typography.bodyMedium,

      color:
        theme.colors.danger,

      fontWeight:
        '600',
    },


    buttonPressed: {
      opacity:
        0.82,

      transform: [
        {
          scale:
            0.99,
        },
      ],
    },


    deletePressed: {
      opacity:
        0.65,
    },

  });