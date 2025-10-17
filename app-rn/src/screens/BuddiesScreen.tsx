import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../config/theme';
import { API_BASE_URL } from '../config/api';
import { USE_MOCK_DATA, MOCK_BUDDIES } from '../utils/mockData';

interface Buddy {
  id: string;
  displayName: string;
  bio: string | null;
  email: string;
  lat: number | null;
  lng: number | null;
}

export const BuddiesScreen = ({ navigation }: any) => {
  const [buddies, setBuddies] = useState<Buddy[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBuddies();
  }, []);

  const navigateToScreen = (screenName: string, params?: any) => {
    navigation.getParent()?.navigate(screenName, params);
  };

  const loadBuddies = async () => {
    try {
      console.log('🔍 Loading buddies...');
      
      // Use mock data if enabled
      if (USE_MOCK_DATA) {
        console.log('📦 Using mock data for buddies');
        await new Promise(resolve => setTimeout(resolve, 500));
        setBuddies(MOCK_BUDDIES);
        console.log('✅ Mock buddies loaded:', MOCK_BUDDIES.length, 'buddies');
        return;
      }
      
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.get(`${API_BASE_URL}/buddies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('✅ Buddies loaded:', response.data.length, 'buddies');
      setBuddies(response.data);
    } catch (error: any) {
      console.error('❌ Failed to load buddies:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      // Don't show alert on refresh, only on initial load
      if (!refreshing) {
        Alert.alert(
          'Unable to Load Favorites',
          `Error: ${error.response?.data?.message || error.message || 'Network error'}`,
          [{ text: 'OK' }]
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadBuddies();
  };

  const handleBuddyPress = (buddy: Buddy) => {
    navigateToScreen('Profile', { userId: buddy.id });
  };

  const renderBuddy = ({ item }: { item: Buddy }) => (
    <TouchableOpacity
      style={styles.buddyCard}
      onPress={() => handleBuddyPress(item)}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.buddyInfo}>
        <Text style={styles.displayName}>{item.displayName}</Text>
        {item.bio && (
          <Text style={styles.bio} numberOfLines={2}>
            {item.bio}
          </Text>
        )}
      </View>

      <View style={styles.arrowContainer}>
        <Text style={styles.arrow}>›</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>⭐</Text>
      <Text style={styles.emptyTitle}>No Favorites Yet</Text>
      <Text style={styles.emptyText}>
        Add users to your favorites by tapping the star icon on their profile
      </Text>
    </View>
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
        <Text style={styles.headerTitle}>Favorites</Text>
        <Text style={styles.headerSubtitle}>
          {buddies.length} {buddies.length === 1 ? 'favorite' : 'favorites'}
        </Text>
      </View>

      <FlatList
        data={buddies}
        renderItem={renderBuddy}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          buddies.length === 0 ? styles.emptyList : styles.list
        }
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  headerTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  list: {
    padding: theme.spacing.md,
  },
  emptyList: {
    flex: 1,
  },
  buddyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    marginRight: theme.spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  buddyInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  bio: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  arrowContainer: {
    marginLeft: theme.spacing.sm,
  },
  arrow: {
    fontSize: 28,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
