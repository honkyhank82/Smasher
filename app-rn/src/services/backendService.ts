import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_SERVICES } from '../config/api';
import { Alert } from 'react-native';

// Storage key for the selected backend service
const SELECTED_SERVICE_KEY = 'selected_backend_service';

/**
 * Service for managing backend service selection
 */
export const backendService = {
  /**
   * Get the currently selected backend service
   */
  async getSelectedService() {
    try {
      const serviceKey = await AsyncStorage.getItem(SELECTED_SERVICE_KEY);
      if (serviceKey && BACKEND_SERVICES[serviceKey]) {
        return serviceKey;
      }
      return 'FLY_IO'; // Default to Fly.io
    } catch (error) {
      console.error('Error getting selected service:', error);
      return 'FLY_IO';
    }
  },

  /**
   * Set the active backend service
   */
  async setActiveService(serviceKey) {
    try {
      // Reset all services to inactive
      Object.keys(BACKEND_SERVICES).forEach(key => {
        BACKEND_SERVICES[key].isActive = false;
      });

      // Set the selected service to active
      if (BACKEND_SERVICES[serviceKey]) {
        BACKEND_SERVICES[serviceKey].isActive = true;
        await AsyncStorage.setItem(SELECTED_SERVICE_KEY, serviceKey);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error setting active service:', error);
      return false;
    }
  },

  /**
   * Get all available backend services
   */
  getAvailableServices() {
    return Object.entries(BACKEND_SERVICES).map(([key, service]) => ({
      key,
      ...service
    }));
  },

  /**
   * Check if a backend service is available
   */
  async checkServiceAvailability(serviceKey) {
    try {
      const service = BACKEND_SERVICES[serviceKey];
      if (!service) return false;

      // Try to fetch the health endpoint
      const response = await fetch(`${service.apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000, // 5 second timeout
      });

      return response.ok;
    } catch (error) {
      console.error(`Service ${serviceKey} unavailable:`, error);
      return false;
    }
  },

  /**
   * Switch to the next available backend service
   */
  async switchToNextAvailableService() {
    const currentService = await this.getSelectedService();
    const services = Object.keys(BACKEND_SERVICES);
    const currentIndex = services.indexOf(currentService);
    
    // Try each service in order
    for (let i = 1; i <= services.length; i++) {
      const nextIndex = (currentIndex + i) % services.length;
      const nextService = services[nextIndex];
      
      const isAvailable = await this.checkServiceAvailability(nextService);
      if (isAvailable) {
        await this.setActiveService(nextService);
        return {
          success: true,
          service: BACKEND_SERVICES[nextService]
        };
      }
    }
    
    return {
      success: false,
      message: 'No available backend services found'
    };
  }
};

export default backendService;