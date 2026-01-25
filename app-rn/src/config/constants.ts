// API Configuration
export const API_TIMEOUT = 30000; // 30 seconds

// Backend Services Configuration
export const BACKEND_SERVICES = [
  {
    name: "production",
    apiUrl: "https://smasher-api.fly.dev",
    healthCheckUrl: "https://smasher-api.fly.dev/health/live",
  },
  {
    name: "staging",
    apiUrl: "https://staging.api.smasher.app",
    healthCheckUrl: "https://staging.api.smasher.app/health",
  },
  {
    name: "development",
    apiUrl: "http://localhost:3000",
    healthCheckUrl: "http://localhost:3000/health",
  },
];

// Error Codes
export const ErrorCodes = {
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT_ERROR: "TIMEOUT_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

// HTTP Methods
export const HttpMethod = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH",
  HEAD: "HEAD",
  OPTIONS: "OPTIONS",
} as const;

// API Endpoints
export const ApiEndpoints = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    REFRESH_TOKEN: "/auth/refresh-token",
    LOGOUT: "/auth/logout",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },
  USER: {
    PROFILE: "/users/me",
    UPDATE_PROFILE: "/users/me",
    CHANGE_PASSWORD: "/users/me/change-password",
    AVATAR: "/users/me/avatar",
  },
  // Add more endpoints as needed
} as const;

// Cache Control
export const CacheControl = {
  NO_CACHE: "no-cache",
  NO_STORE: "no-store",
  MAX_AGE: "max-age=",
  MAX_STALE: "max-stale=",
  MIN_FRESH: "min-fresh=",
  NO_TRANSFORM: "no-transform",
  ONLY_IF_CACHED: "only-if-cached",
} as const;

// Content Types
export const ContentType = {
  JSON: "application/json",
  FORM_DATA: "multipart/form-data",
  FORM_URLENCODED: "application/x-www-form-urlencoded",
  TEXT_PLAIN: "text/plain",
  OCTET_STREAM: "application/octet-stream",
} as const;

// Headers
export const Headers = {
  CONTENT_TYPE: "Content-Type",
  ACCEPT: "Accept",
  AUTHORIZATION: "Authorization",
  CACHE_CONTROL: "Cache-Control",
  X_REQUESTED_WITH: "X-Requested-With",
  X_CLIENT_VERSION: "X-Client-Version",
  X_PLATFORM: "X-Platform",
  X_DEVICE_ID: "X-Device-Id",
} as const;
