import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Updates from 'expo-updates';
import { theme } from '../config/theme';
import { useAuth } from '../context/AuthContext';
import { usePremium } from '../contexts/PremiumContext';
import api from '../services/api';

export const SettingsScreen = ({ navigation }: any) => {
  const { logout } = useAuth();
  const { isPremium, subscriptionStatus } = usePremium();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [locationEnabled, setLocationEnabled] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  // Helper to navigate to parent stack screens
  const navigateToScreen = (screenName: string) => {
    // Get the parent navigator (Stack) from the tab navigator
    navigation.getParent()?.navigate(screenName);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: logout, style: 'destructive' },
    ]);
  };

  const handleDeactivateAccount = () => {
    Alert.alert(
      'Deactivate Account',
      'Your profile will be hidden and you won\'t receive any notifications. You can reactivate anytime by logging in.\n\nAre you sure you want to deactivate your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const response = await api.post('/users/deactivate');
              Alert.alert('Account Deactivated', response.data.message, [
                { text: 'OK', onPress: logout },
              ]);
            } catch (error: any) {
              console.error('Deactivate error:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to deactivate account');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data after 30 days. You can cancel the deletion within this period.\n\nAre you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Second confirmation
            Alert.alert(
              'Final Confirmation',
              'This action cannot be undone after 30 days. All your messages, matches, and profile data will be permanently deleted.\n\nType DELETE to confirm:',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'I Understand, Delete My Account',
                  style: 'destructive',
                  onPress: async () => {
                    setLoading(true);
                    try {
                      const response = await api.post('/users/delete');
                      Alert.alert(
                        'Deletion Scheduled',
                        `${response.data.message}\n\nDeletion Date: ${new Date(response.data.deletionDate).toLocaleDateString()}`,
                        [{ text: 'OK', onPress: logout }]
                      );
                    } catch (error: any) {
                      console.error('Delete error:', error);
                      Alert.alert('Error', error.response?.data?.message || 'Failed to delete account');
                    } finally {
                      setLoading(false);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleCheckForUpdates = async () => {
    if (__DEV__) {
      Alert.alert('Development Mode', 'Updates are disabled in development mode');
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Manually checking for updates...');
      const update = await Updates.checkForUpdateAsync();
      
      if (update.isAvailable) {
        Alert.alert(
          'Update Available',
          'A new version is available. Download and install now?',
          [
            { text: 'Later', style: 'cancel' },
            {
              text: 'Update Now',
              onPress: async () => {
                try {
                  console.log('📥 Downloading update...');
                  await Updates.fetchUpdateAsync();
                  console.log('✅ Update downloaded, reloading...');
                  await Updates.reloadAsync();
                } catch (error) {
                  console.error('Update error:', error);
                  Alert.alert('Update Failed', 'Failed to download update. Please try again.');
                }
              },
            },
          ]
        );
      } else {
        Alert.alert('Up to Date', 'You are running the latest version!');
      }
    } catch (error: any) {
      console.error('Check for updates error:', error);
      Alert.alert('Error', `Failed to check for updates: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Text style={styles.settingDescription}>Receive match and message notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Location Services</Text>
            <Text style={styles.settingDescription}>Allow app to access your location</Text>
          </View>
          <Switch
            value={locationEnabled}
            onValueChange={setLocationEnabled}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Premium</Text>
        
        {isPremium ? (
          <TouchableOpacity 
            style={[styles.menuItem, styles.premiumMenuItem]}
            onPress={() => navigateToScreen('ManageSubscription')}
          >
            <View>
              <Text style={[styles.menuItemText, styles.premiumText]}>✨ Premium Active</Text>
              <Text style={styles.premiumSubtext}>
                {subscriptionStatus?.subscription?.cancelAtPeriodEnd 
                  ? 'Expires: ' + new Date(subscriptionStatus.subscription.currentPeriodEnd).toLocaleDateString()
                  : 'Renews: ' + new Date(subscriptionStatus?.subscription?.currentPeriodEnd || '').toLocaleDateString()
                }
              </Text>
            </View>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.menuItem, styles.upgradeMenuItem]}
            onPress={() => navigateToScreen('PremiumUpgrade')}
          >
            <View>
              <Text style={[styles.menuItemText, styles.upgradeText]}>✨ Upgrade to Premium</Text>
              <Text style={styles.upgradeSubtext}>Extended range, see all viewers & more - $9.99/month</Text>
            </View>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigateToScreen('ChangeEmail')}
        >
          <Text style={styles.menuItemText}>Change Email</Text>
          <Text style={styles.menuItemArrow}>→</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigateToScreen('BackendService')}
        >
          <Text style={styles.menuItemText}>Backend Services</Text>
          <Text style={styles.menuItemArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigateToScreen('PrivacySettings')}
        >
          <Text style={styles.menuItemText}>Privacy Settings</Text>
          <Text style={styles.menuItemArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigateToScreen('BlockedUsers')}
        >
          <Text style={styles.menuItemText}>Blocked Users</Text>
          <Text style={styles.menuItemArrow}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigateToScreen('UpdateDebug')}
        >
          <Text style={styles.menuItemText}>Update Debug Info</Text>
          <Text style={styles.menuItemArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={handleCheckForUpdates}
          disabled={loading}
        >
          <Text style={styles.menuItemText}>Check for Updates</Text>
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Text style={styles.menuItemArrow}>→</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigateToScreen('TermsOfService')}
        >
          <Text style={styles.menuItemText}>Terms of Service</Text>
          <Text style={styles.menuItemArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigateToScreen('PrivacyPolicy')}
        >
          <Text style={styles.menuItemText}>Privacy Policy</Text>
          <Text style={styles.menuItemArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigateToScreen('HelpSupport')}
        >
          <Text style={styles.menuItemText}>Help & Support</Text>
          <Text style={styles.menuItemArrow}>→</Text>
        </TouchableOpacity>

        <View style={styles.menuItem}>
          <Text style={styles.menuItemText}>Version</Text>
          <Text style={styles.versionText}>1.0.1</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        
        <TouchableOpacity 
          style={styles.dangerButton} 
          onPress={handleDeactivateAccount}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ff9800" />
          ) : (
            <>
              <Text style={styles.dangerButtonText}>Deactivate Account</Text>
              <Text style={styles.dangerButtonDescription}>
                Temporarily hide your profile
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.dangerButton, styles.deleteButton]} 
          onPress={handleDeleteAccount}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ff4444" />
          ) : (
            <>
              <Text style={[styles.dangerButtonText, styles.deleteButtonText]}>
                Delete Account
              </Text>
              <Text style={styles.dangerButtonDescription}>
                Permanently delete your account and data
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
  section: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  settingLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  settingDescription: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  menuItemText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  menuItemArrow: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
  },
  versionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  dangerButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: '#ff9800',
  },
  dangerButtonText: {
    fontSize: theme.fontSize.md,
    color: '#ff9800',
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  dangerButtonDescription: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  deleteButton: {
    borderColor: '#ff4444',
  },
  deleteButtonText: {
    color: '#ff4444',
  },
  logoutButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    margin: theme.spacing.md,
    marginTop: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  logoutButtonText: {
    color: '#ff4444',
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
  premiumMenuItem: {
    backgroundColor: '#1a1a1a',
    borderColor: '#8B0000',
    borderWidth: 2,
  },
  premiumText: {
    color: '#8B0000',
    fontWeight: 'bold',
  },
  premiumSubtext: {
    fontSize: theme.fontSize.xs,
    color: '#999',
    marginTop: 4,
  },
  upgradeMenuItem: {
    backgroundColor: '#2a1a1a',
    borderColor: '#8B0000',
    borderWidth: 2,
  },
  upgradeText: {
    color: '#8B0000',
    fontWeight: 'bold',
  },
  upgradeSubtext: {
    fontSize: theme.fontSize.xs,
    color: '#ccc',
    marginTop: 4,
  },
});
