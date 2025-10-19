import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { theme } from '../config/theme';
import api from '../config/api';

const { width } = Dimensions.get('window');

interface ProfileViewScreenProps {
  route: any;
  navigation: any;
}

interface UserProfile {
  id: string;
  displayName: string;
  age: number;
  bio?: string;
  distance: number;
  profilePicture?: string;
  gallery?: string[];
}

export const ProfileViewScreen = ({ route, navigation }: ProfileViewScreenProps) => {
  const { userId } = route.params;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadProfile();
    checkFavoriteStatus();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const response = await api.get(`/profiles/${userId}`);
      setProfile(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = () => {
    navigation.navigate('Chat', { userId, displayName: profile?.displayName });
  };

  const handleBlock = () => {
    Alert.alert(
      'Block User',
      `Are you sure you want to block ${profile?.displayName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post('/blocks', { blockedUserId: userId });
              setBlocked(true);
              Alert.alert('Blocked', 'User has been blocked');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to block user');
            }
          },
        },
      ]
    );
  };

  const handleReport = () => {
    Alert.alert(
      'Report User',
      'Why are you reporting this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Inappropriate Content',
          onPress: () => submitReport('inappropriate_content'),
        },
        {
          text: 'Harassment',
          onPress: () => submitReport('harassment'),
        },
        {
          text: 'Spam',
          onPress: () => submitReport('spam'),
        },
        {
          text: 'Other',
          onPress: () => submitReport('other'),
        },
      ]
    );
  };

  const submitReport = async (reason: string) => {
    try {
      await api.post('/reports', { reportedUserId: userId, reason });
      Alert.alert('Reported', 'Thank you for your report. We will review it shortly.');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit report');
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const response = await api.get(`/buddies/check/${userId}`);
      setIsFavorite(response.data.isBuddy);
    } catch (error) {
      console.error('Failed to check favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await api.delete(`/buddies/${userId}`);
        setIsFavorite(false);
        Alert.alert('Removed', 'Removed from favorites');
      } else {
        await api.post(`/buddies/${userId}`);
        setIsFavorite(true);
        Alert.alert('Added', 'Added to favorites');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: profile.profilePicture || 'https://via.placeholder.com/400' }}
        style={styles.headerImage}
      />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={toggleFavorite}
      >
        <Text style={styles.favoriteIcon}>{isFavorite ? '⭐' : '☆'}</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.name}>{profile.displayName}, {profile.age}</Text>
            <Text style={styles.distance}>{profile.distance} miles away</Text>
          </View>
        </View>

        {profile.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bio}>{profile.bio}</Text>
          </View>
        )}

        {profile.gallery && profile.gallery.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <View style={styles.gallery}>
              {profile.gallery.map((photo, index) => (
                <Image
                  key={index}
                  source={{ uri: photo }}
                  style={styles.galleryImage}
                />
              ))}
            </View>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleMessage}>
            <Text style={styles.primaryButtonText}>Message</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.shareLocationButton} 
            onPress={() => navigation.navigate('LocationShare', {
              userId: profile.id,
              userName: profile.displayName
            })}
          >
            <Text style={styles.shareLocationIcon}>📍</Text>
            <Text style={styles.shareLocationText}>Share Location</Text>
          </TouchableOpacity>

          <View style={styles.secondaryActions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleBlock}>
              <Text style={styles.secondaryButtonText}>Block</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleReport}>
              <Text style={styles.secondaryButtonText}>Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImage: {
    width: width,
    height: width,
    backgroundColor: theme.colors.surface,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: theme.colors.text,
    fontSize: 24,
  },
  favoriteButton: {
    position: 'absolute',
    top: 40,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteIcon: {
    fontSize: 24,
  },
  content: {
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  name: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  distance: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  bio: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  gallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  galleryImage: {
    width: (width - theme.spacing.lg * 2 - 8) / 3,
    height: (width - theme.spacing.lg * 2 - 8) / 3,
    margin: 4,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
  },
  actions: {
    marginTop: theme.spacing.lg,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  primaryButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
  shareLocationButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  shareLocationIcon: {
    fontSize: 20,
    marginRight: theme.spacing.xs,
  },
  shareLocationText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryButtonText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
});
