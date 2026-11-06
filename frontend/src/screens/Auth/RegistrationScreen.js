
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import validateRegistration from '../../utils/validation';
import useAuthStore from '../../store/useAuthStore';
//import auth, { setConfirmation } from '../../services/firebase';
import {firebaseAuth,signInWithPhoneNumber,setConfirmation,} from '../../services/firebase';

const roles = [
  {
    label: 'Customer',
    value: 'CUSTOMER',
    icon: 'person-outline',
  },
  {
    label: 'Barber',
    value: 'BARBER',
    icon: 'content-cut',
  },
  {
    label: 'Salon Owner',
    value: 'SALON_OWNER',
    icon: 'business-outline',
  },
];

const ErrorText = ({ message }) => {
  if (!message) return null;

  return <Text style={styles.errorText}>{message}</Text>;
};

const RegistrationScreen = ({ navigation }) => {
  const { isLoading } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    cnic: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    setErrors(prev => ({
      ...prev,
      [field]: '',
    }));
  };

  const handleRoleSelect = (role) => {
    handleChange('role', role);

    if (role !== 'SALON_OWNER') {
      handleChange('cnic', '');
    }
  };

  // EXISTING REGISTRATION LOGIC
  const handleSubmit = async () => {
  const result = validateRegistration(formData);

  setErrors(result.errors);

  if (!result.isValid) return;

  try {
    // Format Pakistani phone number
    let phone = formData.phone.replace(/[\s-]/g, '');

    if (phone.startsWith('0')) {
      phone = '+92' + phone.slice(1);
    } else if (phone.startsWith('92')) {
      phone = '+' + phone;
    } else if (!phone.startsWith('+')) {
      phone = '+92' + phone;
    }

    // Prepare registration data
    const userData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone,
      password: formData.password,
      roles: [formData.role],
    };

    if (formData.role === 'SALON_OWNER') {
      userData.cnic = formData.cnic;
    }

    // Send OTP through Firebase
    //const confirmation = await auth().signInWithPhoneNumber(phone);
    console.log('Phone being sent to Firebase:', phone);
    const confirmation = await signInWithPhoneNumber( firebaseAuth,  phone );
// Store Firebase confirmation
setConfirmation(confirmation);

// Navigate to OTP verification
navigation.navigate('Verification', {
  registrationData: userData,
});

  } catch (error) {
    console.log('Firebase OTP Error:', error);

    Alert.alert(
      'OTP Error',
      error.message || 'Unable to send verification code. Please try again.'
    );
  }
};

  // REUSABLE INPUT
  const renderInput = (
    label,
    field,
    placeholder,
    icon,
    options = {}
  ) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <View style={[
        styles.inputBox,
        errors[field] && styles.inputError,
      ]}>
        <Ionicons
          name={icon}
          size={18}
          color="#A69D91"
          style={styles.inputIcon}
        />

        <TextInput
          style={styles.textInput}
          value={formData[field]}
          onChangeText={value => handleChange(field, value)}
          placeholder={placeholder}
          placeholderTextColor="#AAA49A"
          autoCapitalize={options.autoCapitalize || 'sentences'}
          keyboardType={options.keyboardType || 'default'}
          maxLength={options.maxLength}
          secureTextEntry={options.secureTextEntry || false}
        />
      </View>

      <ErrorText message={errors[field]} />
    </View>
  );

  // PASSWORD INPUT
  const renderPasswordInput = (
    label,
    field,
    visible,
    toggleVisible
  ) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <View style={[
        styles.inputBox,
        errors[field] && styles.inputError,
      ]}>
        <Ionicons
          name="lock-closed-outline"
          size={18}
          color="#A69D91"
          style={styles.inputIcon}
        />

        <TextInput
          style={styles.textInput}
          value={formData[field]}
          onChangeText={value => handleChange(field, value)}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor="#AAA49A"
          secureTextEntry={!visible}
          autoCapitalize="none"
        />

        <TouchableOpacity
          onPress={toggleVisible}
          style={styles.eyeButton}
          activeOpacity={0.7}
        >
          <Ionicons
            name={visible ? 'eye-off-outline' : 'eye-outline'}
            size={19}
            color="#81796F"
          />
        </TouchableOpacity>
      </View>

      <ErrorText message={errors[field]} />
    </View>
  );

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'bottom']}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#181614"
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >

          {/* DARK HERO SECTION */}
          <View style={styles.hero}>

            <View style={styles.orbitalRing} />
            <View style={styles.orbitalRingSecondary} />

            {/* NAVIGATION */}
            <View style={styles.topNav}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="arrow-back"
                  size={20}
                  color="#E5C583"
                />
              </TouchableOpacity>

              <View style={styles.brandRow}>
                <MaterialCommunityIcons
                  name="content-cut"
                  size={18}
                  color="#E5C583"
                />

                <Text style={styles.brandName}>Trimly</Text>

                <View style={styles.brandDot} />
              </View>

              <View style={styles.navPlaceholder} />
            </View>

            {/* HEADING */}
            <View style={styles.headingContainer}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>STEP 1 / 2</Text>
              </View>

              <Text style={styles.heading}>
                Create Your Account
              </Text>

              <Text style={styles.subheading}>
                Step 1 of 2: Your Personal Details
              </Text>
            </View>

            {/* ROLE SELECTION */}
            <Text style={styles.roleSectionLabel}>
              CHOOSE YOUR ACCOUNT TYPE
            </Text>

            <View style={styles.roleContainer}>
              {roles.map(item => {
                const isActive = formData.role === item.value;

                return (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.roleCard,
                      isActive && styles.roleCardActive,
                      errors.role && !formData.role && styles.roleCardError,
                    ]}
                    onPress={() => handleRoleSelect(item.value)}
                    activeOpacity={0.8}
                  >
                    <View style={[
                      styles.roleIconCircle,
                      isActive && styles.roleIconCircleActive,
                    ]}>
                      {item.value === 'BARBER' ? (
                        <MaterialCommunityIcons
                          name={item.icon}
                          size={17}
                          color={isActive ? '#181614' : '#E5C583'}
                        />
                      ) : (
                        <Ionicons
                          name={item.icon}
                          size={17}
                          color={isActive ? '#181614' : '#E5C583'}
                        />
                      )}
                    </View>

                    <Text style={[
                      styles.roleName,
                      isActive && styles.roleNameActive,
                    ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <ErrorText message={errors.role} />

          </View>

          {/* LIGHT FORM CARD */}
          <View style={styles.formCard}>

            {/* INFORMATION NOTICE */}
            <View style={styles.notice}>
              <Ionicons
                name="information-circle-outline"
                size={19}
                color="#AD8746"
              />

              <Text style={styles.noticeText}>
                {formData.role === 'SALON_OWNER'
                  ? 'Official salon registration requires verified ownership identity.'
                  : 'Join Trimly and discover a better grooming experience.'}
              </Text>
            </View>

            {/* NAME */}
            {renderInput(
              'FULL LEGAL NAME',
              'name',
              'Enter your full name',
              'person-outline'
            )}

            {/* EMAIL */}
            {renderInput(
              'EMAIL ADDRESS',
              'email',
              'name@example.com',
              'mail-outline',
              {
                keyboardType: 'email-address',
                autoCapitalize: 'none',
              }
            )}

            {/* PHONE */}
            <View style={styles.field}>
              <Text style={styles.label}>
                MOBILE PHONE (PAKISTAN)
              </Text>

              <View style={[
                styles.inputBox,
                errors.phone && styles.inputError,
              ]}>
                <Ionicons
                  name="call-outline"
                  size={18}
                  color="#A69D91"
                  style={styles.inputIcon}
                />

                <Text style={styles.countryCode}>+92</Text>

                <View style={styles.phoneDivider} />

                <TextInput
                  style={styles.textInput}
                  value={formData.phone}
                  onChangeText={value => handleChange('phone', value)}
                  placeholder="300 1234567"
                  placeholderTextColor="#AAA49A"
                  keyboardType="phone-pad"
                />
              </View>

              <ErrorText message={errors.phone} />
            </View>

            {/* OWNER CNIC */}
            {formData.role === 'SALON_OWNER' && (
              <View style={styles.field}>
                <Text style={styles.label}>
                  CNIC NUMBER
                </Text>

                <View style={[
                  styles.inputBox,
                  errors.cnic && styles.inputError,
                ]}>
                  <Ionicons
                    name="card-outline"
                    size={18}
                    color="#A69D91"
                    style={styles.inputIcon}
                  />

                  <TextInput
                    style={styles.textInput}
                    value={formData.cnic}
                    onChangeText={value => handleChange('cnic', value)}
                    placeholder="42201-8392019-3"
                    placeholderTextColor="#AAA49A"
                    keyboardType="numeric"
                    maxLength={15}
                  />
                </View>

                <Text style={styles.helperText}>
                  Enter your 13-digit CNIC number.
                </Text>

                <ErrorText message={errors.cnic} />
              </View>
            )}

            {/* PASSWORD */}
            {renderPasswordInput(
              'PASSWORD',
              'password',
              showPassword,
              () => setShowPassword(!showPassword)
            )}

            {/* CONFIRM PASSWORD */}
            {renderPasswordInput(
              'CONFIRM PASSWORD',
              'confirmPassword',
              showConfirmPassword,
              () => setShowConfirmPassword(!showConfirmPassword)
            )}

            {/* TERMS */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() =>
                handleChange('acceptedTerms', !formData.acceptedTerms)
              }
              activeOpacity={0.8}
            >
              <View style={[
                styles.checkbox,
                formData.acceptedTerms && styles.checkboxActive,
              ]}>
                {formData.acceptedTerms && (
                  <Ionicons
                    name="checkmark"
                    size={13}
                    color="#FFFFFF"
                  />
                )}
              </View>

              <Text style={styles.termsText}>
                I agree to Trimly's{' '}
                <Text style={styles.termsHighlight}>
                  Terms of Service
                </Text>
                {' '}and{' '}
                <Text style={styles.termsHighlight}>
                  Privacy Policy
                </Text>
              </Text>
            </TouchableOpacity>

            <ErrorText message={errors.acceptedTerms} />

            {/* SUBMIT */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                isLoading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              <Text style={styles.submitText}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Text>

              {!isLoading && (
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color="#181614"
                />
              )}
            </TouchableOpacity>

            <View style={styles.securityNotice}>
              <Ionicons
                name="shield-checkmark-outline"
                size={14}
                color="#9B8C75"
              />

              <Text style={styles.securityText}>
                Your information is protected and secure.
              </Text>
            </View>

          </View>

          {/* LOGIN LINK */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginPrompt}>
              Already have a Trimly account?{' '}
            </Text>

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
            >
              <Text style={styles.loginAction}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>

          {/* FOOTER */}
          <Text style={styles.footer}>
            TRIMLY CONCIERGE EDITION • CRAFTED FOR REFINED GROOMING
          </Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#181614',
  },

  container: {
    flex: 1,
    backgroundColor: '#F5F3ED',
  },

  scrollContent: {
    paddingBottom: 30,
  },

  // HERO
  hero: {
    backgroundColor: '#181614',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 12 : 22,
    paddingBottom: 30,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },

  orbitalRing: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1,
    borderColor: 'rgba(229,197,131,0.06)',
    top: -75,
    right: -65,
  },

  orbitalRingSecondary: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: 'rgba(229,197,131,0.04)',
    bottom: -80,
    left: -65,
  },

  // NAVIGATION
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 26,
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#29241F',
    alignItems: 'center',
    justifyContent: 'center',
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  brandName: {
    fontSize: 21,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: '#FFFFFF',
    marginLeft: 7,
    letterSpacing: 0.4,
  },

  brandDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E5C583',
    marginLeft: 5,
    marginTop: 3,
  },

  navPlaceholder: {
    width: 38,
  },

  // HEADING
  headingContainer: {
    marginBottom: 24,
  },

  stepBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#302920',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 6,
    marginBottom: 12,
  },

  stepBadgeText: {
    color: '#E5C583',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
  },

  heading: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: '#FFFFFF',
    marginBottom: 6,
  },

  subheading: {
    fontSize: 13,
    color: '#AAA39A',
    lineHeight: 20,
  },

  // ROLE SELECTION
  roleSectionLabel: {
    color: '#A9A097',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
  },

  roleContainer: {
    flexDirection: 'row',
    gap: 8,
  },

  roleCard: {
    flex: 1,
    backgroundColor: '#24201C',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#3A332B',
    paddingVertical: 13,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 88,
  },

  roleCardActive: {
    backgroundColor: '#302920',
    borderColor: '#E5C583',
  },

  roleCardError: {
    borderColor: '#D64545',
  },

  roleIconCircle: {
    width: 33,
    height: 33,
    borderRadius: 17,
    backgroundColor: '#352D25',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },

  roleIconCircleActive: {
    backgroundColor: '#E5C583',
  },

  roleName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D6D0C8',
    textAlign: 'center',
  },

  roleNameActive: {
    color: '#E5C583',
  },

  // FORM CARD
  formCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 15,
    marginTop: -9,
    borderRadius: 21,
    padding: 19,
    borderWidth: 1,
    borderColor: '#E9E5DC',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 9,
    elevation: 4,
  },

  // NOTICE
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F3EA',
    borderWidth: 1,
    borderColor: '#EDE4D3',
    borderRadius: 11,
    padding: 12,
    marginBottom: 22,
    gap: 9,
  },

  noticeText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 17,
    color: '#77664D',
  },

  // INPUTS
  field: {
    marginBottom: 17,
  },

  label: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#777067',
    letterSpacing: 0.7,
    marginBottom: 7,
  },

  inputBox: {
    height: 49,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F8F5',
    borderWidth: 1,
    borderColor: '#E5E0D5',
    borderRadius: 11,
    paddingHorizontal: 12,
  },

  inputError: {
    borderColor: '#D64545',
  },

  inputIcon: {
    marginRight: 10,
  },

  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 13.5,
    fontWeight: '500',
    color: '#211D19',
    paddingVertical: 0,
  },

  // PHONE
  countryCode: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#39332B',
    marginRight: 10,
  },

  phoneDivider: {
    width: 1,
    height: 21,
    backgroundColor: '#DDD6CA',
    marginRight: 10,
  },

  // PASSWORD
  eyeButton: {
    padding: 5,
    marginLeft: 5,
  },

  // CNIC
  helperText: {
    fontSize: 10.5,
    color: '#9A9081',
    marginTop: 6,
  },

  // TERMS
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    marginBottom: 10,
  },

  checkbox: {
    width: 19,
    height: 19,
    borderRadius: 5,
    borderWidth: 1.4,
    borderColor: '#B6AA98',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  checkboxActive: {
    backgroundColor: '#C5A059',
    borderColor: '#C5A059',
  },

  termsText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    color: '#6B6257',
  },

  termsHighlight: {
    color: '#9B783C',
    fontWeight: '700',
  },

  // SUBMIT
  submitButton: {
    backgroundColor: '#E5C583',
    minHeight: 51,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 12,
    shadowColor: '#C5A059',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },

  submitButtonDisabled: {
    opacity: 0.65,
  },

  submitText: {
    color: '#181614',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // SECURITY
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    gap: 6,
  },

  securityText: {
    fontSize: 10.5,
    color: '#9B9080',
  },

  // LOGIN
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 21,
  },

  loginPrompt: {
    fontSize: 12,
    color: '#777067',
  },

  loginAction: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9B783C',
  },

  // FOOTER
  footer: {
    textAlign: 'center',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.7,
    color: '#A69D91',
    marginTop: 17,
    paddingHorizontal: 10,
  },

  // ERRORS
  errorText: {
    color: '#D64545',
    fontSize: 11,
    marginTop: 5,
  },
});

export default RegistrationScreen;
