import React from "react";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { PremiumProvider } from "./src/contexts/PremiumContext";
import * as SplashScreen from "expo-splash-screen";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});

export default function App() {
  return (
    <AuthProvider>
      <PremiumProvider>
        <AppNavigator />
      </PremiumProvider>
    </AuthProvider>
  );
}
