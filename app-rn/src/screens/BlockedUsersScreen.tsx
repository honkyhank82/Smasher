import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { theme } from '../config/theme';
import api from '../config/api';
import { USE_MOCK_DATA, MOCK_BLOCKED_USERS } from '../utils/mockData';

interface BlockedUser {
  id: string;
  displayName: string;
  profilePicture?: string;
  blockedAt: string;
}

export const BlockedUsersScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [unblocking, setUnblocking] = useState<string | null>(null);

  useEffect(() => {
    loadBlockedUsers();
  }, []);

  const loadBlockedUsers = async () => {
    try {
      console.log('🔍 Loading blocked users...');
      
      // Use mock data if enabled
      if (USE_MOCK_DATA) {
        console.log('📦 Using mock data for blocked users');
        await new Promise(resolve => setTimeout(resolve, 500));
        setBlockedUsers(MOCK_BLOCKED_USERS);
        console.log('✅ Mock blocked users loaded:', MOCK_BLOCKED_USERS.length, 'users');
        return;
      }
      
      const response = await api.get('/users/blocked');
      console.log('✅ Blocked users loaded:', response.data.length, 'users');
      setBlockedUsers(response.data);
    } catch (error: any) {
      console.error('❌ Failed to load blocked users:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      Alert.alert(
        'Error Loading Blocked Users',
        `Failed to load blocked users: ${error.response?.data?.message || error.message}`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = (userId: string, displayName: string) => {
    Alert.alert(
      'Unblock User',
      `Are you sure you want to unblock ${displayName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: async () => {
            setUnblocking(userId);
            try {
              await api.post(`/users/unblock/${userId}`);
              setBlockedUsers(blockedUsers.filter((user) => user.id !== userId));
              Alert.alert('Success', `${displayName} has been unblocked`);
            } catch (error: any) {
              console.error('Failed to unblock user:', error);
              Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to unblock user'
              );
            } finally {
              setUnblocking(null);
            }
          },
        },
      ]
    );
  };

  const renderBlockedUser = ({ item }: { item: BlockedUser }) => (
    <View style={styles.userCard}>
      <Image
        source={{
          uri: item.profilePicture || 'https://via.placeholder.com/50',
        }}
        style={styles.avatar}
        resizeMode="cover"
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.displayName}</Text>
        <Text style={styles.blockedDate}>
          Blocked {new Date(item.blockedAt).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.unblockButton}
        onPress={() => handleUnblock(item.id, item.displayName)}
        disabled={unblocking === item.id}
      >
        {unblocking === item.id ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : (
          <Text style={styles.unblockButtonText}>Unblock</Text>
        )}
      </TouchableOpacity>
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Blocked Users</Text>
        <View style={{ width: 50 }} />
      </View>

      {blockedUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🚫</Text>
          <Text style={styles.emptyTitle}>No Blocked Users</Text>
          <Text style={styles.emptyDescription}>
            You haven't blocked anyone yet. Blocked users won't be able to see your
            profile or send you messages.
          </Text>
        </View>
      ) : (
        <FlatList
          data={blockedUsers}
          renderItem={renderBlockedUser}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  listContent: {
    padding: theme.spacing.md,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.border,
  },
  userInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  userName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  blockedDate: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  unblockButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    minWidth: 80,
    alignItems: 'center',
  },
  unblockButtonText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
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
  emptyDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
