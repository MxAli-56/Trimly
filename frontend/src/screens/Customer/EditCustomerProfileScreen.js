
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import useAuthStore from '../../store/useAuthStore';
import customerProfileService from '../../services/customerProfileService';
import Colors from '../../constants/Colors';

const EditCustomerProfileScreen = ({ navigation }) => {
  const { user, token, updateUser } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const [loading, setLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);

  const initials = (user?.name || 'U')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const handleChangePhoto = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow gallery access to select a profile photo.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const selectedImage = result.assets[0];

      setPhotoLoading(true);

      const updatedProfile =
        await customerProfileService.uploadProfilePhoto(
          selectedImage,
          token
        );

      updateUser(updatedProfile);

      Alert.alert('Success', 'Your profile photo has been updated.');
    } catch (error) {
      Alert.alert(
        'Upload Failed',
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          'Unable to upload your profile photo.'
      );
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleRemovePhoto = () => {
    Alert.alert(
      'Remove Profile Photo',
      'Are you sure you want to remove your profile photo?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: removePhoto,
        },
      ]
    );
  };

  const removePhoto = async () => {
    try {
      setPhotoLoading(true);

      const updatedProfile =
        await customerProfileService.deleteProfilePhoto(token);

      updateUser(updatedProfile);

      Alert.alert('Success', 'Your profile photo has been removed.');
    } catch (error) {
      Alert.alert(
        'Removal Failed',
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          'Unable to remove your profile photo.'
      );
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert(
        'Invalid Details',
        'Name and phone are required.'
      );
      return;
    }

    if (
      name.trim() === user?.name &&
      phone.trim() === user?.phone
    ) {
      navigation.goBack();
      return;
    }

    try {
      setLoading(true);

      const updatedProfile =
        await customerProfileService.updateMyProfile(
          {
            name: name.trim(),
            phone: phone.trim(),
          },
          token
        );

      updateUser(updatedProfile);

      Alert.alert('Success', 'Your profile has been updated.');
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Update Failed',
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          'Unable to update your profile.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.background}
      />

      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons
            name="arrow-back"
            size={23}
            color={Colors.primary}
          />
        </Pressable>

        <Text style={styles.headerTitle}>Edit Profile</Text>

        <View style={{ width: 23 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.heading}>Personal Information</Text>

        <Text style={styles.description}>
          Keep your contact details up to date.
        </Text>

        {/* Profile Photo */}
        <View style={styles.photoSection}>
          <View style={styles.avatar}>
            {user?.profilePhoto ? (
              <Image
                source={{ uri: user.profilePhoto }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarInitials}>
                {initials}
              </Text>
            )}

            {photoLoading && (
              <View style={styles.photoLoadingOverlay}>
                <ActivityIndicator color={Colors.white} />
              </View>
            )}
          </View>

          <View style={styles.photoActions}>
            <Pressable
              style={styles.changePhotoButton}
              onPress={handleChangePhoto}
              disabled={photoLoading}
            >
              <Ionicons
                name="camera-outline"
                size={17}
                color={Colors.white}
              />
              <Text style={styles.changePhotoText}>
                Change Photo
              </Text>
            </Pressable>

            {user?.profilePhoto && (
              <Pressable
                style={styles.removePhotoButton}
                onPress={handleRemovePhoto}
                disabled={photoLoading}
              >
                <Text style={styles.removePhotoText}>
                  Remove Photo
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        <Text style={styles.label}>FULL NAME</Text>

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your full name"
          placeholderTextColor={Colors.textMuted}
          autoCapitalize="words"
        />

        <Text style={styles.label}>PHONE NUMBER</Text>

        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter your phone number"
          placeholderTextColor={Colors.textMuted}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>EMAIL ADDRESS</Text>

        <View style={[styles.input, styles.readOnlyInput]}>
          <Text style={styles.emailText}>
            {user?.email || 'Email unavailable'}
          </Text>

          <Ionicons
            name="lock-closed-outline"
            size={16}
            color={Colors.textMuted}
          />
        </View>

        <Text style={styles.emailNote}>
          Email address cannot be changed here.
        </Text>

        <Pressable
          style={[
            styles.saveButton,
            loading && styles.disabledButton,
          ]}
          onPress={handleSave}
          disabled={loading || photoLoading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>
              Save Changes
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    height: 58,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },

  content: {
    padding: 20,
  },

  heading: {
    fontSize: 23,
    fontWeight: '700',
    fontFamily: 'serif',
    color: Colors.primary,
  },

  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 6,
    marginBottom: 20,
  },

  photoSection: {
    alignItems: 'center',
    marginBottom: 12,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  avatarImage: {
    width: '100%',
    height: '100%',
  },

  avatarInitials: {
    fontSize: 30,
    fontWeight: '700',
    color: Colors.primary,
  },

  photoLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  photoActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 12,
  },

  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: Colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 9,
  },

  changePhotoText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },

  removePhotoButton: {
    paddingVertical: 9,
  },

  removePhotoText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.textSecondary,
    marginBottom: 9,
    marginTop: 18,
  },

  input: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    fontSize: 14,
    color: Colors.primary,
  },

  readOnlyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  emailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  emailNote: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 7,
  },

  saveButton: {
    height: 53,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 35,
  },

  disabledButton: {
    opacity: 0.65,
  },

  saveButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default EditCustomerProfileScreen;
