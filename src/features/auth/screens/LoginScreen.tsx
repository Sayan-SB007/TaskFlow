import React, { useState } from 'react';

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth';

import { firebaseAuth } from '../../../config/firebase';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [resetLoading, setResetLoading] = useState(false);

  const [error, setError] = useState('');

  const [resetMessage, setResetMessage] = useState('');

  /* ================================================= */
  /* VALIDATION                                        */
  /* ================================================= */

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  /* ================================================= */
  /* LOGIN                                             */
  /* ================================================= */

  const handleLogin = async () => {
    setError('');
    setResetMessage('');

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(firebaseAuth, cleanEmail, password);

      /*
       * Firebase authentication state
       * will automatically update.
       *
       * RootNavigator/AuthNavigator
       * should then show the authenticated
       * application.
       */
    } catch (error: any) {
      console.log('LOGIN ERROR:', error);

      switch (error?.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          setError('Incorrect email or password.');
          break;

        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;

        case 'auth/user-disabled':
          setError('This account has been disabled.');
          break;

        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later.');
          break;

        case 'auth/network-request-failed':
          setError('Network error. Please check your internet connection.');
          break;

        case 'auth/operation-not-allowed':
          setError('Email/password authentication is not enabled.');
          break;

        default:
          setError('Unable to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================================================= */
  /* FORGOT PASSWORD                                   */
  /* ================================================= */

  const handleForgotPassword = async () => {
    setError('');
    setResetMessage('');

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError('Enter your email address first, then tap Forgot password.');
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setResetLoading(true);

      await sendPasswordResetEmail(firebaseAuth, cleanEmail);

      setResetMessage('Password reset email sent. Check your inbox.');
    } catch (error: any) {
      console.log('PASSWORD RESET ERROR:', error);

      switch (error?.code) {
        case 'auth/user-not-found':
          setError('No account was found with this email.');
          break;

        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;

        case 'auth/network-request-failed':
          setError('Network error. Please check your internet connection.');
          break;

        default:
          setError('Unable to send the reset email. Please try again.');
      }
    } finally {
      setResetLoading(false);
    }
  };

  /* ================================================= */
  /* UI                                                */
  /* ================================================= */

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === 'ios' ? 'interactive' : 'on-drag'
          }
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
        >
          {/* ================================================= */}
          {/* HERO                                               */}
          {/* ================================================= */}

          <View style={styles.hero}>
            <View style={styles.heroCircleOne} />

            <View style={styles.heroCircleTwo} />

            <View style={styles.brandRow}>
              <View style={styles.logoBox}>
                <Text style={styles.logoCheck}>✓</Text>
              </View>

              <Text style={styles.brand}>TaskFlow</Text>
            </View>

            <Text style={styles.heroTitle}>Welcome back</Text>

            <Text style={styles.heroSubtitle}>
              Sign in to continue managing your tasks and stay productive.
            </Text>
          </View>

          {/* ================================================= */}
          {/* LOGIN CARD                                          */}
          {/* ================================================= */}

          <View style={styles.card}>
            {/* EMAIL */}

            <Text style={styles.label}>Email address</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>@</Text>

              <TextInput
                style={styles.input}
                value={email}
                onChangeText={value => {
                  setEmail(value);

                  if (error) {
                    setError('');
                  }

                  if (resetMessage) {
                    setResetMessage('');
                  }
                }}
                placeholder="you@example.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                editable={!loading && !resetLoading}
                returnKeyType="next"
              />
            </View>

            {/* PASSWORD HEADER */}

            <View style={styles.labelRow}>
              <Text style={styles.label}>Password</Text>

              <Pressable
                onPress={handleForgotPassword}
                disabled={loading || resetLoading}
              >
                {resetLoading ? (
                  <ActivityIndicator size="small" color="#1769E0" />
                ) : (
                  <Text style={styles.forgotPassword}>Forgot password?</Text>
                )}
              </Pressable>
            </View>

            {/* PASSWORD */}

            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>•</Text>

              <TextInput
                style={styles.input}
                value={password}
                onChangeText={value => {
                  setPassword(value);

                  if (error) {
                    setError('');
                  }
                }}
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
                editable={!loading && !resetLoading}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />

              <Pressable
                onPress={() => setShowPassword(value => !value)}
                style={styles.showButton}
                disabled={loading || resetLoading}
              >
                <Text style={styles.showText}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </Pressable>
            </View>

            {/* RESET SUCCESS */}

            {resetMessage ? (
              <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                  <Text style={styles.successIconText}>✓</Text>
                </View>

                <Text style={styles.successText}>{resetMessage}</Text>
              </View>
            ) : null}

            {/* ERROR */}

            {error ? (
              <View style={styles.errorContainer}>
                <View style={styles.errorIcon}>
                  <Text style={styles.errorIconText}>!</Text>
                </View>

                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* SIGN IN BUTTON */}

            <Pressable
              onPress={handleLogin}
              disabled={loading || resetLoading}
              style={({ pressed }) => [
                styles.loginButton,
                pressed && styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Sign in</Text>

                  <Text style={styles.loginArrow}>→</Text>
                </>
              )}
            </Pressable>

            {/* ================================================= */}
            {/* GOOGLE - COMMENTED FOR NOW                         */}
            {/* ================================================= */}

            {/*
            <View style={styles.dividerRow}>
              <View style={styles.divider} />

              <Text style={styles.dividerText}>
                OR
              </Text>

              <View style={styles.divider} />
            </View>

            <Pressable style={styles.googleButton}>
              <Text style={styles.googleText}>
                Continue with Google
              </Text>
            </Pressable>
            */}

            {/* SIGN UP */}

            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don't have an account?</Text>

              <Pressable
                onPress={() => navigation.navigate('Signup')}
                disabled={loading || resetLoading}
              >
                <Text style={styles.signupLink}>Create account</Text>
              </Pressable>
            </View>
          </View>

          {/* FOOTER */}

          <Text style={styles.footer}>
            Your tasks are waiting. Let's get things done.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ================================================= */
/* STYLES                                            */
/* ================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },

  keyboardContainer: {
    flex: 1,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },

  /* ================= HERO ================= */

  hero: {
    minHeight: 285,
    backgroundColor: '#1769E0',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 42,
    overflow: 'hidden',
  },

  heroCircleOne: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.08)',
    right: -90,
    top: -80,
  },

  heroCircleTwo: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.06)',
    left: -70,
    bottom: -70,
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 34,
  },

  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  logoCheck: {
    color: '#1769E0',
    fontSize: 25,
    fontWeight: '800',
  },

  brand: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: -0.7,
    marginBottom: 8,
  },

  heroSubtitle: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 340,
  },

  /* ================= CARD ================= */

  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -24,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },

  /* ================= FORM ================= */

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  label: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },

  forgotPassword: {
    color: '#1769E0',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },

  inputContainer: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8DEE8',
    borderRadius: 12,
    backgroundColor: '#FAFBFD',
    marginBottom: 20,
  },

  inputIcon: {
    width: 42,
    textAlign: 'center',
    color: '#7B8798',
    fontSize: 20,
    fontWeight: '600',
  },

  input: {
    flex: 1,
    height: '100%',
    color: '#111827',
    fontSize: 15,
    paddingHorizontal: 0,
  },

  showButton: {
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },

  showText: {
    color: '#1769E0',
    fontSize: 12,
    fontWeight: '800',
  },

  /* ================= ERROR ================= */

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 11,
    marginBottom: 14,
  },

  errorIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  errorIconText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  errorText: {
    flex: 1,
    color: '#B91C1C',
    fontSize: 12,
    lineHeight: 18,
  },

  /* ================= SUCCESS ================= */

  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 10,
    padding: 11,
    marginBottom: 14,
  },

  successIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  successIconText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  successText: {
    flex: 1,
    color: '#15803D',
    fontSize: 12,
    lineHeight: 18,
  },

  /* ================= BUTTON ================= */

  loginButton: {
    height: 54,
    borderRadius: 12,
    backgroundColor: '#1769E0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,

    shadowColor: '#1769E0',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  loginArrow: {
    color: '#FFFFFF',
    fontSize: 21,
    marginLeft: 10,
  },

  buttonPressed: {
    opacity: 0.82,
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  /* ================= GOOGLE ================= */

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },

  dividerText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '700',
    marginHorizontal: 12,
  },

  googleButton: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D8DEE8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  googleText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '700',
  },

  /* ================= SIGNUP ================= */

  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },

  signupText: {
    color: '#6B7280',
    fontSize: 13,
    marginRight: 5,
  },

  signupLink: {
    color: '#1769E0',
    fontSize: 13,
    fontWeight: '800',
  },

  /* ================= FOOTER ================= */

  footer: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 17,
    marginHorizontal: 35,
    marginTop: 18,
  },
});
