import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { theme } from '../config/theme';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { USE_MOCK_DATA, MOCK_CHATS } from '../utils/mockData';

interface Chat {
  id: string;
  otherUser: {
    id: string;
    displayName: string;
    profilePicture?: string;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
    senderId: string;
  };
  unreadCount: number;
}

export const ChatsListScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadChats();
  }, []);

  const navigateToScreen = (screenName: string, params?: any) => {
    navigation.getParent()?.navigate(screenName, params);
  };

  const loadChats = async () => {
    try {
      console.log('🔍 Loading chats...');
      
      // Use mock data if enabled
      if (USE_MOCK_DATA) {
        console.log('📦 Using mock data for chats');
        await new Promise(resolve => setTimeout(resolve, 500));
        setChats(MOCK_CHATS);
        console.log('✅ Mock chats loaded:', MOCK_CHATS.length, 'conversations');
        return;
      }
      
      const response = await api.get('/chat/conversations');
      console.log('✅ Chats loaded:', response.data.length, 'conversations');
      setChats(response.data);
    } catch (error: any) {
      console.error('❌ Failed to load chats:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      // Gracefully handle server errors - show empty state instead of crashing
      if (error.response?.status === 500) {
        console.log('⚠️ Server error loading chats - showing empty state');
      }
      setChats([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadChats();
  };

  const handleChatPress = (chat: Chat) => {
    navigateToScreen('Chat', { 
      userId: chat.otherUser.id,
      userName: chat.otherUser.displayName 
    });
  };

  const renderChat = ({ item }: { item: Chat }) => {
    const isUnread = item.unreadCount > 0;
    const lastMessagePreview = item.lastMessage?.content || 'No messages yet';
    const isOwnMessage = item.lastMessage?.senderId === user?.id;

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => handleChatPress(item)}
      >
        <Image
          source={{ uri: item.otherUser.profilePicture || 'https://via.placeholder.com/50' }}
          style={styles.avatar}
        />
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={[styles.userName, isUnread && styles.unreadText]}>
              {item.otherUser.displayName}
            </Text>
            {item.lastMessage && (
              <Text style={styles.timestamp}>
                {formatTimestamp(item.lastMessage.createdAt)}
              </Text>
            )}
          </View>
          <View style={styles.messagePreview}>
            <Text
              style={[styles.lastMessage, isUnread && styles.unreadText]}
              numberOfLines={1}
            >
              {isOwnMessage && 'You: '}
              {lastMessagePreview}
            </Text>
            {isUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
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
        <Text style={styles.title}>Messages</Text>
      </View>

      <FlatList
        data={chats}
        renderItem={renderChat}
        keyExtractor={(item) => item.id}
        contentContainerStyle={chats.length === 0 ? styles.emptyContainer : undefined}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>
              Start chatting with people you match with
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  chatItem: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.surface,
    marginRight: theme.spacing.md,
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  userName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  timestamp: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  messagePreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  unreadText: {
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  unreadBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: theme.spacing.sm,
  },
  unreadCount: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xs,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
