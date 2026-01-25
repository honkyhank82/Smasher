// Development API Configuration
// This file should be used during local development

export const API_BASE_URL = "http://localhost:3001"; // Local development server

// WebSocket URL (for Socket.IO)
export const WS_URL = "http://localhost:3001"; // Same as API_BASE_URL for Socket.IO

// API Timeouts
export const API_TIMEOUT = 30000; // 30 seconds

// Retry configuration
export const MAX_RETRIES = 3;
export const RETRY_DELAY = 1000; // 1 second

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
