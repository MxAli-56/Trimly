import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  textStyle,
}) => {
  const buttonStyles = {
    primary: {
      backgroundColor: Colors.primary,
      borderColor: Colors.primary,
    },
    secondary: {
      backgroundColor: Colors.secondary,
      borderColor: Colors.secondary,
    },
    outline: {
      backgroundColor: Colors.transparent,
      borderColor: Colors.border,
      borderWidth: 1,
    },
  };

  const textColors = {
    primary: Colors.textLight,
    secondary: Colors.white,
    outline: Colors.text,
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        buttonStyles[variant] || buttonStyles.primary,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: textColors[variant] || Colors.textLight },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  text: {
    fontSize: 14,
    fontWeight: '600',
  },

  disabled: {
    opacity: 0.5,
  },

  pressed: {
    opacity: 0.8,
  },
});

export default Button;