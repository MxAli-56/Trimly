import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';

const Avatar = ({
  image,
  name,
  size = 50,
  backgroundColor = Colors.surfaceSecondary,
  textColor = Colors.primary,
  style,
}) => {
  const initials = name
    ? name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : '?';

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
        style,
      ]}
    >
      {image ? (
        <Image
          source={typeof image === 'string' ? { uri: image } : image}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
        />
      ) : (
        <Text style={[styles.initials, { color: textColor, fontSize: size * 0.35 }]}>
          {initials}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  initials: {
    fontWeight: '600',
  },
});

export default Avatar;