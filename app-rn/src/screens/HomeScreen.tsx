import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { theme } from '../config/theme';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { USE_MOCK_DATA, MOCK_NEARBY_USERS } from '../utils/mockData';

interface NearbyUser {
  id: string;
  displayName: string;
  age: number;
  distance: number;
  profilePicture?: string;
  bio?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export const HomeScreen = ({ navigation }: any) => {
  const [users, setUsers] = useState<NearbyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  useEffect(() => {
    initializeLocation();
  }, []);

  const navigateToScreen = (screenName: string, params?: any) => {
    navigation.getParent()?.navigate(screenName, params);
  };

  const initializeLocation = async () => {
    try {
      // Import services dynamically
      const PermissionsService = (await import('../services/PermissionsService')).default;
      const LocationService = (await import('../services/LocationService')).default;
      
      // Check/request location permission
      const hasPermission = await PermissionsService.checkLocationPermission();
      if (!hasPermission) {
        const granted = await PermissionsService.requestLocationPermission();
        if (!granted) {
          setLoading(false);
          Alert.alert(
            'Location Required',
            'SMASHER needs location access to show you nearby users.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Enable',
                onPress: () => PermissionsService.requestLocationPermission(),
              },
            ]
          );
          return;
        }
      }

      // Get current location
      const location = await LocationService.getCurrentLocation();
      if (location) {
        await LocationService.updateLocationOnServer(location);
        await loadNearbyUsers();
        // Start tracking location updates
        LocationService.startLocationTracking();
      } else {
        setLoading(false);
      }
    } catch (error: any) {
      console.error('❌ Failed to initialize location:', {
        message: error.message,
        stack: error.stack,
      });
      setLoading(false);
      Alert.alert(
        'Location Error',
        `Failed to initialize location services: ${error.message}\n\nPlease ensure location permissions are granted.`,
        [
          { text: 'Retry', onPress: () => initializeLocation() },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  const loadNearbyUsers = async () => {
    try {
      console.log('🔍 Loading nearby users...');
      
      // Use mock data if enabled
      if (USE_MOCK_DATA) {
        console.log('📦 Using mock data for nearby users');
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        setUsers(MOCK_NEARBY_USERS);
        console.log('✅ Mock nearby users loaded:', MOCK_NEARBY_USERS.length, 'users');
        return;
      }
      
      const response = await api.get('/geo/nearby');
      console.log('✅ Nearby users loaded:', response.data.length, 'users');
      
      // Filter to show only male profiles
      const maleUsers = response.data.filter((user: any) => 
        user.gender === 'male' || user.gender === 'man' || user.gender === 'Male'
      );
      console.log('🚹 Filtered to male users:', maleUsers.length, 'users');
      
      setUsers(maleUsers);
    } catch (error: any) {
      console.error('❌ Failed to load nearby users:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      });
      Alert.alert(
        'Unable to Load Nearby Users',
        `Error: ${error.response?.data?.message || error.message || 'Network error'}\n\nPlease check your internet connection and try again.`,
        [
          { text: 'Retry', onPress: () => loadNearbyUsers() },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUserPress = (userId: string) => {
    navigateToScreen('Profile', { userId });
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: logout, style: 'destructive' },
    ]);
  };

  const renderUser = ({ item }: { item: NearbyUser }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => handleUserPress(item.id)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.profilePicture || 'https://via.placeholder.com/150' }}
          style={styles.userImage}
        />
        {item.isOnline && (
          <View style={styles.onlineIndicator} />
        )}
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName} numberOfLines={1}>{item.displayName}, {item.age}</Text>
        <Text style={styles.userDistance} numberOfLines={1}>{item.distance} mi</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>SMASHER</Text>
      </View>

      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        numColumns={4}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No users nearby</Text>
            <Text style={styles.emptySubtext}>
              Check your location settings or try again later
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  logo: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.primary,
    letterSpacing: 2,
  },
  list: {
    padding: theme.spacing.sm,
  },
  row: {
    justifyContent: 'space-between',
  },
  userCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xs,
    margin: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    maxWidth: '23%',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 3/4,
    marginBottom: theme.spacing.xs,
  },
  userImage: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.border,
  },
  onlineIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  userInfo: {
    width: '100%',
  },
  userName: {
    fontSize: theme.fontSize.xs,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 1,
  },
  userDistance: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
