
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';

const Card = ({
  children,
  backgroundColor = Colors.surface,
  padding = 16,
  borderRadius = 12,
  borderColor,
  borderWidth = 0,
  style,
}) => {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor,
          padding,
          borderRadius,
          borderColor,
          borderWidth,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
});

export default Card;
