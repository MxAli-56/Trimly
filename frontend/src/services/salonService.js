import api from './api';

const salonService = {
  // GET ALL SALONS 
  getAllSalons: async () => {
    const response = await api.get('/customer/salons');
    return response.data.data;
  },

  // GET NEARBY SALONS
  getNearbySalons: async (latitude, longitude, radius = 5) => {
    const response = await api.get('/customer/salons/nearby', {
      params: { latitude, longitude, radius },
    });
    return response.data.data;
  },

  // FILTER SALONS BY AREA
  getSalonsByArea: async (area) => {
    const response = await api.get('/customer/salons/filter/area', {
      params: { area },
    });
    return response.data.data;
  },

  // GET SALON BY ID
  getSalonById: async (id) => {
    const response = await api.get(`/customer/salons/${id}`);
    return response.data.data;
  },
};

export default salonService;