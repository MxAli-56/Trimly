
import React from 'react';

import { View, Text, StyleSheet } from 'react-native';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import BarberProfileScreen from '../screens/Barber/BarberProfileScreen';
import BarberDashboardScreen from '../screens/Barber/BarberDashboardScreen';
import BarberAppointmentsScreen from '../screens/Barber/BarberAppointmentsScreen';
import AppointmentDetailsScreen from '../screens/Barber/AppointmentDetailsScreen';
import BarberScheduleScreen from '../screens/Barber/BarberScheduleScreen';


import UpdatePasswordScreen from '../screens/Auth/UpdatePasswordScreen';

import Colors from '../constants/Colors';
import LeaveModal from '../components/Barber/LeaveModal';

const Tab = createBottomTabNavigator();
const ProfileStack = createNativeStackNavigator();
const AppointmentStack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

// Profile Stack
const BarberProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen
        name="BarberProfile"
        component={BarberProfileScreen}
      />
      <ProfileStack.Screen
              name="EditCustomerProfile"
              component={EditCustomerProfileScreen}
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

// Bottom Tab Navigator
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
            <Ionicons
              name={iconName}
              size={size}
              color={color}
            />
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
        component={BarberScheduleScreen}
      />

      <Tab.Screen
        name="Profile"
        component={BarberProfileStackNavigator}
      />
    </Tab.Navigator>
  );
};

// Root Stack Navigator
const BarberNavigator = () => {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen
        name="BarberTabs"
        component={BarberTabNavigator}
      />

      <RootStack.Screen
        name="LeaveModal"
        component={LeaveModal}
        options={{
          presentation: 'modal',
        }}
      />
    </RootStack.Navigator>
  );
};

export default BarberNavigator;
