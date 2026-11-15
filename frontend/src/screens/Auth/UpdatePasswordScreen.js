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
  success: '#4D8A62',
};

const UpdatePasswordScreen = ({ navigation }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { updatePassword, isLoading } = useAuthStore();

  const handleUpdatePassword = async () => {
    setError('');
    setSuccess('');

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const result = await updatePassword(newPassword);

    if (!result.success) {
      setError(result.error || 'Failed to update password.');
      return;
    }

    setSuccess(result.message || 'Password updated successfully.');

    setNewPassword('');
    setConfirmPassword('');
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
              <Text style={styles.eyebrow}>ACCOUNT SECURITY</Text>

              <Text style={styles.heading}>
                Secure Your{'\n'}
                <Text style={styles.headingAccent}>Account.</Text>
              </Text>

              <Text style={styles.subheading}>
                Create a new password to keep your account secure.
              </Text>
            </View>

            <View style={styles.orbitOuter} />
            <View style={styles.orbitInner} />
          </View>

          <View style={styles.formCard}>
            <View style={styles.formHeading}>
              <Text style={styles.formTitle}>Update Password</Text>

              <Text style={styles.formSubtitle}>
                Enter your new password below.
              </Text>
            </View>

            {/* New Password */}
            <View style={styles.field}>
              <Text style={styles.label}>NEW PASSWORD</Text>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={19}
                  color={COLORS.goldDark}
                />

                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={value => {
                    setNewPassword(value);
                    setError('');
                    setSuccess('');
                  }}
                  placeholder="Enter new password"
                  placeholderTextColor={COLORS.muted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.visibilityButton}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.field}>
              <Text style={styles.label}>CONFIRM NEW PASSWORD</Text>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={19}
                  color={COLORS.goldDark}
                />

                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={value => {
                    setConfirmPassword(value);
                    setError('');
                    setSuccess('');
                  }}
                  placeholder="Confirm new password"
                  placeholderTextColor={COLORS.muted}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <TouchableOpacity
                  onPress={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  style={styles.visibilityButton}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={
                      showConfirmPassword
                        ? 'eye-off-outline'
                        : 'eye-outline'
                    }
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Password Hint */}
            <View style={styles.hintContainer}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={COLORS.goldDark}
              />

              <Text style={styles.hintText}>
                Use at least 8 characters for your password.
              </Text>
            </View>

            {/* Error Message */}
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

            {/* Success Message */}
            {success ? (
              <View style={styles.successContainer}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={17}
                  color={COLORS.success}
                />

                <Text style={styles.successText}>{success}</Text>
              </View>
            ) : null}

            {/* Update Button */}
            <TouchableOpacity
              style={[
                styles.updateButton,
                isLoading && styles.disabledButton,
              ]}
              onPress={handleUpdatePassword}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              <Text style={styles.updateButtonText}>
                {isLoading ? 'Updating...' : 'Update Password'}
              </Text>

              {!isLoading && (
                <Ionicons
                  name="arrow-forward"
                  size={19}
                  color={COLORS.dark}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerContainer}>
            <Ionicons
              name="shield-checkmark-outline"
              size={15}
              color={COLORS.muted}
            />

            <Text style={styles.footer}>
              Your security is our priority.
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

  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: -5,
    marginBottom: 20,
  },

  hintText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    flex: 1,
  },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4F2',
    borderRadius: 9,
    padding: 11,
    marginBottom: 15,
    gap: 7,
  },

  errorText: {
    color: COLORS.error,
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },

  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8F1',
    borderRadius: 9,
    padding: 11,
    marginBottom: 15,
    gap: 7,
  },

  successText: {
    color: COLORS.success,
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },

  updateButton: {
    minHeight: 56,
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 5,
  },

  disabledButton: {
    opacity: 0.6,
  },

  updateButtonText: {
    color: COLORS.dark,
    fontSize: 15,
    fontWeight: '700',
  },

  cancelButton: {
    alignItems: 'center',
    marginTop: 22,
  },

  cancelText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },

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

export default UpdatePasswordScreen;
