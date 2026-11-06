import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import useAuthStore from '../../store/useAuthStore';

const COLORS = {
  background: '#F5F3ED',
  dark: '#181614',
  darkSecondary: '#25211D',
  gold: '#E5C583',
  goldDark: '#B99A5B',
  white: '#FFFFFF',
  text: '#24211D',
  textSecondary: '#77716A',
  muted: '#A39D94',
  border: '#E9E5DC',
  error: '#C34F4F',
};

const LoginScreen = ({ navigation }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading } = useAuthStore();

  const handleLogin = async () => {
    setError('');

    if (!identifier.trim() || !password.trim()) {
      setError('Please enter your email/phone and password.');
      return;
    }

    const result = await login(identifier.trim(), password);

    if (!result.success) {
      setError(result.error);
      return;
    }

    // RootNavigator handles role-based navigation automatically.
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.dark}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Dark Header */}
          <View style={styles.hero}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color={COLORS.gold}
              />
            </TouchableOpacity>

            <View style={styles.brandContainer}>
              <View style={styles.logoIconContainer}>
                <MaterialCommunityIcons
                  name="content-cut"
                  size={27}
                  color={COLORS.gold}
                />
              </View>

              <Text style={styles.logo}>TRIMLY</Text>

              <Text style={styles.tagline}>
                LOOK BETTER. FEEL GREATER.
              </Text>
            </View>

            <View style={styles.headingContainer}>
              <Text style={styles.eyebrow}>WELCOME BACK</Text>

              <Text style={styles.heading}>
                Sign In to{'\n'}
                <Text style={styles.headingAccent}>Your Account.</Text>
              </Text>

              <Text style={styles.subheading}>
                Your grooming journey continues here.
              </Text>
            </View>

            {/* Decorative orbital rings */}
            <View style={styles.orbitOuter} />
            <View style={styles.orbitInner} />
          </View>

          {/* Login Form */}
          <View style={styles.formCard}>
            <View style={styles.formHeading}>
              <Text style={styles.formTitle}>Welcome Back</Text>
              <Text style={styles.formSubtitle}>
                Enter your credentials to continue.
              </Text>
            </View>

            {/* Email / Phone */}
            <View style={styles.field}>
              <Text style={styles.label}>
                EMAIL ADDRESS OR PHONE NUMBER
              </Text>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={19}
                  color={COLORS.goldDark}
                />

                <TextInput
                  style={styles.input}
                  value={identifier}
                  onChangeText={value => {
                    setIdentifier(value);
                    setError('');
                  }}
                  placeholder="Enter email or phone number"
                  placeholderTextColor={COLORS.muted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.field}>
              <Text style={styles.label}>PASSWORD</Text>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={19}
                  color={COLORS.goldDark}
                />

                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={value => {
                    setPassword(value);
                    setError('');
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor={COLORS.muted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />

                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                  style={styles.visibilityButton}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Error */}
            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons
                  name="alert-circle-outline"
                  size={17}
                  color={COLORS.error}
                />

                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotContainer}
              onPress={() => navigation.navigate('ForgotPassword')}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotText}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                isLoading && styles.disabledButton,
              ]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Text>

              {!isLoading && (
                <Ionicons
                  name="arrow-forward"
                  size={19}
                  color={COLORS.dark}
                />
              )}
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>
                Don't have an account?
              </Text>

              <TouchableOpacity
                onPress={() => navigation.navigate('Registration')}
                activeOpacity={0.7}
              >
                <Text style={styles.registerLink}> Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footerContainer}>
            <Ionicons
              name="shield-checkmark-outline"
              size={15}
              color={COLORS.muted}
            />

            <Text style={styles.footer}>
              Your grooming journey starts here.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 25,
  },

  // Header
  hero: {
    backgroundColor: COLORS.dark,
    paddingHorizontal: 25,
    paddingTop: 12,
    paddingBottom: 48,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(229,197,131,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },

  brandContainer: {
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 38,
    zIndex: 2,
  },

  logoIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: 'rgba(229,197,131,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  logo: {
    color: COLORS.white,
    fontSize: 27,
    fontWeight: '600',
    letterSpacing: 7,
  },

  tagline: {
    color: COLORS.gold,
    fontSize: 9,
    letterSpacing: 2.2,
    marginTop: 7,
  },

  headingContainer: {
    zIndex: 2,
  },

  eyebrow: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.5,
    marginBottom: 12,
  },

  heading: {
    color: COLORS.white,
    fontSize: 34,
    fontWeight: '600',
    lineHeight: 42,
    letterSpacing: -0.8,
  },

  headingAccent: {
    color: COLORS.gold,
  },

  subheading: {
    color: '#B7B0A5',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
  },

  orbitOuter: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 1,
    borderColor: 'rgba(229,197,131,0.10)',
    right: -105,
    top: 70,
  },

  orbitInner: {
    position: 'absolute',
    width: 145,
    height: 145,
    borderRadius: 73,
    borderWidth: 1,
    borderColor: 'rgba(229,197,131,0.10)',
    right: -72,
    top: 102,
  },

  // Form Card
  formCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 18,
    marginTop: -23,
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingTop: 27,
    paddingBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 15,
    elevation: 5,
  },

  formHeading: {
    marginBottom: 27,
  },

  formTitle: {
    color: COLORS.text,
    fontSize: 23,
    fontWeight: '700',
  },

  formSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 6,
  },

  field: {
    marginBottom: 22,
  },

  label: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 10,
  },

  inputContainer: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCFBF8',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 15,
  },

  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    paddingVertical: 14,
    paddingHorizontal: 11,
  },

  visibilityButton: {
    padding: 5,
  },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4F2',
    borderRadius: 9,
    padding: 11,
    marginTop: -5,
    marginBottom: 15,
    gap: 7,
  },

  errorText: {
    color: COLORS.error,
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },

  forgotContainer: {
    alignSelf: 'flex-end',
    marginTop: -5,
    marginBottom: 25,
  },

  forgotText: {
    color: COLORS.goldDark,
    fontSize: 13,
    fontWeight: '700',
  },

  loginButton: {
    minHeight: 56,
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },

  disabledButton: {
    opacity: 0.6,
  },

  loginButtonText: {
    color: COLORS.dark,
    fontSize: 15,
    fontWeight: '700',
  },

  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },

  registerText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },

  registerLink: {
    color: COLORS.goldDark,
    fontSize: 14,
    fontWeight: '700',
  },

  // Footer
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 25,
  },

  footer: {
    color: COLORS.muted,
    fontSize: 11,
  },
});

export default LoginScreen;