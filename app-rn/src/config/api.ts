// API Configuration
// This file contains configuration for all backend services with automatic failover

// Available backend services (in priority order)
// Automatic failover system with multiple redundant servers
export const BACKEND_SERVICES = [
  {
    name: 'Fly.io Primary',
    apiUrl: 'https://smasher-api.fly.dev',
    wsUrl: 'wss://smasher-api.fly.dev',
    priority: 1,
    healthCheck: '/health'
  },
  {
    name: 'Fly.io Secondary Region',
    apiUrl: 'https://smasher-api-backup.fly.dev',
    wsUrl: 'wss://smasher-api-backup.fly.dev',
    priority: 2,
    healthCheck: '/health'
  },
  {
    name: 'Render Backup',
    apiUrl: 'https://smasher.onrender.com',
    wsUrl: 'wss://smasher.onrender.com',
    priority: 3,
    healthCheck: '/health'
  }
];

// Health check timeout
const HEALTH_CHECK_TIMEOUT = 5000; // 5 seconds

// Check if a service is healthy
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

// Get the first healthy backend service
export const getHealthyService = async () => {
  // Sort by priority
  const sortedServices = [...BACKEND_SERVICES].sort((a, b) => a.priority - b.priority);
  
  // Try each service in order
  for (const service of sortedServices) {
    const isHealthy = await checkServiceHealth(service);
    if (isHealthy) {
      console.log(`Using backend service: ${service.name}`);
      return service;
    }
  }
  
  // If all health checks fail, return the primary service anyway
  console.warn('All health checks failed, using primary service');
  return sortedServices[0];
};

// Get the active backend service (synchronous fallback)
const getActiveService = () => {
  return BACKEND_SERVICES[0]; // Default to primary
};

// Export the active service URLs (will be updated by failover logic)
export let API_BASE_URL = getActiveService().apiUrl;
export let WS_URL = getActiveService().wsUrl;

// Update service URLs (called by failover logic)
export const updateServiceUrls = (service: typeof BACKEND_SERVICES[0]) => {
  API_BASE_URL = service.apiUrl;
  WS_URL = service.wsUrl;
};

// API Timeouts
export const API_TIMEOUT = 60000; // 60 seconds

// Retry configuration
export const MAX_RETRIES = 5;
export const RETRY_DELAY = 2000; // 2 seconds

// Feature flags
export const FEATURES = {
  PREMIUM_ENABLED: true,
  VIDEO_UPLOAD_ENABLED: true,
  CHAT_ENABLED: true,
  LOCATION_ENABLED: true,
  PUSH_NOTIFICATIONS_ENABLED: false, // Enable when implemented
};

// App configuration
export const APP_CONFIG = {
  MAX_PHOTOS: 6,
  MAX_VIDEO_SIZE_MB: 50,
  MAX_PHOTO_SIZE_MB: 10,
  LOCATION_UPDATE_INTERVAL: 300000, // 5 minutes
  MESSAGE_FETCH_LIMIT: 50,
};
