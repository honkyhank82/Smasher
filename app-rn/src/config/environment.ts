import Constants from "expo-constants";
import * as Application from "expo-application";
import { Platform } from "react-native";

// Environment types
type Environment = "development" | "staging" | "production";

// Get the release channel from Expo config (cast to any to avoid type issues)
const releaseChannel =
  (Constants.expoConfig as any)?.releaseChannel || "development";

// Determine the current environment
const getEnvironment = (): Environment => {
  if (__DEV__) {
    return "development";
  }
  if (releaseChannel.includes("staging")) {
    return "staging";
  }
  return "production";
};

const ENV: Environment = getEnvironment();

// Common configuration
const common = {
  // App info
  APP_NAME: "Smasher",
  APP_VERSION: Application.nativeApplicationVersion || "1.0.0",
  BUILD_NUMBER: Application.nativeBuildVersion || "1",

  // API configuration
  API_TIMEOUT: 30000, // 30 seconds

  // Feature flags
  ENABLE_ANALYTICS: !__DEV__,
  ENABLE_LOGGING: __DEV__,

  // Platform
  IS_IOS: Platform.OS === "ios",
  IS_ANDROID: Platform.OS === "android",

  // Environment
  IS_DEV: __DEV__,
  IS_STAGING: ENV === "staging",
  IS_PRODUCTION: ENV === "production",
};

// Environment-specific configuration
const environments = {
  development: {
    ...common,
    API_BASE_URL: "http://localhost:3000",
    SENTRY_DSN: "", // Add development DSN if needed
    ENABLE_LOGGING: true,
  },
  staging: {
    ...common,
    API_BASE_URL: "https://staging.api.smasher.app",
    SENTRY_DSN: "YOUR_STAGING_SENTRY_DSN",
  },
  production: {
    ...common,
    API_BASE_URL: "https://smasher-api.fly.dev",
    SENTRY_DSN: "YOUR_PRODUCTION_SENTRY_DSN",
  },
};

// Get the current environment config
const getEnvConfig = () => {
  switch (ENV) {
    case "development":
      return environments.development;
    case "staging":
      return environments.staging;
    case "production":
      return environments.production;
    default:
      return environments.development;
  }
};

// Export the config
export default getEnvConfig();

// Type definitions
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
      EXPO_PUBLIC_API_URL?: string;
      EXPO_PUBLIC_SENTRY_DSN?: string;
    }
  }
}
