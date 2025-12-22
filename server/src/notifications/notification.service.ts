import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { User } from '../users/user.entity';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

@Injectable()
export class NotificationService {
  private expo: Expo;

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    this.expo = new Expo();
  }

  /**
   * Send push notification
   */
  async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: any,
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user || !user.pushToken) {
      console.log(`No push token for user ${userId}`);
      return;
    }

    // Validate push token
    if (!Expo.isExpoPushToken(user.pushToken)) {
      console.error(`Invalid push token for user ${userId}: ${user.pushToken}`);
      return;
    }

    const message: ExpoPushMessage = {
      to: user.pushToken,
      sound: 'default',
      title,
      body,
      data: data || {},
    };

    try {
      const chunks = this.expo.chunkPushNotifications([message]);
      for (const chunk of chunks) {
        await this.expo.sendPushNotificationsAsync(chunk);
      }
      console.log(`Push notification sent to user ${userId}`);
    } catch (error) {
      console.error(
        `Error sending push notification to user ${userId}:`,
        error,
      );
    }
  }

  /**
   * Create notification record
   */
  async createNotification(
    userId: string,
    type: string,
    title: string,
    body: string,
    data?: any,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      userId,
      type,
      title,
      body,
      data,
      read: false,
    });

    return this.notificationRepository.save(notification);
  }

  /**
   * Send location share started notification
   */
  async sendLocationShareStarted(
    recipientUserId: string,
    senderUserId: string,
    durationMinutes: number,
  ): Promise<void> {
    const sender = await this.userRepository.findOne({
      where: { id: senderUserId },
      relations: ['profile'],
    });

    if (!sender || !sender.profile) return;

    const durationText = this.formatDuration(durationMinutes);
    const title = '📍 Location Shared';
    const body = `${sender.profile.displayName} is sharing their location with you for ${durationText}`;

    await this.createNotification(
      recipientUserId,
      'location_share_started',
      title,
      body,
      { senderUserId, durationMinutes },
    );

    await this.sendPushNotification(recipientUserId, title, body, {
      type: 'location_share_started',
      senderUserId,
    });
  }

  /**
   * Send location share stopped notification
   */
  async sendLocationShareStopped(
    recipientUserId: string,
    senderUserId: string,
  ): Promise<void> {
    const sender = await this.userRepository.findOne({
      where: { id: senderUserId },
      relations: ['profile'],
    });

    if (!sender || !sender.profile) return;

    const title = '📍 Location Sharing Ended';
    const body = `${sender.profile.displayName} stopped sharing their location`;

    await this.createNotification(
      recipientUserId,
      'location_share_stopped',
      title,
      body,
      { senderUserId },
    );

    await this.sendPushNotification(recipientUserId, title, body, {
      type: 'location_share_stopped',
      senderUserId,
    });
  }

  /**
   * Send location share expired notification
   */
  async sendLocationShareExpired(
    recipientUserId: string,
    senderUserId: string,
  ): Promise<void> {
    const sender = await this.userRepository.findOne({
      where: { id: senderUserId },
      relations: ['profile'],
    });

    if (!sender || !sender.profile) return;

    const title = '📍 Location Sharing Expired';
    const body = `${sender.profile.displayName}'s location share has expired`;

    await this.createNotification(
      recipientUserId,
      'location_share_expired',
      title,
      body,
      { senderUserId },
    );

    await this.sendPushNotification(recipientUserId, title, body, {
      type: 'location_share_expired',
      senderUserId,
    });
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(
    userId: string,
    limit: number = 50,
  ): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    await this.notificationRepository.update(
      { id: notificationId },
      { read: true },
    );
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, read: false },
      { read: true },
    );
  }

  /**
   * Format duration for display
   */
  private formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    return hours === 1 ? '1 hour' : `${hours} hours`;
  }
}
