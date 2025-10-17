import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Update this to your backend URL
// For physical device: use your computer's local IP (192.168.68.61)
// For Android emulator: use 10.0.2.2
export const API_BASE_URL = __DEV__ 
  ? 'https://smasher-api.fly.dev' 
  : 'https://smasher-api.fly.dev';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased to 30 seconds for file uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('authToken');
      // Navigate to login - will be handled by navigation context
    }
    return Promise.reject(error);
  }
);

export default api;





