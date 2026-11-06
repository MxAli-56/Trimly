
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';

const Section = ({
  title,
  description,
  action,
  children,
  style,
  contentStyle,
}) => {
  return (
    <View style={[styles.container, style]}>
      {(title || description || action) && (
        <View style={styles.header}>
          <View style={styles.headingContainer}>
            {title && (
              <Text style={styles.title}>{title}</Text>
            )}

            {description && (
              <Text style={styles.description}>
                {description}
              </Text>
            )}
          </View>

          {action && (
            <View>{action}</View>
          )}
        </View>
      )}

      <View style={contentStyle}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  headingContainer: {
    flex: 1,
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },

  description: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});

export default Section;
