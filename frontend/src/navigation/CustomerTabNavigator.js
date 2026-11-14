
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import ExploreTabNavigator from './ExploreTabNavigator';
import CustomerProfileScreen from '../screens/Customer/Profile/CustomerProfileScreen';
import EditCustomerProfileScreen from '../screens/Customer/Profile/EditCustomerProfileScreen';
import BookingScreen from '../screens/Customer/Bookings/BookingScreen';
import Colors from '../constants/Colors';

const Tab = createBottomTabNavigator();
const ProfileStack = createNativeStackNavigator();

const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen
        name="CustomerProfile"
        component={CustomerProfileScreen}
      />
      <ProfileStack.Screen
        name="EditCustomerProfile"
        component={EditCustomerProfileScreen}
      />
    </ProfileStack.Navigator>
  );
};

// Temporary Inbox screen
const InboxScreen = () => null;

const CustomerTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.secondary,
        tabBarInactiveTintColor: Colors.textMuted,

        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          height: 65,
          paddingTop: 8,
          paddingBottom: 8,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },

        tabBarIcon: ({ color, size }) => {
          const icons = {
            Explore: 'compass-outline',
            Bookings: 'calendar-outline',
            Inbox: 'chatbubble-outline',
            Profile: 'person-outline',
          };

          return (
            <Ionicons
              name={icons[route.name] || 'ellipse-outline'}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Explore"
        component={ExploreTabNavigator}
      />

      <Tab.Screen
        name="Bookings"
        component={BookingScreen}
      />

      <Tab.Screen
        name="Inbox"
        component={InboxScreen}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
      />
    </Tab.Navigator>
  );
};

export default CustomerTabNavigator;
