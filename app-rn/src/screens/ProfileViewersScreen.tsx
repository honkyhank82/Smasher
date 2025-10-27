import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
} from 'react-native';
import { theme } from '../config/theme';
import api from '../services/api';
import { usePremium } from '../contexts/PremiumContext';

interface ProfileViewersScreenProps {
  navigation: any;
}

interface Viewer {
  id: string;
  displayName: string;
  age: number | null;
  profilePicture: string | null;
  viewedAt: string;
  isBlurred: boolean;
}

interface ViewersData {
  viewers: Viewer[];
  totalCount: number;
  isPremium: boolean;
}

export const ProfileViewersScreen = ({ navigation }: ProfileViewersScreenProps) => {
  const { checkPremiumFeature } = usePremium();
  const [data, setData] = useState<ViewersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Check if user has premium access
    const hasPremium = checkPremiumFeature('See Who Viewed Your Profile', true);
    if (hasPremium) {
      loadViewers();
    } else {
      // User doesn't have premium, navigate back
      navigation.goBack();
    }
  }, []);

  const loadViewers = async () => {
    try {
      const response = await api.get('/profile-views/viewers');
      setData(response.data);
    } catch (error) {
      // Don't show alert on refresh, only on initial load
      if (!refreshing) {
        Alert.alert('Error', 'Failed to load profile viewers');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadViewers();
  };

  const handleViewerPress = (viewer: Viewer) => {
    if (viewer.isBlurred) {
      Alert.alert(
        'Premium Feature',
        'Upgrade to premium to see all profile viewers!',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => navigation.navigate('Settings') },
        ]
      );
      return;
    }
    navigation.navigate('ProfileView', { userId: viewer.id });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderViewer = ({ item }: { item: Viewer }) => {
    return (
      <TouchableOpacity
        style={styles.viewerCard}
        onPress={() => handleViewerPress(item)}
      >
        <View style={styles.viewerContent}>
          {item.isBlurred ? (
            <View style={styles.blurredImage}>
              <Text style={styles.blurredIcon}>👤</Text>
            </View>
          ) : (
            <Image
              source={{ uri: item.profilePicture || 'https://via.placeholder.com/80' }}
              style={styles.profileImage}
            />
          )}
          <View style={styles.viewerInfo}>
            <Text style={styles.viewerName}>
              {item.displayName}
              {item.age !== null && `, ${item.age}`}
            </Text>
            <Text style={styles.viewedTime}>{formatTimeAgo(item.viewedAt)}</Text>
          </View>
          {item.isBlurred && (
            <View style={styles.lockBadge}>
              <Text style={styles.lockIcon}>🔒</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Viewers</Text>
        <View style={styles.placeholder} />
      </View>

      {data && data.totalCount > 0 ? (
        <>
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              {data.totalCount} {data.totalCount === 1 ? 'person has' : 'people have'} viewed your profile
            </Text>
            {!data.isPremium && data.totalCount > 3 && (
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={() => navigation.navigate('Settings')}
              >
                <Text style={styles.upgradeButtonText}>
                  🔓 Upgrade to see all viewers
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={data.viewers}
            renderItem={renderViewer}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={theme.colors.primary}
              />
            }
          />
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>👀</Text>
          <Text style={styles.emptyTitle}>No viewers yet</Text>
          <Text style={styles.emptyText}>
            When someone views your profile, they'll appear here
          </Text>
        </View>
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingTop: 50,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: theme.colors.text,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  placeholder: {
    width: 40,
  },
  statsContainer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  statsText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  upgradeButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  upgradeButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  listContent: {
    padding: theme.spacing.md,
  },
  viewerCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  viewerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.background,
  },
  blurredImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blurredIcon: {
    fontSize: 30,
    opacity: 0.5,
  },
  viewerInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  viewerName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  viewedTime: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  lockBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
