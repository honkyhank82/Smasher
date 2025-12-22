// API Configuration for Web App
// Automatic failover system with multiple redundant servers

// Get API URL from environment variable or use defaults
const primaryApiUrl = import.meta.env.VITE_API_URL || 'https://smasher-api.fly.dev';

export const BACKEND_SERVICES = [
  {
    name: 'Fly.io Primary',
    apiUrl: primaryApiUrl,
    wsUrl: primaryApiUrl.replace('https://', 'wss://').replace('http://', 'ws://'),
    priority: 1,
    healthCheck: '/health'
  },
  {
    name: 'Render Backup',
    apiUrl: 'https://smasher.onrender.com',
    wsUrl: 'wss://smasher.onrender.com',
    priority: 2,
    healthCheck: '/health'
  }
];

const HEALTH_CHECK_TIMEOUT = 5000;

export const checkServiceHealth = async (service: typeof BACKEND_SERVICES[0]): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT);
    
    const response = await fetch(`${service.apiUrl}${service.healthCheck}`, {
      signal: controller.signal,
      method: 'GET',
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn(`Health check failed for ${service.name}:`, error);
    return false;
  }
};

export const getHealthyService = async () => {
  const sortedServices = [...BACKEND_SERVICES].sort((a, b) => a.priority - b.priority);
  
  for (const service of sortedServices) {
    const isHealthy = await checkServiceHealth(service);
    if (isHealthy) {
      console.log(`Using backend service: ${service.name}`);
      return service;
    }
  }
  
  console.warn('All health checks failed, using primary service');
  return sortedServices[0];
};

const getActiveService = () => {
  return BACKEND_SERVICES[0];
};

export let API_BASE_URL = getActiveService().apiUrl;
export let WS_URL = getActiveService().wsUrl;

export const updateServiceUrls = (service: typeof BACKEND_SERVICES[0]) => {
  API_BASE_URL = service.apiUrl;
  WS_URL = service.wsUrl;
};

export const API_TIMEOUT = 60000;
export const MAX_RETRIES = 5;
export const RETRY_DELAY = 2000;

export const FEATURES = {
  PREMIUM_ENABLED: true,
  VIDEO_UPLOAD_ENABLED: true,
  CHAT_ENABLED: true,
  LOCATION_ENABLED: true,
};

export const APP_CONFIG = {
  MAX_PHOTOS: 6,
  MAX_VIDEO_SIZE_MB: 50,
  MAX_PHOTO_SIZE_MB: 10,
  MESSAGE_FETCH_LIMIT: 50,
};