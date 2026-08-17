import React, {
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import {signOut} from 'firebase/auth';

import {firebaseAuth} from '../../../config/firebase';

import {
  openNotificationSettings,
} from '../../notifications/notificationService';

import notifee, {
  AuthorizationStatus,
} from '@notifee/react-native';

import FontAwesome6 from '@react-native-vector-icons/fontawesome6/static';

import {
  useTheme,
} from '../../../app/providers/ThemeProvider';


export function SettingsScreen() {

  /* ================================================= */
  /* THEME                                             */
  /* ================================================= */

  const {
    theme,
    mode,
    setMode,
    isDark,
  } = useTheme();


  /* ================================================= */
  /* LOCAL STATE                                       */
  /* ================================================= */

  const [loggingOut, setLoggingOut] =
    useState(false);


  /* ================================================= */
  /* USER                                             */
  /* ================================================= */

  const user =
    firebaseAuth.currentUser;


  const displayName =
    user?.displayName?.trim() ||
    'User';


  const email =
    user?.email || '';


  /* ================================================= */
  /* INITIALS                                          */
  /* ================================================= */

  const initials = useMemo(() => {

    const parts =
      displayName
        .trim()
        .split(/\s+/)
        .filter(Boolean);


    if (parts.length === 0) {
      return 'U';
    }


    if (parts.length === 1) {
      return parts[0]
        .charAt(0)
        .toUpperCase();
    }


    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();

  }, [displayName]);


  /* ================================================= */
  /* LOGOUT                                            */
  /* ================================================= */

  const handleLogout = () => {

    if (loggingOut) {
      return;
    }


    Alert.alert(
      'Log out',
      'Are you sure you want to log out of TaskFlow?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Log out',
          style: 'destructive',
          onPress: performLogout,
        },
      ],
    );
  };


  const performLogout = async () => {

    try {

      setLoggingOut(true);

      await signOut(firebaseAuth);

      /*
       * Do not navigate manually.
       * RootNavigator handles auth state.
       */

    } catch (error) {

      console.error(
        'LOGOUT ERROR:',
        error,
      );


      Alert.alert(
        'Logout failed',
        'Unable to log out right now. Please try again.',
      );

    } finally {

      setLoggingOut(false);

    }
  };


  /* ================================================= */
  /* NOTIFICATION SETTINGS                             */
  /* ================================================= */

  const handleNotificationSettings =
    async () => {

      try {

        const settings =
          await notifee.getNotificationSettings();


        const notificationsEnabled =
          settings.authorizationStatus ===
          AuthorizationStatus.AUTHORIZED;


        Alert.alert(
          'Notifications',

          notificationsEnabled
            ? 'Task reminders are enabled.'
            : 'TaskFlow notifications are currently disabled.',

          [
            {
              text: 'Cancel',
              style: 'cancel',
            },

            {
              text: 'Open settings',

              onPress: () => {
                void openNotificationSettings();
              },
            },
          ],
        );

      } catch (error) {

        console.warn(
          'NOTIFICATION SETTINGS ERROR:',
          error,
        );


        Alert.alert(
          'Notifications',
          'Unable to read notification settings.',
        );

      }
    };


  /* ================================================= */
  /* THEME TOGGLE                                      */
  /* ================================================= */

  const toggleTheme = () => {

    setMode(
      mode === 'dark'
        ? 'light'
        : 'dark',
    );

  };


  /* ================================================= */
  /* DYNAMIC STYLES                                    */
  /* ================================================= */

  const styles =
    useMemo(
      () =>
        createStyles(
          theme,
          isDark,
        ),
      [
        theme,
        isDark,
      ],
    );


  /* ================================================= */
  /* UI                                                */
  /* ================================================= */

  return (

    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'bottom']}
    >

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* ================================================= */}
        {/* HEADER                                             */}
        {/* ================================================= */}

        <View style={styles.header}>

          <Text style={styles.title}>
            Settings
          </Text>

          <Text style={styles.subtitle}>
            Manage your account and preferences.
          </Text>

        </View>


        {/* ================================================= */}
        {/* PROFILE CARD                                       */}
        {/* ================================================= */}

        <View style={styles.profileCard}>

          <View style={styles.avatar}>

            <Text style={styles.avatarText}>
              {initials}
            </Text>

          </View>


          <View style={styles.profileInfo}>

            <Text
              style={styles.profileName}
              numberOfLines={1}
            >
              {displayName}
            </Text>


            <Text
              style={styles.profileEmail}
              numberOfLines={1}
            >
              {email}
            </Text>

          </View>

        </View>


        {/* ================================================= */}
        {/* ACCOUNT                                            */}
        {/* ================================================= */}

        <Text style={styles.sectionTitle}>
          Account
        </Text>


        <View style={styles.sectionCard}>

          {/* FULL NAME */}

          <View style={styles.settingRow}>

            <View style={styles.settingIcon}>

              <FontAwesome6
                name="user"
                size={16}
                color={theme.colors.primary}
                iconStyle="solid"
              />

            </View>


            <View style={styles.settingContent}>

              <Text style={styles.settingTitle}>
                Full name
              </Text>

              <Text style={styles.settingValue}>
                {displayName}
              </Text>

            </View>

          </View>


          <View style={styles.separator} />


          {/* EMAIL */}

          <View style={styles.settingRow}>

            <View style={styles.settingIcon}>

              <FontAwesome6
                name="at"
                size={16}
                color={theme.colors.primary}
                iconStyle="solid"
              />

            </View>


            <View style={styles.settingContent}>

              <Text style={styles.settingTitle}>
                Email
              </Text>

              <Text
                style={styles.settingValue}
                numberOfLines={1}
              >
                {email}
              </Text>

            </View>

          </View>

        </View>


        {/* ================================================= */}
        {/* PREFERENCES                                        */}
        {/* ================================================= */}

        <Text style={styles.sectionTitle}>
          Preferences
        </Text>


        <View style={styles.sectionCard}>

          {/* ================================================= */}
          {/* NOTIFICATIONS                                      */}
          {/* ================================================= */}

          <Pressable
            style={({pressed}) => [
              styles.settingRow,

              pressed &&
                styles.settingPressed,
            ]}
            onPress={() => {
              void handleNotificationSettings();
            }}
          >

            <View style={styles.settingIcon}>

              <FontAwesome6
                name="bell"
                size={16}
                color={theme.colors.primary}
                iconStyle="solid"
              />

            </View>


            <View style={styles.settingContent}>

              <Text style={styles.settingTitle}>
                Notifications
              </Text>

              <Text style={styles.settingValue}>
                Manage task reminders
              </Text>

            </View>


            <FontAwesome6
              name="chevron-right"
              size={14}
              color={theme.colors.textMuted}
              iconStyle="solid"
            />

          </Pressable>


          <View style={styles.separator} />


          {/* ================================================= */}
          {/* APPEARANCE                                        */}
          {/* ================================================= */}

          <View style={styles.settingRow}>

            <View style={styles.settingIcon}>

              <FontAwesome6
                name={
                  isDark
                    ? 'moon'
                    : 'sun'
                }
                size={17}
                color={theme.colors.primary}
                iconStyle="solid"
              />

            </View>


            <View style={styles.settingContent}>

              <Text style={styles.settingTitle}>
                Appearance
              </Text>

              <Text style={styles.settingValue}>
                {isDark
                  ? 'Dark theme'
                  : 'Light theme'}
              </Text>

            </View>


            {/* ============================================= */}
            {/* THEME TOGGLE                                    */}
            {/* ============================================= */}

            <Pressable
              accessibilityRole="switch"
              accessibilityLabel="Toggle dark mode"
              accessibilityState={{
                checked: isDark,
              }}
              onPress={toggleTheme}
              style={[
                styles.themeToggle,

                isDark &&
                  styles.themeToggleActive,
              ]}
            >

              <View
                style={[
                  styles.themeToggleThumb,

                  isDark &&
                    styles.themeToggleThumbActive,
                ]}
              >

                <FontAwesome6
                  name={
                    isDark
                      ? 'moon'
                      : 'sun'
                  }
                  size={13}
                  color={
                    isDark
                      ? theme.colors.primary
                      : '#F59E0B'
                  }
                  iconStyle="solid"
                />

              </View>

            </Pressable>

          </View>

        </View>


        {/* ================================================= */}
        {/* LOGOUT                                             */}
        {/* ================================================= */}

        <Text style={styles.sectionTitle}>
          Account actions
        </Text>


        <View style={styles.sectionCard}>

          <Pressable
            onPress={handleLogout}
            disabled={loggingOut}

            style={({pressed}) => [

              styles.logoutRow,

              pressed &&
                styles.logoutPressed,

              loggingOut &&
                styles.logoutDisabled,

            ]}
          >

            <View style={styles.logoutIcon}>

              <FontAwesome6
                name="right-from-bracket"
                size={16}
                color={theme.colors.danger}
                iconStyle="solid"
              />

            </View>


            <View style={styles.settingContent}>

              <Text style={styles.logoutTitle}>
                Log out
              </Text>

              <Text style={styles.logoutSubtitle}>
                Sign out from this device
              </Text>

            </View>


            {loggingOut ? (

              <ActivityIndicator
                size="small"
                color={theme.colors.danger}
              />

            ) : (

              <FontAwesome6
                name="chevron-right"
                size={14}
                color={theme.colors.danger}
                iconStyle="solid"
              />

            )}

          </Pressable>

        </View>


        {/* ================================================= */}
        {/* FOOTER                                             */}
        {/* ================================================= */}

        <View style={styles.footer}>

          <Text style={styles.footerLogo}>
            TaskFlow
          </Text>

          <Text style={styles.version}>
            Version 1.0.0
          </Text>

        </View>

      </ScrollView>

    </SafeAreaView>
  );
}


/* ================================================= */
/* DYNAMIC STYLES                                    */
/* ================================================= */

function createStyles(
  theme: any,
  isDark: boolean,
) {

  const colors =
    theme.colors;


  return StyleSheet.create({

    /* ================================================= */
    /* SCREEN                                            */
    /* ================================================= */

    safeArea: {
      flex: 1,

      backgroundColor:
        colors.background,
    },


    scroll: {
      flex: 1,
    },


    content: {
      paddingHorizontal: 20,

      paddingBottom: 24,
    },


    /* ================================================= */
    /* HEADER                                            */
    /* ================================================= */

    header: {
      paddingTop: 16,

      paddingBottom: 24,
    },


    title: {
      fontSize: 30,

      lineHeight: 36,

      fontWeight: '800',

      color:
        colors.text,

      letterSpacing: -0.5,
    },


    subtitle: {
      marginTop: 6,

      fontSize: 14,

      lineHeight: 21,

      color:
        colors.textSecondary,
    },


    /* ================================================= */
    /* PROFILE                                            */
    /* ================================================= */

    profileCard: {
      flexDirection: 'row',

      alignItems: 'center',

      backgroundColor:
        colors.primary,

      borderRadius: 18,

      padding: 18,

      marginBottom: 28,

      shadowColor:
        colors.primary,

      shadowOffset: {
        width: 0,
        height: 7,
      },

      shadowOpacity:
        isDark ? 0.25 : 0.18,

      shadowRadius: 14,

      elevation: 5,
    },


    avatar: {
      width: 58,

      height: 58,

      borderRadius: 29,

      backgroundColor:
        colors.surface,

      alignItems: 'center',

      justifyContent: 'center',

      marginRight: 14,
    },


    avatarText: {
      fontSize: 19,

      fontWeight: '800',

      color:
        colors.primary,
    },


    profileInfo: {
      flex: 1,
    },


    profileName: {
      fontSize: 18,

      fontWeight: '800',

      color: '#FFFFFF',

      marginBottom: 4,
    },


    profileEmail: {
      fontSize: 13,

      color:
        'rgba(255,255,255,0.82)',
    },


    /* ================================================= */
    /* SECTIONS                                           */
    /* ================================================= */

    sectionTitle: {
      fontSize: 13,

      fontWeight: '800',

      color:
        colors.textSecondary,

      marginBottom: 9,

      marginLeft: 4,

      textTransform: 'uppercase',

      letterSpacing: 0.7,
    },


    sectionCard: {
      backgroundColor:
        colors.surface,

      borderRadius: 16,

      overflow: 'hidden',

      marginBottom: 24,

      borderWidth:
        isDark ? 1 : 0,

      borderColor:
        isDark
          ? colors.border
          : 'transparent',

      shadowColor:
        '#000000',

      shadowOffset: {
        width: 0,
        height: 3,
      },

      shadowOpacity:
        isDark ? 0.18 : 0.04,

      shadowRadius: 10,

      elevation:
        isDark ? 3 : 2,
    },


    /* ================================================= */
    /* SETTING ROW                                        */
    /* ================================================= */

    settingRow: {
      minHeight: 70,

      flexDirection: 'row',

      alignItems: 'center',

      paddingHorizontal: 16,

      paddingVertical: 12,
    },


    settingPressed: {
      backgroundColor:
        colors.surfaceSecondary,
    },


    settingIcon: {
      width: 40,

      height: 40,

      borderRadius: 12,

      backgroundColor:
        colors.surfaceSecondary,

      alignItems: 'center',

      justifyContent: 'center',

      marginRight: 13,
    },


    settingContent: {
      flex: 1,
    },


    settingTitle: {
      fontSize: 14,

      fontWeight: '700',

      color:
        colors.text,

      marginBottom: 3,
    },


    settingValue: {
      fontSize: 12,

      color:
        colors.textSecondary,
    },


    separator: {
      height: 1,

      backgroundColor:
        colors.border,

      marginLeft: 69,
    },


    /* ================================================= */
    /* THEME TOGGLE                                      */
    /* ================================================= */

    themeToggle: {
      width: 58,

      height: 32,

      borderRadius: 18,

      padding: 3,

      justifyContent: 'center',

      backgroundColor:
        colors.surfaceSecondary,

      borderWidth: 1,

      borderColor:
        colors.border,
    },


    themeToggleActive: {
      backgroundColor:
        colors.primary,

      borderColor:
        colors.primary,
    },


    themeToggleThumb: {
      width: 26,

      height: 26,

      borderRadius: 13,

      backgroundColor:
        colors.surface,

      alignItems: 'center',

      justifyContent: 'center',

      elevation: 2,

      shadowColor: '#000000',

      shadowOffset: {
        width: 0,
        height: 1,
      },

      shadowOpacity: 0.15,

      shadowRadius: 2,

      transform: [
        {
          translateX: 0,
        },
      ],
    },


    themeToggleThumbActive: {
      transform: [
        {
          translateX: 26,
        },
      ],
    },


    /* ================================================= */
    /* LOGOUT                                             */
    /* ================================================= */

    logoutRow: {
      minHeight: 74,

      flexDirection: 'row',

      alignItems: 'center',

      paddingHorizontal: 16,

      paddingVertical: 12,
    },


    logoutIcon: {
      width: 40,

      height: 40,

      borderRadius: 12,

      backgroundColor:
        isDark
          ? 'rgba(248,113,113,0.14)'
          : '#FEF2F2',

      alignItems: 'center',

      justifyContent: 'center',

      marginRight: 13,
    },


    logoutTitle: {
      fontSize: 14,

      fontWeight: '800',

      color:
        colors.danger,

      marginBottom: 3,
    },


    logoutSubtitle: {
      fontSize: 12,

      /*
       * IMPORTANT:
       * Use the theme text color instead
       * of a fixed light-mode gray.
       */
      color:
        colors.textSecondary,
    },


    logoutPressed: {
      backgroundColor:
        isDark
          ? 'rgba(248,113,113,0.08)'
          : '#FFF7F7',
    },


    logoutDisabled: {
      opacity: 0.55,
    },


    /* ================================================= */
    /* FOOTER                                             */
    /* ================================================= */

    footer: {
      alignItems: 'center',

      marginTop: 12,

      marginBottom: 8,
    },


    footerLogo: {
      fontSize: 14,

      fontWeight: '800',

      color:
        colors.primary,
    },


    version: {
      marginTop: 4,

      fontSize: 11,

      color:
        colors.textTertiary,
    },

  });
}