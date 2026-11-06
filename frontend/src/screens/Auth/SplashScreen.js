import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Dimensions,
  Platform,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const THEME = {
  background: '#11100F',
  surface: '#1C1A18',
  cream: '#F2EDE3',
  beige: '#C8BBA8',
  muted: '#9B9082',
  border: 'rgba(200, 187, 168, 0.25)',
};

const SplashScreen = ({ navigation }) => {
  return (
    <ImageBackground
      source={require('../../assets/images/splash-bg.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar
            barStyle="light-content"
            translucent
            backgroundColor="transparent"
          />

          {/* Branding */}
          <View style={styles.logoContainer}>
            <View style={styles.crestRingOuter}>
              <View style={styles.crestRingInner}>
                <Text style={styles.logoIcon}>✂</Text>
              </View>
            </View>

            <Text style={styles.logo}>TRIMLY</Text>

            <View style={styles.taglineContainer}>
              <View style={styles.taglineLine} />
              <Text style={styles.tagline}>
                LOOK BETTER. FEEL GREATER.
              </Text>
              <View style={styles.taglineLine} />
            </View>
          </View>

          {/* Hero Content */}
          <View style={styles.hero}>
            <View style={styles.accentBadge}>
              <View style={styles.accentBadgeDot} />
              <Text style={styles.accentBadgeText}>
                HAUTE GROOMING CONCIERGE
              </Text>
            </View>

            <Text style={styles.heading}>
              Your Style.
              {'\n'}
              <Text style={styles.headingAccent}>
                Our Priority.
              </Text>
            </Text>

            <Text style={styles.description}>
              Book expert barbers, discover top salons,
              {'\n'}
              and look your best.
            </Text>
          </View>

          {/* Bottom Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Registration')}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Let's Get Started"
            >
              <Text style={styles.primaryButtonText}>
                Let's Get Started
              </Text>

              <Ionicons name="arrow-forward" size={18} color={THEME.background} />
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>
                Already have an account?
              </Text>

              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.7}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={styles.loginLink}> Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: THEME.background,
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(12, 11, 10, 0.70)',
  },

  safeArea: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 28,
  },

  /* Branding */

  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },

  crestRingOuter: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(242, 237, 227, 0.04)',
    marginBottom: 14,
  },

  crestRingInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(242, 237, 227, 0.15)',
    backgroundColor: 'rgba(28, 26, 24, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoIcon: {
    color: THEME.cream,
    fontSize: 26,
    transform: [{ rotate: '-45deg' }],
    marginTop: -2,
  },

  logo: {
    color: THEME.cream,
    fontSize: 30,
    letterSpacing: 9,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  taglineLine: {
    width: 18,
    height: 1,
    backgroundColor: 'rgba(200, 187, 168, 0.45)',
  },

  tagline: {
    color: THEME.beige,
    fontSize: 9,
    letterSpacing: 2.5,
    fontWeight: '600',
    marginHorizontal: 10,
  },

  /* Hero */

  hero: {
    marginBottom: 10,
  },

  accentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(28, 26, 24, 0.8)',
    borderWidth: 1,
    borderColor: THEME.border,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 18,
  },

  accentBadgeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: THEME.beige,
    marginRight: 8,
  },

  accentBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: THEME.beige,
    letterSpacing: 1.4,
  },

  heading: {
    color: THEME.cream,
    fontSize: 43,
    fontWeight: '700',
    lineHeight: 53,
    letterSpacing: -0.5,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  headingAccent: {
    color: THEME.beige,
    fontStyle: 'italic',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  description: {
    color: THEME.cream,
    fontSize: 15,
    lineHeight: 25,
    marginTop: 18,
    maxWidth: width * 0.85,
    opacity: 0.85,
    letterSpacing: 0.2,
  },

  /* Actions */

  actions: {
    marginBottom: 10,
  },

  primaryButton: {
    backgroundColor: THEME.cream,
    minHeight: 58,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },

  primaryButtonText: {
    color: THEME.background,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  buttonArrow: {
    color: THEME.background,
    fontSize: 20,
    fontWeight: '600',
  },

  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 23,
  },

  loginText: {
    color: THEME.muted,
    fontSize: 13,
  },

  loginLink: {
    color: THEME.cream,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default SplashScreen;
