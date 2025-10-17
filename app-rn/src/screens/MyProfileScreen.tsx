import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { theme } from '../config/theme';
import { useAuth } from '../context/AuthContext';

export const MyProfileScreen = ({ navigation }: any) => {
  const { user } = useAuth();

  // Helper to navigate to parent stack screens
  const navigateToScreen = (screenName: string) => {
    navigation.getParent()?.navigate(screenName);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Profile</Text>
        <TouchableOpacity onPress={() => navigateToScreen('EditProfile')}>
          <Text style={styles.editButton}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <Image
          source={{ uri: user?.profile?.profilePicture || 'https://via.placeholder.com/150' }}
          style={styles.profileImage}
          resizeMode="cover"
        />
        <Text style={styles.displayName}>{user?.profile?.displayName || 'No name set'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bio</Text>
        <Text style={styles.bio}>{user?.profile?.bio || 'No bio yet'}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Gallery</Text>
          <TouchableOpacity onPress={() => navigateToScreen('Gallery')}>
            <Text style={styles.manageButton}>Manage →</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionDescription}>
          Add up to 6 photos to show off your personality
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Profile Viewers</Text>
          <TouchableOpacity onPress={() => navigateToScreen('ProfileViewers')}>
            <Text style={styles.manageButton}>View →</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionDescription}>
          See who has viewed your profile
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigateToScreen('EditProfile')}
      >
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>
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
  editButton: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
  },
  profileSection: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
  },
  displayName: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  email: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  section: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  manageButton: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  bio: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 22,
  },
  sectionDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    margin: theme.spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
});
