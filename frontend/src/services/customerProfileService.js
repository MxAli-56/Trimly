import api from './api';

const customerProfileService = {
  // Get logged-in customer's profile
  getMyProfile: async (token) => {
    const response = await api.get('/api/customer/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  },

  // Update name and phone
  updateMyProfile: async (profileData, token) => {
    const response = await api.patch(
      '/api/customer/me',
      profileData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.data;
  },

  // Upload profile photo
  uploadProfilePhoto: async (image, token) => {
    const formData = new FormData();

    formData.append('profilePhoto', {
      uri: image.uri,
      name: image.fileName || 'profile-photo.jpg',
      type: image.mimeType || 'image/jpeg',
    });

    const response = await api.patch(
      '/api/customer/me/profile/photo',
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data;
  },

  // Remove profile photo
  deleteProfilePhoto: async (token) => {
    const response = await api.delete(
      '/api/customer/me/profile/photo',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.data;
  },
};

export default customerProfileService;