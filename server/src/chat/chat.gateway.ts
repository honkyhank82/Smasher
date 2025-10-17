import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { User } from '../users/user.entity';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId
  private onlineStatus: Map<string, Date> = new Map(); // userId -> last active timestamp

  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      this.connectedUsers.set(userId, client.id);
      this.onlineStatus.set(userId, new Date());
      client.data.userId = userId;

      // Broadcast online status to all connected users
      this.server.emit('userOnline', { userId, timestamp: new Date() });

      console.log(`User ${userId} connected`);
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.connectedUsers.delete(userId);
      this.onlineStatus.set(userId, new Date()); // Keep last seen time
      
      // Broadcast offline status to all connected users
      this.server.emit('userOffline', { userId, timestamp: new Date() });
      
      console.log(`User ${userId} disconnected`);
    }
  }

  /**
   * Get online status for a user
   */
  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  /**
   * Get last seen timestamp for a user
   */
  getLastSeen(userId: string): Date | null {
    return this.onlineStatus.get(userId) || null;
  }

  /**
   * Get all online users
   */
  getOnlineUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  @SubscribeMessage('joinChat')
  async handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    const currentUserId = client.data.userId;
    
    // Load message history between these two users
    const messages = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .where(
        '(message.sender_id = :userId1 AND message.receiver_id = :userId2) OR (message.sender_id = :userId2 AND message.receiver_id = :userId1)',
        { userId1: currentUserId, userId2: data.userId }
      )
      .orderBy('message.created_at', 'ASC')
      .limit(100)
      .getMany();

    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      senderId: msg.sender.id,
      receiverId: msg.receiver.id,
      content: msg.content,
      createdAt: msg.createdAt,
      isRead: msg.isRead,
      readAt: msg.readAt,
      senderIsPremium: msg.sender.isPremium && msg.sender.premiumExpiresAt && msg.sender.premiumExpiresAt > new Date(),
    }));

    client.emit('messageHistory', formattedMessages);
    
    // Mark messages as read when viewing chat
    await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true, readAt: new Date() })
      .where('receiver_id = :currentUserId AND sender_id = :otherUserId AND is_read = false', {
        currentUserId,
        otherUserId: data.userId,
      })
      .execute();
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: string; content: string },
  ) {
    const senderId = client.data.userId;

    // Get sender's premium status
    const sender = await this.userRepository.findOne({ where: { id: senderId } });
    const senderIsPremium = sender && sender.isPremium && sender.premiumExpiresAt && sender.premiumExpiresAt > new Date();

    // Save message to database
    const message = this.messageRepository.create({
      sender: { id: senderId },
      receiver: { id: data.receiverId },
      content: data.content,
      isRead: false,
    });

    const savedMessage = await this.messageRepository.save(message);

    const messagePayload = {
      id: savedMessage.id,
      senderId,
      receiverId: data.receiverId,
      content: data.content,
      createdAt: savedMessage.createdAt,
      isRead: false,
      readAt: null,
      senderIsPremium,
    };

    // Send to receiver if online
    const receiverSocketId = this.connectedUsers.get(data.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('message', messagePayload);
    }

    // Confirm to sender
    client.emit('messageSent', messagePayload);
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageIds: string[] },
  ) {
    const currentUserId = client.data.userId;
    const readAt = new Date();

    // Mark messages as read
    await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true, readAt })
      .where('id IN (:...ids) AND receiver_id = :userId', {
        ids: data.messageIds,
        userId: currentUserId,
      })
      .execute();

    // Get the sender IDs to notify them
    const messages = await this.messageRepository
      .createQueryBuilder('message')
      .select('message.sender_id', 'senderId')
      .where('message.id IN (:...ids)', { ids: data.messageIds })
      .getRawMany();

    // Notify senders that their messages were read (only if sender is premium)
    for (const msg of messages) {
      const sender = await this.userRepository.findOne({ where: { id: msg.senderId } });
      
      // Only send read receipts if the sender has an active premium subscription
      if (sender && sender.isPremium && sender.premiumExpiresAt && sender.premiumExpiresAt > new Date()) {
        const senderSocketId = this.connectedUsers.get(msg.senderId);
        if (senderSocketId) {
          this.server.to(senderSocketId).emit('messagesRead', {
            messageIds: data.messageIds,
            readAt,
          });
        }
      }
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: string },
  ) {
    const receiverSocketId = this.connectedUsers.get(data.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('userTyping', {
        userId: client.data.userId,
      });
    }
  }
}
