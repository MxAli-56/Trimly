
import api from './api';

const salonService = {
  getNearbySalons: async ({ latitude, longitude, radius = 5 }) => {
    const response = await api.get('/api/customer/salons/nearby', {
      params: { latitude, longitude, radius },
    });

    return response.data.data;
  },

  getSalonsByArea: async (area, token) => {
    const response = await api.get('/api/customer/salons/filter/area', {
      params: { area },
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.data;
  },

  searchSalons: async (searchText, token) => {
    const response = await api.get('/api/customer/salons/search', {
      params: { q: searchText },
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.data;
  },

  getSalonDetails: async (branchId, token) => {
    const response = await api.get(
      `/api/customer/salons/${branchId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data.data;
  },

  getSalonServices: async (branchId, token) => {
    const response = await api.get(
      `/api/customer/salons/${branchId}/services`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data.data;
  },
};

export default salonService;
