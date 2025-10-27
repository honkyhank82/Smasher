import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from './api';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  /**
   * Register for push notifications and save token to backend
   */
  async registerForPushNotifications(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.log('Push notifications only work on physical devices');
        return null;
      }

      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Push notification permission not granted');
        return null;
      }

      // Get push token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'edef8952-a01b-408f-abeb-e3922973df75',
      });

      console.log('Push token:', token.data);

      // Save token to backend
      await this.savePushToken(token.data);

      // Configure Android channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return token.data;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  /**
   * Save push token to backend
   */
  async savePushToken(token: string): Promise<void> {
    try {
      await api.put('/users/push-token', { pushToken: token });
      console.log('Push token saved to backend');
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  }

  /**
   * Remove push token from backend (on logout)
   */
  async removePushToken(): Promise<void> {
    try {
      await api.delete('/users/push-token');
      console.log('Push token removed from backend');
    } catch (error) {
      console.error('Error removing push token:', error);
    }
  }

  /**
   * Add notification received listener
   */
  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void,
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
  }

  /**
   * Add notification response listener (when user taps notification)
   */
  addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void,
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  /**
   * Get badge count
   */
  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Clear badge
   */
  async clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  }

  /**
   * Dismiss all notifications
   */
  async dismissAllNotifications(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
  }
}

export default new NotificationService();
