import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../config/theme';
import { HomeScreen } from '../screens/HomeScreen';
import { BuddiesScreen } from '../screens/BuddiesScreen';
import { ChatsListScreen } from '../screens/ChatsListScreen';
import { MyProfileScreen } from '../screens/MyProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export const MainTabs = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          paddingBottom: insets.bottom + 5,
          paddingTop: 5,
          height: 60 + insets.bottom,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24 }}>🏠</Text>
          ),
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={BuddiesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24 }}>⭐</Text>
          ),
          tabBarLabel: 'Favorites',
        }}
      />
      <Tab.Screen
        name="Chats"
        component={ChatsListScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24 }}>💬</Text>
          ),
          tabBarLabel: 'Chats',
        }}
      />
      <Tab.Screen
        name="MyProfile"
        component={MyProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24 }}>👤</Text>
          ),
          tabBarLabel: 'Profile',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24 }}>⚙️</Text>
          ),
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};
