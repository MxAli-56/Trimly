
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';

const ProfileRow = ({
  label,
  value,
  icon,
  action,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {icon && (
        <View style={styles.iconContainer}>
          {icon}
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>

        <Text style={styles.value}>
          {value || 'Not provided'}
        </Text>
      </View>

      {action && (
        <View style={styles.action}>
          {action}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },

  iconContainer: {
    width: 36,
    alignItems: 'center',
    marginRight: 12,
  },

  content: {
    flex: 1,
  },

  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },

  value: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },

  action: {
    marginLeft: 10,
  },
});

export default ProfileRow;
