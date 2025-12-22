import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User } from './user.entity';
import { Message } from '../chat/message.entity';
import { NotificationService } from '../notifications/notification.service';

@Injectable()
export class AdminMessageService {
  private readonly logger = new Logger(AdminMessageService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private notificationService: NotificationService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkNewUsers() {
    this.logger.log('Checking for new users to send admin welcome message...');
    
    // Find users created between 10 and 20 minutes ago
    const now = new Date();
    const twentyMinutesAgo = new Date(now.getTime() - 20 * 60 * 1000);
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

    const newUsers = await this.userRepository.find({
      where: {
        createdAt: Between(twentyMinutesAgo, tenMinutesAgo),
        isSeeded: false, // Don't message seeded profiles
        isAdmin: false,
      },
      relations: ['profile']
    });

    if (newUsers.length === 0) {
      return;
    }

    // Find an admin user to send messages from
    const adminUser = await this.userRepository.findOne({
      where: { isAdmin: true },
      relations: ['profile']
    });

    if (!adminUser) {
      this.logger.warn('No admin user found to send welcome messages.');
      return;
    }

    for (const user of newUsers) {
      // Check if already messaged by admin
      const existingMessage = await this.messageRepository.findOne({
        where: {
          sender: { id: adminUser.id },
          receiver: { id: user.id },
        }
      });

      if (!existingMessage) {
        await this.sendWelcomeMessage(adminUser, user);
      }
    }
  }

  private async sendWelcomeMessage(admin: User, user: User) {
    try {
      const content = "Welcome to Smasher! 👋 Thanks for joining. If you have any questions or need help getting started, feel free to ask here. Happy smashing!";
      
      const message = this.messageRepository.create({
        sender: { id: admin.id },
        receiver: { id: user.id },
        content,
        isRead: false,
      });

      await this.messageRepository.save(message);

      // Send push notification
      await this.notificationService.sendPushNotification(
        user.id,
        `Welcome from ${admin.profile?.displayName || 'Admin'}`,
        content,
        {
          type: 'message',
          senderId: admin.id,
          displayName: admin.profile?.displayName || 'Admin',
          messageId: message.id,
        }
      );

      this.logger.log(`Sent welcome message to user ${user.id} (${user.email})`);
    } catch (error) {
      this.logger.error(`Failed to send welcome message to ${user.id}`, error);
    }
  }
}
