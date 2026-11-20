
import api from './api';

const extractSalons = (response) => {
  const payload = response?.data?.data;

  if (Array.isArray(payload)) return payload;

  if (Array.isArray(payload?.salons)) return payload.salons;
  if (Array.isArray(payload?.branches)) return payload.branches;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.items)) return payload.items;

  return [];
};

const salonService = {
  getSalons: async (token) => {
    const response = await api.get('/api/customer/salons', {
      headers: { Authorization: `Bearer ${token}` },
    });

    return extractSalons(response);
  },

  getNearbySalons: async ({ latitude, longitude, radius = 5 }, token) => {
    const response = await api.get('/api/customer/salons/nearby', {
      params: { latitude, longitude, radius },
      headers: { Authorization: `Bearer ${token}` },
    });

    return extractSalons(response);
  },

  getSalonsByArea: async (area, token) => {
    const response = await api.get('/api/customer/salons/filter/area', {
      params: { area },
      headers: { Authorization: `Bearer ${token}` },
    });

    return extractSalons(response);
  },

  searchSalons: async (searchText, token) => {
    const response = await api.get('/api/customer/salons/search', {
      params: { q: searchText },
      headers: { Authorization: `Bearer ${token}` },
    });

    return extractSalons(response);
  },

  getSalonDetails: async (branchId, token) => {
    const response = await api.get(`/api/customer/salons/${branchId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

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

  getSalonBarbers: async (branchId, token) => {
    const response = await api.get(
      `/api/customer/salons/${branchId}/barbers`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data.data;
  },
};

export default salonService;
