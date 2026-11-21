
import api from './api';

const getAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const favoriteService = {
  // BARBERS

  getFavoriteBarbers: async (token) => {
    const response = await api.get(
      '/api/customer/favorites/barbers',
      getAuthConfig(token)
    );

    return response.data.data;
  },

  addFavoriteBarber: async (barberId, token) => {
    const response = await api.post(
      `/api/customer/favorites/barbers/${barberId}`,
      {},
      getAuthConfig(token)
    );

    return response.data.data;
  },

  removeFavoriteBarber: async (barberId, token) => {
    const response = await api.delete(
      `/api/customer/favorites/barbers/${barberId}`,
      getAuthConfig(token)
    );

    return response.data.data;
  },

  // SALONS

  getFavoriteSalons: async (token) => {
    const response = await api.get(
      '/api/customer/favorites/salons',
      getAuthConfig(token)
    );

    return response.data.data;
  },

  addFavoriteSalon: async (branchId, token) => {
    const response = await api.post(
      `/api/customer/favorites/salons/${branchId}`,
      {},
      getAuthConfig(token)
    );

    return response.data.data;
  },

  removeFavoriteSalon: async (branchId, token) => {
    const response = await api.delete(
      `/api/customer/favorites/salons/${branchId}`,
      getAuthConfig(token)
    );

    return response.data.data;
  },
};

export default favoriteService;
