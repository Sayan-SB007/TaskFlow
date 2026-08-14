import React, { useMemo, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { signOut } from 'firebase/auth';

import { firebaseAuth } from '../../../config/firebase';

export function SettingsScreen() {
  const [loggingOut, setLoggingOut] = useState(false);

  const user = firebaseAuth.currentUser;

  const displayName =
    user?.displayName?.trim() ||
    'User';

  const email =
    user?.email || '';

  /* ================================================= */
  /* INITIALS                                          */
  /* ================================================= */

  const initials = useMemo(() => {
    const parts = displayName
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
       * DO NOT navigate manually.
       *
       * Firebase auth state becomes null.
       * RootNavigator should detect that and
       * automatically show LoginScreen.
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

          <View>
            <Text style={styles.title}>
              Settings
            </Text>

            <Text style={styles.subtitle}>
              Manage your account and preferences.
            </Text>
          </View>

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

          <View style={styles.settingRow}>

            <View style={styles.settingIcon}>
              <Text style={styles.settingIconText}>
                👤
              </Text>
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

          <View style={styles.settingRow}>

            <View style={styles.settingIcon}>
              <Text style={styles.settingIconText}>
                @
              </Text>
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

          {/* ================= NOTIFICATIONS ================= */}

          <Pressable
            style={({ pressed }) => [
              styles.settingRow,
              pressed && styles.settingPressed,
            ]}
            onPress={() => {
              Alert.alert(
                'Notifications',
                'Notification settings will be available soon.',
              );
            }}
          >

            <View style={styles.settingIcon}>
              <Text style={styles.settingIconText}>
                🔔
              </Text>
            </View>

            <View style={styles.settingContent}>

              <Text style={styles.settingTitle}>
                Notifications
              </Text>

              <Text style={styles.settingValue}>
                Manage task reminders
              </Text>

            </View>

            <Text style={styles.chevron}>
              ›
            </Text>

          </Pressable>

          <View style={styles.separator} />

          {/* ================= APPEARANCE ================= */}

          <Pressable
            style={({ pressed }) => [
              styles.settingRow,
              pressed && styles.settingPressed,
            ]}
            onPress={() => {
              Alert.alert(
                'Appearance',
                'Theme settings will be available soon.',
              );
            }}
          >

            <View style={styles.settingIcon}>
              <Text style={styles.settingIconText}>
                ◐
              </Text>
            </View>

            <View style={styles.settingContent}>

              <Text style={styles.settingTitle}>
                Appearance
              </Text>

              <Text style={styles.settingValue}>
                Light theme
              </Text>

            </View>

            <Text style={styles.chevron}>
              ›
            </Text>

          </Pressable>

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
            style={({ pressed }) => [
              styles.logoutRow,

              pressed &&
              styles.logoutPressed,

              loggingOut &&
              styles.logoutDisabled,
            ]}
          >

            <View style={styles.logoutIcon}>

              <Text style={styles.logoutIconText}>
                ↪
              </Text>

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
                color="#DC2626"
              />
            ) : (
              <Text style={styles.logoutChevron}>
                ›
              </Text>
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
/* STYLES                                            */
/* ================================================= */

const styles = StyleSheet.create({

  /* ================================================= */
  /* SCREEN                                            */
  /* ================================================= */

  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,

    /*
     * Small bottom spacing only.
     *
     * Do NOT use useBottomTabBarHeight() here.
     * The tab navigator already owns the bottom
     * tab-bar area.
     */
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
    color: '#111827',
    letterSpacing: -0.5,
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 21,
    color: '#6B7280',
  },

  /* ================================================= */
  /* PROFILE                                            */
  /* ================================================= */

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#1769E0',

    borderRadius: 18,

    padding: 18,

    marginBottom: 28,

    shadowColor: '#1769E0',

    shadowOffset: {
      width: 0,
      height: 7,
    },

    shadowOpacity: 0.18,

    shadowRadius: 14,

    elevation: 5,
  },

  avatar: {
    width: 58,
    height: 58,

    borderRadius: 29,

    backgroundColor: '#FFFFFF',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 14,
  },

  avatarText: {
    fontSize: 19,

    fontWeight: '800',

    color: '#1769E0',
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

    color: 'rgba(255,255,255,0.78)',
  },

  /* ================================================= */
  /* SECTIONS                                           */
  /* ================================================= */

  sectionTitle: {
    fontSize: 13,

    fontWeight: '800',

    color: '#6B7280',

    marginBottom: 9,

    marginLeft: 4,

    textTransform: 'uppercase',

    letterSpacing: 0.7,
  },

  sectionCard: {
    backgroundColor: '#FFFFFF',

    borderRadius: 16,

    overflow: 'hidden',

    marginBottom: 24,

    shadowColor: '#000000',

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.04,

    shadowRadius: 10,

    elevation: 2,
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
    backgroundColor: '#F8FAFC',
  },

  settingIcon: {
    width: 40,
    height: 40,

    borderRadius: 12,

    backgroundColor: '#F1F5F9',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 13,
  },

  settingIconText: {
    fontSize: 17,
  },

  settingContent: {
    flex: 1,
  },

  settingTitle: {
    fontSize: 14,

    fontWeight: '700',

    color: '#1F2937',

    marginBottom: 3,
  },

  settingValue: {
    fontSize: 12,

    color: '#6B7280',
  },

  separator: {
    height: 1,

    backgroundColor: '#EEF1F5',

    marginLeft: 69,
  },

  chevron: {
    fontSize: 25,

    lineHeight: 27,

    color: '#9CA3AF',

    marginLeft: 10,
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

    backgroundColor: '#FEF2F2',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 13,
  },

  logoutIconText: {
    fontSize: 19,

    color: '#DC2626',

    fontWeight: '700',
  },

  logoutTitle: {
    fontSize: 14,

    fontWeight: '800',

    color: '#DC2626',

    marginBottom: 3,
  },

  logoutSubtitle: {
    fontSize: 12,

    color: '#9CA3AF',
  },

  logoutChevron: {
    fontSize: 25,

    lineHeight: 27,

    color: '#DC2626',
  },

  logoutPressed: {
    backgroundColor: '#FFF7F7',
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

    color: '#1769E0',
  },

  version: {
    marginTop: 4,

    fontSize: 11,

    color: '#9CA3AF',
  },

});