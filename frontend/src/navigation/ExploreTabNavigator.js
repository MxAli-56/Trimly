
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ExploreScreen from '../screens/Customer/Explore/ExploreScreen';
import SearchScreen from '../screens/Customer/Explore/SearchScreen';
import SalonDetailsScreen from '../screens/Customer/Explore/SalonDetailsScreen';
import BookingDetailsScreen from '../screens/Customer/Explore/BookingDetailsScreen';
import BookingReviewScreen from '../screens/Customer/Explore/BookingReviewScreen';
const Stack = createNativeStackNavigator();

const ExploreStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="ExploreHome"
        component={ExploreScreen}
      />

      <Stack.Screen
        name="Search"
        component={SearchScreen}
      />

      <Stack.Screen
        name="SalonDetails"
        component={SalonDetailsScreen}
      />
      <Stack.Screen
  name="BookingDetails"
  component={BookingDetailsScreen}
/>
<Stack.Screen
  name="BookingReview"
  component={BookingReviewScreen}
/>
    </Stack.Navigator>
  );
};

export default ExploreStackNavigator;
