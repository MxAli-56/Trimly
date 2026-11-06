import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import useAuthStore from '../../store/useAuthStore';
import { getConfirmation,clearConfirmation,} from '../../services/firebase'; 

const VerificationScreen = ({ route, navigation }) => {
const { registrationData } = route.params;
const confirmation = getConfirmation();

  const { registerWithOtp, isLoading } = useAuthStore();

  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit verification code.');
      return;
    }

    try {
      setIsVerifying(true);

      // Verify OTP with Firebase
      const credential = await confirmation.confirm(otp);

      // Get Firebase ID token
      const idToken = await credential.user.getIdToken();

      // Register user through backend
      const response = await registerWithOtp(idToken, registrationData);

      if (response.success) {
  clearConfirmation();

  Alert.alert(
    'Registration Successful',
    'Your account has been created successfully.'
  );
}else {
        Alert.alert('Registration Failed', response.error);
      }

    } catch (error) {
      console.log('OTP Verification Error:', error);

      Alert.alert(
        'Verification Failed',
        error.message || 'Invalid or expired verification code.'
      );
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verify Your Number</Text>

        <Text style={styles.subtitle}>
          Enter the 6-digit verification code sent to
          {'\n'}
          {registrationData.phone}
        </Text>

        <TextInput
          style={styles.otpInput}
          placeholder="000000"
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={setOtp}
          textAlign="center"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleVerify}
          disabled={isVerifying || isLoading}
        >
          {isVerifying || isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Verify & Register</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back to Registration</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F2ED',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#222222',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: 35,
  },
  otpInput: {
    height: 60,
    borderWidth: 1,
    borderColor: '#D8D0C5',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    fontSize: 24,
    letterSpacing: 10,
    marginBottom: 25,
  },
  button: {
    height: 55,
    backgroundColor: '#C18D4E',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backText: {
    textAlign: 'center',
    color: '#777777',
    marginTop: 25,
    fontSize: 14,
  },
});

export default VerificationScreen;