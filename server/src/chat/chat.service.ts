import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { User } from '../users/user.entity';

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: {
    content: string;
    createdAt: Date;
    senderId: string;
  };
  updatedAt?: Date;
  unreadCount?: number;
  otherUser?: {
    id: string;
    displayName: string;
    profilePicture: string | null;
  };
}

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getConversations(userId: string): Promise<Conversation[]> {
    // Get all unique users that this user has chatted with
    const conversations = await this.messageRepository
      .createQueryBuilder('message')
      .select('DISTINCT other_user_id', 'otherUserId')
      .addSelect('MAX(message.created_at)', 'lastMessageTime')
      .addSelect(
        `CASE 
          WHEN message.sender_id = :userId THEN message.receiver_id 
          ELSE message.sender_id 
        END`,
        'other_user_id'
      )
      .where('message.sender_id = :userId OR message.receiver_id = :userId', { userId })
      .groupBy('other_user_id')
      .orderBy('lastMessageTime', 'DESC')
      .getRawMany();

    // Get details for each conversation
    const result: Conversation[] = [];
    for (const conv of conversations) {
      const otherUser = await this.userRepository.findOne({
        where: { id: conv.otherUserId },
        relations: ['profile'],
      });

      if (!otherUser) continue;

      // Get last message
      const lastMessage = await this.messageRepository
        .createQueryBuilder('message')
        .where(
          '(message.sender_id = :userId AND message.receiver_id = :otherUserId) OR (message.sender_id = :otherUserId AND message.receiver_id = :userId)',
          { userId, otherUserId: conv.otherUserId }
        )
        .orderBy('message.created_at', 'DESC')
        .getOne();

      // Count unread messages from this user
      const unreadCount = await this.messageRepository.count({
        where: {
          sender: { id: conv.otherUserId },
          receiver: { id: userId },
          isRead: false,
        },
      });

      result.push({
        id: conv.otherUserId,
        participants: [userId, conv.otherUserId],
        otherUser: {
          id: otherUser.id,
          displayName: otherUser.profile?.displayName || 'Anonymous',
          profilePicture: null,
        },
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              createdAt: lastMessage.createdAt,
              senderId: lastMessage.sender.id,
            }
          : undefined,
        updatedAt: lastMessage ? lastMessage.createdAt : undefined,
        unreadCount,
      });
    }

    return result;
  }
}
