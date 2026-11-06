
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/Auth/LoginScreen';
import SplashScreen from '../screens/Auth/SplashScreen';
import RegistrationScreen from '../screens/Auth/RegistrationScreen';

import CustomerTabNavigator from './CustomerTabNavigator';
import BarberProfileScreen from '../screens/Barber/BarberProfileScreen';
import OwnerProfileScreen from '../screens/Owner/OwnerProfileScreen';
import VerificationScreen from '../screens/Auth/VerificationScreen';

import useAuthStore from '../store/useAuthStore';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const {
    isAuthenticated,
    isInitializing,
    restoreSession,
    user,
  } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C18D4E" />
      </View>
    );
  }

  const roles = user?.roles || [];

  let homeScreen = 'Customer';

  if (roles.includes('SALON_OWNER')) {
    homeScreen = 'Owner';
  } else if (roles.includes('BARBER')) {
    homeScreen = 'Barber';
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        key={isAuthenticated ? 'authenticated' : 'guest'}
        initialRouteName={isAuthenticated ? homeScreen : 'Splash'}
        screenOptions={{ headerShown: false }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Registration" component={RegistrationScreen} />
            <Stack.Screen name="Verification" component={VerificationScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />

            {/* Password recovery screens will be added next */}
          </>
        ) : (
          <>
            <Stack.Screen
              name="Customer"
              component={CustomerTabNavigator}
            />

            <Stack.Screen
              name="Barber"
              component={BarberProfileScreen}
            />

            <Stack.Screen
              name="Owner"
              component={OwnerProfileScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F2ED',
  },
});

export default RootNavigator;
