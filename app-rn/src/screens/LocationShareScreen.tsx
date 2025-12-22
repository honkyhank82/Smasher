import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { theme } from '../config/theme';
import LocationShareService from '../services/LocationShareService';
import { LocationShare, SHARE_DURATIONS } from '../types/locationShare';

export const LocationShareScreen = ({ route, navigation }: any) => {
  const { userId, userName } = route.params;
  const [loading, setLoading] = useState(false);
  const [myShares, setMyShares] = useState<LocationShare[]>([]);
  const [showDurationModal, setShowDurationModal] = useState(false);

  useEffect(() => {
    loadMyShares();
  }, []);

  const loadMyShares = async () => {
    try {
      const shares = await LocationShareService.getMyShares();
      setMyShares(shares);
    } catch (error) {
      console.error('Failed to load shares:', error);
    }
  };

  const handleStartSharing = async (durationMinutes: number) => {
    setShowDurationModal(false);
    setLoading(true);

    try {
      await LocationShareService.startSharing({
        sharedWithUserId: userId,
        durationMinutes,
      });

      Alert.alert(
        'Location Sharing Started',
        `You're now sharing your location with ${userName} for ${getDurationLabel(durationMinutes)}.`
      );

      await loadMyShares();
    } catch (error: any) {
      Alert.alert(
        'Failed to Share Location',
        error.response?.data?.message || error.message || 'Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStopSharing = async (shareId: string) => {
    Alert.alert(
      'Stop Sharing Location?',
      'The other user will no longer see your location.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop Sharing',
          style: 'destructive',
          onPress: async () => {
            try {
              await LocationShareService.stopSharing(shareId);
              Alert.alert('Location Sharing Stopped');
              await loadMyShares();
            } catch (error: any) {
              Alert.alert('Error', 'Failed to stop sharing location');
            }
          },
        },
      ]
    );
  };

  const getDurationLabel = (minutes: number): string => {
    const duration = SHARE_DURATIONS.find((d) => d.value === minutes);
    return duration?.label || `${minutes} minutes`;
  };

  const getTimeRemaining = (expiresAt: Date): string => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  const renderShare = ({ item }: { item: LocationShare }) => (
    <View style={styles.shareCard}>
      <View style={styles.shareInfo}>
        <Text style={styles.shareTitle}>Sharing with {userName}</Text>
        <Text style={styles.shareTime}>{getTimeRemaining(item.expiresAt)}</Text>
        <Text style={styles.shareStatus}>
          {item.isActive ? '🟢 Active' : '🔴 Inactive'}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.stopButton}
        onPress={() => handleStopSharing(item.id)}
      >
        <Text style={styles.stopButtonText}>Stop</Text>
      </TouchableOpacity>
    </View>
  );

  const activeShare = myShares.find(
    (share) => share.sharedWithUserId === userId && share.isActive
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Share Location</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>📍</Text>
          <Text style={styles.infoTitle}>Share Your Live Location</Text>
          <Text style={styles.infoText}>
            {userName} will see your real-time location for the duration you choose.
            You can stop sharing at any time.
          </Text>
        </View>

        {activeShare ? (
          <View style={styles.activeShareSection}>
            <Text style={styles.sectionTitle}>Active Share</Text>
            <FlatList
              data={[activeShare]}
              renderItem={renderShare}
              keyExtractor={(item) => item.id}
            />
          </View>
        ) : (
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => setShowDurationModal(true)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.startButtonIcon}>📍</Text>
                <Text style={styles.startButtonText}>Start Sharing Location</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Safety Info */}
        <View style={styles.safetyCard}>
          <Text style={styles.safetyTitle}>🔒 Privacy & Safety</Text>
          <Text style={styles.safetyText}>
            • Your location is only shared with {userName}{'\n'}
            • Sharing automatically stops after the time limit{'\n'}
            • You can stop sharing anytime{'\n'}
            • Location data is encrypted
          </Text>
        </View>
      </View>

      {/* Duration Selection Modal */}
      <Modal
        visible={showDurationModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDurationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>How long?</Text>
            <Text style={styles.modalSubtitle}>
              Choose how long to share your location
            </Text>

            <FlatList
              data={SHARE_DURATIONS}
              keyExtractor={(item) => item.value.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.durationOption}
                  onPress={() => handleStartSharing(item.value)}
                >
                  <Text style={styles.durationLabel}>{item.label}</Text>
                  <Text style={styles.durationArrow}>→</Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowDurationModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  infoIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.sm,
  },
  infoTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  startButtonIcon: {
    fontSize: 24,
    marginRight: theme.spacing.sm,
  },
  startButtonText: {
    color: '#fff',
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
  activeShareSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  shareCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shareInfo: {
    flex: 1,
  },
  shareTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  shareTime: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  shareStatus: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  stopButton: {
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: theme.fontSize.sm,
    fontWeight: 'bold',
  },
  safetyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
  },
  safetyTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  safetyText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  modalSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  durationOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  durationLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  durationArrow: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.primary,
  },
  modalCancelButton: {
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  modalCancelText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
});
