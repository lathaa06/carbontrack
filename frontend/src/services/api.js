import api from '../api/axiosInstance';

export const authService = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  register: async (data) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  },
};

export const dashboardService = {
  getDashboard: async () => {
    const res = await api.get('/analytics/dashboard');
    return res.data;
  },
};

export const activityService = {
  logActivity: async (data) => {
    const res = await api.post('/activities', data);
    return res.data;
  },
  getActivities: async (page = 0, size = 20) => {
    const res = await api.get('/activities', { params: { page, size } });
    return res.data;
  },
  getActivity: async (id) => {
    const res = await api.get(`/activities/${id}`);
    return res.data;
  },
  deleteActivity: async (id) => {
    const res = await api.delete(`/activities/${id}`);
    return res.data;
  },
};

export const goalService = {
  createGoal: async (data) => {
    const res = await api.post('/goals', data);
    return res.data;
  },
  getGoals: async () => {
    const res = await api.get('/goals');
    return res.data;
  },
  getActiveGoal: async () => {
    const res = await api.get('/goals/active');
    return res.data;
  },
};

export const profileService = {
  getProfile: async () => {
    const res = await api.get('/users/me');
    return res.data;
  },
  updateProfile: async (data) => {
    const res = await api.patch('/users/me', data);
    return res.data;
  },
  setPassword: async (password) => {
    await api.put('/users/me/password', { password });
  },
};

export const leaderboardService = {
  getLeaderboard: async () => {
    const res = await api.get('/leaderboard');
    return res.data;
  },
};

export const organisationService = {
  getDashboard: async () => {
    const res = await api.get('/organisations/dashboard');
    return res.data;
  },
};

// Emission factors for real-time preview
export const EMISSION_FACTORS = {
  TRANSPORT: {
    CAR_PETROL:         { factor: 0.192, unit: 'KM', label: 'Petrol Car' },
    CAR_DIESEL:         { factor: 0.171, unit: 'KM', label: 'Diesel Car' },
    CAR_ELECTRIC:       { factor: 0.053, unit: 'KM', label: 'Electric Car' },
    FLIGHT_SHORT_HAUL:  { factor: 0.255, unit: 'KM', label: 'Short-haul Flight' },
    FLIGHT_LONG_HAUL:   { factor: 0.150, unit: 'KM', label: 'Long-haul Flight' },
    PUBLIC_TRANSIT_BUS:  { factor: 0.089, unit: 'KM', label: 'Bus' },
    PUBLIC_TRANSIT_RAIL: { factor: 0.041, unit: 'KM', label: 'Train / Rail' },
  },
  ELECTRICITY: {
    GRID_ELECTRICITY:      { factor: 0.475, unit: 'KWH', label: 'Grid Electricity' },
    RENEWABLE_ELECTRICITY: { factor: 0.041, unit: 'KWH', label: 'Renewable Electricity' },
  },
  FOOD: {
    BEEF_MEAL:       { factor: 6.61,  unit: 'SERVING', label: 'Beef Meal' },
    CHICKEN_MEAL:    { factor: 1.57,  unit: 'SERVING', label: 'Chicken Meal' },
    VEGETARIAN_MEAL: { factor: 0.89,  unit: 'SERVING', label: 'Vegetarian Meal' },
    VEGAN_MEAL:      { factor: 0.52,  unit: 'SERVING', label: 'Vegan Meal' },
  },
  SHOPPING: {
    CLOTHING:      { factor: 0.40, unit: 'USD', label: 'Clothing' },
    ELECTRONICS:   { factor: 0.32, unit: 'USD', label: 'Electronics' },
    GENERAL_RETAIL: { factor: 0.25, unit: 'USD', label: 'General Retail' },
  },
};
