import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';

const Badge = ({
  label,
  backgroundColor = Colors.surfaceSecondary,
  textColor = Colors.text,
  style,
  textStyle,
}) => {
  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      <Text style={[styles.text, { color: textColor }, textStyle]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default Badge;