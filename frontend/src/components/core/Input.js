import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  editable = true,
  error,
  style,
  inputStyle,
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        editable={editable}
        style={[
          styles.input,
          multiline && styles.multiline,
          error && styles.errorInput,
          inputStyle,
        ]}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  label: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },

  input: {
    minHeight: 48,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: Colors.text,
  },

  multiline: {
    minHeight: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },

  errorInput: {
    borderColor: Colors.error,
  },

  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 5,
  },
});

export default Input;