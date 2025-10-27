import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import NotificationService from '../services/NotificationService';

interface User {
  id: string;
  email: string;
  profile?: {
    displayName?: string;
    bio?: string;
    profilePicture?: string;
  };
  hasProfile: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, birthdate: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutTimer, setLogoutTimer] = useState<ReturnType<typeof setTimeout> | null>(null); // Fixed type

  // Auth state debugger (like a security camera behind the bar)
  useEffect(() => {
    console.log(`🔐 Auth State: ${user ? '🍸 ' + user.email : '🚪 No patrons'}`);
    if (user?.profile?.displayName) {
      console.log(`   🎩 Active profile: ${user.profile.displayName}`);
    }
  }, [user]);

  useEffect(() => {
    checkAuth();
    return () => {
      // Cleanup timer when component unmounts (like closing time)
      if (logoutTimer) clearTimeout(logoutTimer);
    };
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        // No token, user is not logged in - this is normal
        setLoading(false);
        return;
      }

      // Token exists, verify it with the server
      const response = await api.get('/profiles/me');
      const userData = response.data;
      setUser({
        ...userData,
        hasProfile: !!(userData.profile?.displayName),
      });
    } catch (error: any) {
      // Silently handle auth errors - they're expected when not logged in
      if (error?.response?.status === 401) {
        await AsyncStorage.removeItem('authToken');
      }
      // Don't log errors - network issues on startup are normal
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, birthdate: string, password: string) => {
    try {
      const response = await api.post('/auth/register', { email, birthdate, password });
      console.log(`✅ Registration response:`, response.data);
    } catch (error: any) {
      console.error('💥 Registration explosion:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('📡 Sending login request with:', { email, passwordLength: password.length });
      const response = await api.post('/auth/login', { email, password });
      console.log('📡 Login response received:', response.data);
      const { access_token, user: userData } = response.data;
      console.log('💾 Saving token to AsyncStorage...');
      await AsyncStorage.setItem('authToken', access_token);
      console.log('👤 Setting user state:', userData);
      const userWithProfile = {
        ...userData,
        hasProfile: !!(userData.profile?.displayName),
      };
      console.log('👤 User with hasProfile:', userWithProfile);
      setUser(userWithProfile);
      console.log('✅ Login complete, user state updated');
      
      // Register for push notifications
      await NotificationService.registerForPushNotifications();
    } catch (error: any) {
      console.error('🚫 Login failed:', error);
      console.error('🚫 Error response:', error.response?.data);
      console.error('🚫 Error status:', error.response?.status);
      console.error('🚫 Error message:', error.message);
      throw error;
    }
  };

  const logout = async () => {
    // Remove push token from backend
    await NotificationService.removePushToken();
    
    await AsyncStorage.removeItem('authToken');
    setUser(null);
    console.log(`🚪➡️ ${user?.email || 'User'} bounced`);
    if (logoutTimer) clearTimeout(logoutTimer);
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/profiles/me');
      const userData = response.data;
      setUser({
        ...userData,
        hasProfile: !!(userData.profile?.displayName),
      });
      console.log('🔄 User data refreshed');
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('🚷 useAuth must be used within AuthProvider');
  }
  return context;
};

// PRO TIP: Add this to your tsconfig.json for better type checking:
// {
//   "compilerOptions": {
//     "types": ["react-native"]
//   }
// }
