import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { AgeGateScreen } from '../screens/AgeGateScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { CreateProfileScreen } from '../screens/CreateProfileScreen';
import { ProfileViewScreen } from '../screens/ProfileViewScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { GalleryScreen } from '../screens/GalleryScreen';
import { ProfileViewersScreen } from '../screens/ProfileViewersScreen';
import { ChangeEmailScreen } from '../screens/ChangeEmailScreen';
import { PrivacySettingsScreen } from '../screens/PrivacySettingsScreen';
import { BlockedUsersScreen } from '../screens/BlockedUsersScreen';
import { TermsOfServiceScreen } from '../screens/TermsOfServiceScreen';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyScreen';
import { HelpSupportScreen } from '../screens/HelpSupportScreen';
import { LocationShareScreen } from '../screens/LocationShareScreen';
import { SharedLocationMapScreen } from '../screens/SharedLocationMapScreen';
import { UpdateDebugScreen } from '../screens/UpdateDebugScreen';
import { PremiumUpgradeScreen } from '../screens/PremiumUpgradeScreen';
import { ManageSubscriptionScreen } from '../screens/ManageSubscriptionScreen';
import { BackendServiceScreen } from '../screens/BackendServiceScreen';
import { MainTabs } from './MainTabs';
import { AdminScreen } from '../screens/AdminScreen';
import { usePremium } from '../contexts/PremiumContext';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { theme } from '../config/theme';
import type { NavigationContainerRef } from '@react-navigation/native';

const Stack = createStackNavigator();

export const AppNavigator = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const { setNavigationRef } = usePremium();
  const [birthdate, setBirthdate] = useState<string>();
  const navigationRef = React.useRef<NavigationContainerRef<any>>(null);

  useEffect(() => {
    if (navigationRef.current) {
      setNavigationRef(navigationRef.current);
    }
  }, [navigationRef.current]);

  useEffect(() => {
    console.log('🧭 AppNavigator state:', { isAuthenticated, loading, user: user?.email, hasProfile: user?.hasProfile });
  }, [isAuthenticated, loading, user]);

  if (loading) {
    console.log('⏳ AppNavigator: Loading...');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Check if user needs to create profile
  const needsProfile = isAuthenticated && user && !user.hasProfile;
  console.log('🧭 Navigation decision:', { isAuthenticated, needsProfile });

  if (!isAuthenticated) {
    return (
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Welcome"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: theme.colors.background },
          }}
        >
          <Stack.Screen name="Welcome">
            {({ navigation }) => (
              <WelcomeScreen
                onSignUp={() => navigation.navigate('AgeGate')}
                onLogin={() => navigation.navigate('Login')}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="AgeGate">
            {({ navigation }) => (
              <AgeGateScreen
                onAgeVerified={(bd) => {
                  setBirthdate(bd);
                  navigation.navigate('Register');
                }}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Register">
            {({ navigation }) => (
              <RegisterScreen
                birthdate={birthdate!}
                onRegistered={() => navigation.navigate('Login')}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Login">
            {({ navigation }) => (
              <LoginScreen
                onLoginSuccess={() => {/* Auth state change will trigger re-render */}}
                onBack={() => navigation.navigate('Welcome')}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // User is authenticated
  if (needsProfile) {
    return (
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: theme.colors.background },
          }}
        >
          <Stack.Screen name="CreateProfile" component={CreateProfileScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // User is authenticated and has profile
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="Gallery" component={GalleryScreen} />
        <Stack.Screen name="Profile" component={ProfileViewScreen} />
        <Stack.Screen name="ProfileViewers" component={ProfileViewersScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="ChangeEmail" component={ChangeEmailScreen} />
        <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
        <Stack.Screen name="BlockedUsers" component={BlockedUsersScreen} />
        <Stack.Screen name="UpdateDebug" component={UpdateDebugScreen} />
        <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
        <Stack.Screen name="LocationShare" component={LocationShareScreen} />
        <Stack.Screen name="SharedLocationMap" component={SharedLocationMapScreen} />
        <Stack.Screen name="PremiumUpgrade" component={PremiumUpgradeScreen} />
        <Stack.Screen name="ManageSubscription" component={ManageSubscriptionScreen} />
        <Stack.Screen name="BackendService" component={BackendServiceScreen} />
        <Stack.Screen name="Admin" component={AdminScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
