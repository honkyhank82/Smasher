import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../config/theme';
import { API_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';

interface ChatScreenProps {
  route: any;
  navigation: any;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isMine: boolean;
  isRead?: boolean;
  readAt?: string | null;
  senderIsPremium?: boolean;
}

export const ChatScreen = ({ route, navigation }: ChatScreenProps) => {
  const { userId, displayName } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const isPremium = user?.isPremium || false;

  useEffect(() => {
    initializeSocket();
    return () => {
      socket?.disconnect();
    };
  }, []);

  const initializeSocket = async () => {
    const token = await AsyncStorage.getItem('authToken');
    
    const newSocket = io(API_BASE_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      // Join chat room
      newSocket.emit('joinChat', { userId });
    });

    newSocket.on('message', (message: any) => {
      setMessages((prev) => [...prev, { ...message, isMine: false }]);
      scrollToBottom();
    });

    newSocket.on('messageHistory', (history: any[]) => {
      setMessages(history.map(msg => ({ ...msg, isMine: msg.senderId !== userId })));
    });

    newSocket.on('messagesRead', (data: { messageIds: string[]; readAt: string }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          data.messageIds.includes(msg.id)
            ? { ...msg, isRead: true, readAt: data.readAt }
            : msg
        )
      );
    });

    newSocket.on('messageSent', (message: any) => {
      // Update the temporary message with the server response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.senderId === 'me' && msg.content === message.content
            ? { ...message, isMine: true, senderIsPremium: message.senderIsPremium }
            : msg
        )
      );
    });

    setSocket(newSocket);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSend = () => {
    if (!inputText.trim() || !socket) return;

    const message = {
      receiverId: userId,
      content: inputText.trim(),
    };

    socket.emit('sendMessage', message);
    
    // Add to local messages immediately
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        senderId: 'me',
        receiverId: userId,
        content: inputText.trim(),
        createdAt: new Date().toISOString(),
        isMine: true,
        isRead: false,
        senderIsPremium: isPremium,
      },
    ]);

    setInputText('');
    scrollToBottom();
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.isMine ? styles.myMessage : styles.theirMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.content}</Text>
      <View style={styles.messageFooter}>
        <Text style={styles.messageTime}>
          {new Date(item.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
        {item.isMine && item.senderIsPremium && (
          <Text style={styles.readReceipt}>
            {item.isRead ? '✓✓' : '✓'}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{displayName}</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={scrollToBottom}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={theme.colors.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  backButton: {
    fontSize: 24,
    color: theme.colors.text,
    width: 30,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  messagesList: {
    padding: theme.spacing.md,
  },
  messageContainer: {
    maxWidth: '75%',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.primary,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surface,
  },
  messageText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    marginBottom: theme.spacing.xs,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  messageTime: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
  },
  readReceipt: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    maxHeight: 100,
    marginRight: theme.spacing.sm,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
});
