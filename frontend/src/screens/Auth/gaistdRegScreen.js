import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';

export default function RegisterScreen({ navigation, onNavigateLogin, onRegisterSuccess }) {
  const [selectedRole, setSelectedRole] = useState('CUSTOMER');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+92 ');
  const [email, setEmail] = useState('');
  const [extraField, setExtraField] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = () => {
    if (onRegisterSuccess) {
      onRegisterSuccess(selectedRole);
    } else if (navigation) {
      if (selectedRole === 'CUSTOMER') navigation.replace('CustomerProfile');
      else if (selectedRole === 'BARBER') navigation.replace('BarberProfile');
      else navigation.replace('SalonOwnerProfile');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#121110" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 40% DARK HEADER */}
          <View style={styles.heroDarkBanner}>
            <View style={styles.orbitalRing} />

            <View style={styles.topNavRow}>
              <TouchableOpacity
                onPress={() => {
                  if (onNavigateLogin) onNavigateLogin();
                  else if (navigation) navigation.goBack();
                }}
                style={styles.backButton}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={20} color="#E5C583" />
              </TouchableOpacity>
              <View style={styles.brandTitleRow}>
                <MaterialCommunityIcons name="content-cut" size={18} color="#E5C583" />
                <Text style={styles.brandTitle}>Trimly</Text>
                <View style={styles.brandDot} />
              </View>
              <View style={{ width: 36 }} />
            </View>

            <Text style={styles.mainTitle}>Create Account</Text>
            <Text style={styles.subtitle}>
              Choose your profile type and experience tailored concierge grooming
            </Text>

            {/* Role Selection Cards */}
            <View style={styles.roleSelectionRow}>
              <TouchableOpacity
                style={[
                  styles.roleCard,
                  selectedRole === 'CUSTOMER' && styles.roleCardActive,
                ]}
                onPress={() => setSelectedRole('CUSTOMER')}
                activeOpacity={0.8}
              >
                <View style={[styles.roleIconCircle, selectedRole === 'CUSTOMER' && styles.roleIconCircleActive]}>
                  <Ionicons
                    name="person"
                    size={16}
                    color={selectedRole === 'CUSTOMER' ? '#181614' : '#E5C583'}
                  />
                </View>
                <Text style={[styles.roleName, selectedRole === 'CUSTOMER' && styles.roleNameActive]}>
                  Customer
                </Text>
                <Text style={styles.roleBenefit}>Book & Rewards</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleCard,
                  selectedRole === 'BARBER' && styles.roleCardActive,
                ]}
                onPress={() => setSelectedRole('BARBER')}
                activeOpacity={0.8}
              >
                <View style={[styles.roleIconCircle, selectedRole === 'BARBER' && styles.roleIconCircleActive]}>
                  <MaterialCommunityIcons
                    name="content-cut"
                    size={16}
                    color={selectedRole === 'BARBER' ? '#181614' : '#E5C583'}
                  />
                </View>
                <Text style={[styles.roleName, selectedRole === 'BARBER' && styles.roleNameActive]}>
                  Barber
                </Text>
                <Text style={styles.roleBenefit}>Clients & Schedule</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleCard,
                  selectedRole === 'SALON_OWNER' && styles.roleCardActive,
                ]}
                onPress={() => setSelectedRole('SALON_OWNER')}
                activeOpacity={0.8}
              >
                <View style={[styles.roleIconCircle, selectedRole === 'SALON_OWNER' && styles.roleIconCircleActive]}>
                  <Ionicons
                    name="business"
                    size={16}
                    color={selectedRole === 'SALON_OWNER' ? '#181614' : '#E5C583'}
                  />
                </View>
                <Text style={[styles.roleName, selectedRole === 'SALON_OWNER' && styles.roleNameActive]}>
                  Salon Owner
                </Text>
                <Text style={styles.roleBenefit}>Store & Team</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 60% LIGHT BODY CARD */}
          <View style={styles.formContainerCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>FULL LEGAL NAME</Text>
              <View style={styles.inputBox}>
                <Ionicons name="person-outline" size={17} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="e.g. Hassan Ahmed"
                  placeholderTextColor="#9CA3AF"
                  style={styles.textInput}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>MOBILE PHONE (PAKISTAN)</Text>
              <View style={styles.inputBox}>
                <Ionicons name="call-outline" size={17} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+92 300 1234567"
                  placeholderTextColor="#9CA3AF"
                  style={styles.textInput}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <View style={styles.inputBox}>
                <Ionicons name="mail-outline" size={17} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="name@example.com"
                  placeholderTextColor="#9CA3AF"
                  style={styles.textInput}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {selectedRole === 'SALON_OWNER' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>SALON / STORE BRAND NAME</Text>
                <View style={styles.inputBox}>
                  <Ionicons name="storefront-outline" size={17} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    value={extraField}
                    onChangeText={setExtraField}
                    placeholder="e.g. The Grooming House"
                    placeholderTextColor="#9CA3AF"
                    style={styles.textInput}
                  />
                </View>
              </View>
            )}

            {selectedRole === 'BARBER' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PRIMARY SPECIALTY / CRAFT</Text>
                <View style={styles.inputBox}>
                  <MaterialCommunityIcons name="content-cut" size={17} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    value={extraField}
                    onChangeText={setExtraField}
                    placeholder="e.g. Skin Fades & Beard Sculpting"
                    placeholderTextColor="#9CA3AF"
                    style={styles.textInput}
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>SECURE PASSWORD</Text>
              <View style={styles.inputBox}>
                <Ionicons name="lock-closed-outline" size={17} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Minimum 8 characters"
                  placeholderTextColor="#9CA3AF"
                  style={styles.textInput}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.termsAgreementRow}
              onPress={() => setAgreeTerms(!agreeTerms)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, agreeTerms && styles.checkboxActive]}>
                {agreeTerms && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
              </View>
              <Text style={styles.termsText}>
                I agree to Trimly's{' '}
                <Text style={styles.termsHighlight}>Terms of Service</Text> and{' '}
                <Text style={styles.termsHighlight}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitRegisterButton}
              onPress={handleRegister}
              activeOpacity={0.85}
            >
              <Text style={styles.submitRegisterText}>
                Create {selectedRole === 'CUSTOMER' ? 'Customer' : selectedRole === 'BARBER' ? 'Barber' : 'Owner'} Account
              </Text>
              <Ionicons name="arrow-forward" size={16} color="#181614" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>

          <View style={styles.loginLinkContainer}>
            <Text style={styles.loginLinkPrompt}>Already have a Trimly account? </Text>
            <TouchableOpacity
              onPress={() => {
                if (onNavigateLogin) onNavigateLogin();
                else if (navigation) navigation.navigate('Login');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.loginLinkAction}>Sign In</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footerBrandNotice}>
            Trimly Concierge Edition • Crafted for Refined Grooming
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121110',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F5F3ED',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  heroDarkBanner: {
    backgroundColor: '#181614',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'ios' ? 14 : 24,
    paddingBottom: 26,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    position: 'relative',
    overflow: 'hidden',
  },
  orbitalRing: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1,
    borderColor: 'rgba(229, 197, 131, 0.05)',
    top: -60,
    right: -50,
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#26221E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: '#FFFFFF',
    marginLeft: 6,
    letterSpacing: 0.4,
  },
  brandDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#E5C583',
    marginLeft: 5,
    marginTop: 2,
  },
  mainTitle: {
    fontSize: 25,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12.5,
    color: '#A8A29E',
    lineHeight: 18,
    marginBottom: 18,
  },
  roleSelectionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  roleCard: {
    flex: 1,
    backgroundColor: '#221E1A',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#38322B',
  },
  roleCardActive: {
    backgroundColor: '#2D2721',
    borderColor: '#E5C583',
  },
  roleIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2C2621',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  roleIconCircleActive: {
    backgroundColor: '#E5C583',
  },
  roleName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#D6D3D1',
    marginBottom: 2,
  },
  roleNameActive: {
    color: '#E5C583',
  },
  roleBenefit: {
    fontSize: 9,
    color: '#8C857B',
    textAlign: 'center',
  },
  formContainerCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -8,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E7E4DC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F8F5',
    borderWidth: 1,
    borderColor: '#E2DDCF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  eyeButton: {
    padding: 6,
  },
  termsAgreementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  checkboxActive: {
    backgroundColor: '#C5A059',
    borderColor: '#C5A059',
  },
  termsText: {
    flex: 1,
    fontSize: 11.5,
    color: '#4B5563',
    lineHeight: 16,
  },
  termsHighlight: {
    color: '#9E7C38',
    fontWeight: '700',
  },
  submitRegisterButton: {
    backgroundColor: '#E5C583',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#C5A059',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  submitRegisterText: {
    color: '#181614',
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginLinkPrompt: {
    fontSize: 13,
    color: '#6B7280',
  },
  loginLinkAction: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9E7C38',
  },
  footerBrandNotice: {
    textAlign: 'center',
    fontSize: 10.5,
    color: '#9CA3AF',
    marginTop: 14,
  },
});