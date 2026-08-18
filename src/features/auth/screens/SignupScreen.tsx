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

import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

import { firebaseAuth } from '../../../config/firebase';

export default function SignupScreen({ navigation }: any) {
  const [fullName, setFullName] = useState('');

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  /* ================================================= */
  /* EMAIL VALIDATION                                  */
  /* ================================================= */

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  /* ================================================= */
  /* PASSWORD RULES                                    */
  /* ================================================= */

  const passwordRules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]]/.test(password),
  };

  const passwordIsValid =
    passwordRules.length &&
    passwordRules.uppercase &&
    passwordRules.lowercase &&
    passwordRules.number &&
    passwordRules.special;

  /* ================================================= */
  /* SIGN UP                                           */
  /* ================================================= */

  const handleSignup = async () => {
    setError('');

    const cleanName = fullName.trim();

    const cleanEmail = email.trim().toLowerCase();

    /* Full name */

    if (!cleanName) {
      setError('Please enter your full name.');
      return;
    }

    if (cleanName.length < 2) {
      setError('Please enter a valid full name.');
      return;
    }

    /* Email */

    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    /* Password */

    if (!password) {
      setError('Please create a password.');
      return;
    }

    if (!passwordIsValid) {
      setError('Please meet all password requirements.');
      return;
    }

    /* Confirm password */

    if (!confirmPassword) {
      setError('Please confirm your password.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      /*
       * Create Firebase account.
       */
      const result = await createUserWithEmailAndPassword(
        firebaseAuth,
        cleanEmail,
        password,
      );

      /*
       * Store the user's real name
       * in Firebase Authentication.
       */
      await updateProfile(result.user, {
        displayName: cleanName,
      });

      /*
       * Firebase automatically keeps the
       * newly created user signed in.
       *
       * RootNavigator should react to the
       * authentication state and open
       * the authenticated application.
       */
    } catch (error: any) {
      console.log('SIGNUP ERROR:', error);

      switch (error?.code) {
        case 'auth/email-already-in-use':
          setError('An account already exists with this email.');
          break;

        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;

        case 'auth/weak-password':
          setError('Firebase rejected this password as too weak.');
          break;

        case 'auth/network-request-failed':
          setError('Network error. Please check your internet connection.');
          break;

        case 'auth/operation-not-allowed':
          setError('Email/password authentication is not enabled.');
          break;

        default:
          setError('Unable to create your account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================================================= */
  /* PASSWORD RULE COMPONENT                           */
  /* ================================================= */

  const PasswordRule = ({
    valid,
    children,
  }: {
    valid: boolean;
    children: React.ReactNode;
  }) => (
    <View style={styles.ruleRow}>
      <View style={[styles.ruleIcon, valid && styles.ruleIconValid]}>
        <Text style={[styles.ruleIconText, valid && styles.ruleIconTextValid]}>
          {valid ? '✓' : ''}
        </Text>
      </View>

      <Text style={[styles.ruleText, valid && styles.ruleTextValid]}>
        {children}
      </Text>
    </View>
  );

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

            <Pressable
              onPress={() => navigation.goBack()}
              disabled={loading}
              style={styles.backButton}
            >
              <Text style={styles.backArrow}>‹</Text>

              <Text style={styles.backText}>Back</Text>
            </Pressable>

            <View style={styles.brandRow}>
              <View style={styles.logoBox}>
                <Text style={styles.logoCheck}>✓</Text>
              </View>

              <Text style={styles.brand}>TaskFlow</Text>
            </View>

            <Text style={styles.heroTitle}>Create your account</Text>

            <Text style={styles.heroSubtitle}>
              Organize your work, manage your tasks, and stay productive.
            </Text>
          </View>

          {/* ================================================= */}
          {/* FORM CARD                                          */}
          {/* ================================================= */}

          <View style={styles.card}>
            {/* FULL NAME */}

            <Text style={styles.label}>Full name</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>◉</Text>

              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={value => {
                  setFullName(value);

                  if (error) {
                    setError('');
                  }
                }}
                placeholder="Sayan Biswas"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
                autoCorrect={false}
                autoComplete="name"
                editable={!loading}
                returnKeyType="next"
              />
            </View>

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
                }}
                placeholder="you@example.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                editable={!loading}
                returnKeyType="next"
              />
            </View>

            {/* PASSWORD */}

            <View style={styles.labelRow}>
              <Text style={styles.label}>Password</Text>

              <Text style={styles.required}>Required</Text>
            </View>

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
                placeholder="Create a strong password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                editable={!loading}
                returnKeyType="next"
              />

              <Pressable
                onPress={() => setShowPassword(value => !value)}
                style={styles.showButton}
                disabled={loading}
              >
                <Text style={styles.showText}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </Pressable>
            </View>

            {/* PASSWORD REQUIREMENTS */}

            <View style={styles.passwordRequirements}>
              <Text style={styles.requirementsTitle}>
                Password requirements
              </Text>

              <View style={styles.rulesGrid}>
                <PasswordRule valid={passwordRules.length}>
                  8+ characters
                </PasswordRule>

                <PasswordRule valid={passwordRules.uppercase}>
                  Uppercase letter
                </PasswordRule>

                <PasswordRule valid={passwordRules.lowercase}>
                  Lowercase letter
                </PasswordRule>

                <PasswordRule valid={passwordRules.number}>Number</PasswordRule>

                <PasswordRule valid={passwordRules.special}>
                  Special character
                </PasswordRule>
              </View>
            </View>

            {/* CONFIRM PASSWORD */}

            <Text style={styles.label}>Confirm password</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>•</Text>

              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={value => {
                  setConfirmPassword(value);

                  if (error) {
                    setError('');
                  }
                }}
                placeholder="Re-enter your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleSignup}
              />

              <Pressable
                onPress={() => setShowConfirmPassword(value => !value)}
                style={styles.showButton}
                disabled={loading}
              >
                <Text style={styles.showText}>
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </Text>
              </Pressable>
            </View>

            {/* PASSWORD MATCH */}

            {confirmPassword.length > 0 ? (
              <Text
                style={
                  password === confirmPassword
                    ? styles.matchSuccess
                    : styles.matchError
                }
              >
                {password === confirmPassword
                  ? '✓ Passwords match'
                  : 'Passwords do not match'}
              </Text>
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

            {/* CREATE ACCOUNT */}

            <Pressable
              onPress={handleSignup}
              disabled={loading}
              style={({ pressed }) => [
                styles.signupButton,
                pressed && styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.signupButtonText}>Create account</Text>

                  <Text style={styles.signupArrow}>→</Text>
                </>
              )}
            </Pressable>

            {/* GOOGLE - COMMENTED */}

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

            {/* LOGIN */}

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account?</Text>

              <Pressable
                onPress={() => navigation.navigate('Login')}
                disabled={loading}
              >
                <Text style={styles.loginLink}>Sign in</Text>
              </Pressable>
            </View>
          </View>

          {/* FOOTER */}

          <Text style={styles.footer}>
            By creating an account, you agree to our Terms of Service and
            Privacy Policy.
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
    paddingTop: 16,
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

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },

  backArrow: {
    color: '#FFFFFF',
    fontSize: 34,
    lineHeight: 36,
    fontWeight: '300',
    marginRight: 4,
  },

  backText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '600',
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },

  logoBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  logoCheck: {
    color: '#1769E0',
    fontSize: 24,
    fontWeight: '800',
  },

  brand: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: -0.6,
    marginBottom: 8,
  },

  heroSubtitle: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 330,
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

  required: {
    color: '#9CA3AF',
    fontSize: 11,
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
    marginBottom: 18,
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

  /* ================= PASSWORD ================= */

  passwordRequirements: {
    backgroundColor: '#F6F9FE',
    borderWidth: 1,
    borderColor: '#E2EAF8',
    borderRadius: 12,
    padding: 13,
    marginTop: -4,
    marginBottom: 20,
  },

  requirementsTitle: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 9,
  },

  rulesGrid: {
    gap: 6,
  },

  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  ruleIcon: {
    width: 17,
    height: 17,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },

  ruleIconValid: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },

  ruleIconText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  ruleIconTextValid: {
    color: '#FFFFFF',
  },

  ruleText: {
    color: '#64748B',
    fontSize: 12,
  },

  ruleTextValid: {
    color: '#15803D',
  },

  matchSuccess: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '600',
    marginTop: -6,
    marginBottom: 14,
  },

  matchError: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
    marginTop: -6,
    marginBottom: 14,
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

  /* ================= BUTTON ================= */

  signupButton: {
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

  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  signupArrow: {
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

  /* ================= LOGIN ================= */

  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },

  loginText: {
    color: '#6B7280',
    fontSize: 13,
    marginRight: 5,
  },

  loginLink: {
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
