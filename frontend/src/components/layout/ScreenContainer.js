import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import Colors from '../../constants/Colors';

const ScreenContainer = ({
  children,
  scrollable = true,
  backgroundColor = Colors.background,
  padding = 20,
  style,
  contentStyle,
}) => {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor }, style]}>
      {scrollable ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { padding },
            contentStyle,
          ]}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, { padding }, contentStyle]}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
  },
});

export default ScreenContainer;