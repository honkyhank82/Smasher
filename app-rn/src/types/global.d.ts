declare const process: {
  env: {
    NODE_ENV?: string;
    SENTRY_DSN?: string;
    API_CONFIG?: string;
    EXPO_PUBLIC_API_URL?: string;
    EXPO_PUBLIC_SENTRY_DSN?: string;
  };
};

declare module "expo-localization";
