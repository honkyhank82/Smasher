import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Updates from 'expo-updates';
import { theme } from '../config/theme';

export const UpdateDebugScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<any>(null);

  useEffect(() => {
    loadUpdateInfo();
  }, []);

  const loadUpdateInfo = async () => {
    try {
      const info = {
        isEnabled: Updates.isEnabled,
        isEmbeddedLaunch: Updates.isEmbeddedLaunch,
        updateId: Updates.updateId,
        runtimeVersion: Updates.runtimeVersion,
        channel: Updates.channel,
        createdAt: Updates.createdAt,
        manifest: Updates.manifest,
      };
      setUpdateInfo(info);
    } catch (error) {
      console.error('Error loading update info:', error);
    }
  };

  const handleCheckForUpdates = async () => {
    setLoading(true);
    try {
      console.log('🔍 Checking for updates...');
      const update = await Updates.checkForUpdateAsync();
      
      console.log('Update check result:', {
        isAvailable: update.isAvailable,
        manifest: update.manifest,
      });

      if (update.isAvailable) {
        Alert.alert(
          'Update Available!',
          `Update ID: ${update.manifest?.id || 'unknown'}\n\nDownload now?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Download',
              onPress: async () => {
                try {
                  console.log('📥 Downloading update...');
                  const result = await Updates.fetchUpdateAsync();
                  console.log('Download result:', result);
                  
                  Alert.alert(
                    'Update Downloaded',
                    'Reload app now to apply?',
                    [
                      { text: 'Later', style: 'cancel' },
                      {
                        text: 'Reload Now',
                        onPress: async () => {
                          console.log('🔄 Reloading app...');
                          await Updates.reloadAsync();
                        },
                      },
                    ]
                  );
                } catch (error: any) {
                  console.error('Download error:', error);
                  Alert.alert('Download Failed', error.message);
                }
              },
            },
          ]
        );
      } else {
        Alert.alert('No Updates', 'You are running the latest version!');
      }
    } catch (error: any) {
      console.error('Check error:', error);
      Alert.alert('Check Failed', `Error: ${error.message}`);
    } finally {
      setLoading(false);
      loadUpdateInfo();
    }
  };

  const handleReload = async () => {
    try {
      await Updates.reloadAsync();
    } catch (error: any) {
      Alert.alert('Reload Failed', error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Update Debug</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Update Info</Text>
        
        {updateInfo ? (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Updates Enabled:</Text>
              <Text style={styles.value}>{updateInfo.isEnabled ? '✅ Yes' : '❌ No'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Embedded Launch:</Text>
              <Text style={styles.value}>{updateInfo.isEmbeddedLaunch ? '✅ Yes' : '❌ No'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Update ID:</Text>
              <Text style={styles.valueSmall}>{updateInfo.updateId || 'None'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Runtime Version:</Text>
              <Text style={styles.value}>{updateInfo.runtimeVersion || 'Unknown'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Channel:</Text>
              <Text style={styles.value}>{updateInfo.channel || 'None'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Created At:</Text>
              <Text style={styles.valueSmall}>
                {updateInfo.createdAt ? new Date(updateInfo.createdAt).toLocaleString() : 'Unknown'}
              </Text>
            </View>
          </>
        ) : (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleCheckForUpdates}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Check for Updates</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={handleReload}
        >
          <Text style={styles.buttonText}>Reload App</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={loadUpdateInfo}
        >
          <Text style={styles.buttonText}>Refresh Info</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Expected Values</Text>
        <Text style={styles.infoText}>
          Runtime Version: 1.0.3{'\n'}
          Channel: production{'\n'}
          Updates Enabled: Yes{'\n'}
          {'\n'}
          If "Embedded Launch" is Yes, you're running the original build.{'\n'}
          If it's No, you're running an OTA update.
        </Text>
      </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingTop: 50,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.primary,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  section: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: '600',
  },
  valueSmall: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontFamily: 'monospace',
  },
  infoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  buttonSecondary: {
    backgroundColor: theme.colors.surface,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
});
