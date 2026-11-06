
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import CustomerProfileScreen from '../screens/Customer/CustomerProfileScreen';
import EditCustomerProfileScreen from '../screens/Customer/EditCustomerProfileScreen';
import Colors from '../constants/Colors';

const Tab = createBottomTabNavigator();
const ProfileStack = createNativeStackNavigator();

// Profile stack: Profile → Edit Profile
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

// Temporary screens until we build the actual screens
const PlaceholderScreen = ({ title }) => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>{title}</Text>
  </View>
);

const ExploreScreen = () => <PlaceholderScreen title="Explore" />;
const BookingsScreen = () => <PlaceholderScreen title="My Bookings" />;
const InboxScreen = () => <PlaceholderScreen title="Inbox" />;

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
          let iconName;

          switch (route.name) {
            case 'Explore':
              iconName = 'compass-outline';
              break;
            case 'Bookings':
              iconName = 'calendar-outline';
              break;
            case 'Inbox':
              iconName = 'chatbubble-outline';
              break;
            case 'Profile':
              iconName = 'person-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Bookings" component={BookingsScreen} />
      <Tab.Screen name="Inbox" component={InboxScreen} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
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

export default CustomerTabNavigator;
