
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import BarberProfileScreen from '../screens/Barber/BarberProfileScreen';
import BarberDashboardScreen from '../screens/Barber/BarberDashboardScreen';
import BarberAppointmentsScreen from '../screens/Barber/BarberAppointmentsScreen';
import AppointmentDetailsScreen from '../screens/Barber/AppointmentDetailsScreen';
import UpdatePasswordScreen from '../screens/Auth/UpdatePasswordScreen';

import Colors from '../constants/Colors';

const Tab = createBottomTabNavigator();
const ProfileStack = createNativeStackNavigator();
const AppointmentStack = createNativeStackNavigator();

// Profile Stack
const BarberProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen
        name="BarberProfile"
        component={BarberProfileScreen}
      />

      <ProfileStack.Screen
        name="UpdatePassword"
        component={UpdatePasswordScreen}
      />
    </ProfileStack.Navigator>
  );
};

// Appointments Stack
const BarberAppointmentsStackNavigator = () => {
  return (
    <AppointmentStack.Navigator screenOptions={{ headerShown: false }}>
      <AppointmentStack.Screen
        name="BarberAppointments"
        component={BarberAppointmentsScreen}
      />

      <AppointmentStack.Screen
        name="AppointmentDetails"
        component={AppointmentDetailsScreen}
      />
    </AppointmentStack.Navigator>
  );
};

// Placeholder screens
const PlaceholderScreen = ({ title }) => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>{title}</Text>
  </View>
);

const ScheduleScreen = () => <PlaceholderScreen title="My Schedule" />;

const BarberTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textMuted,

        tabBarStyle: {
          backgroundColor: Colors.primary,
          borderTopColor: Colors.borderDark,
          height: 65,
          paddingTop: 8,
          paddingBottom: 8,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },

        tabBarIcon: ({ color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'grid-outline';
              break;
            case 'Appointments':
              iconName = 'calendar-outline';
              break;
            case 'Schedule':
              iconName = 'time-outline';
              break;
            case 'Profile':
              iconName = 'person-outline';
              break;
            default:
              iconName = 'ellipse-outline';
          }

          return (
            <Ionicons name={iconName} size={size} color={color} />
          );
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={BarberDashboardScreen}
      />

      <Tab.Screen
        name="Appointments"
        component={BarberAppointmentsStackNavigator}
      />

      <Tab.Screen
        name="Schedule"
        component={ScheduleScreen}
      />

      <Tab.Screen
        name="Profile"
        component={BarberProfileStackNavigator}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },

  placeholderText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
});

export default BarberTabNavigator;
