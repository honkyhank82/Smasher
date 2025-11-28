import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../config/theme';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const EditProfileScreen = ({ navigation }: any) => {
  const { user, refreshUser } = useAuth();
  const [displayName, setDisplayName] = useState(user?.profile?.displayName || '');
  const [bio, setBio] = useState(user?.profile?.bio || '');
  const [showAge, setShowAge] = useState(
    user?.profile?.showAge !== undefined ? user.profile.showAge : true,
  );
  const [heightInches, setHeightInches] = useState(
    user?.profile?.heightCm != null
      ? String(Math.round(user.profile.heightCm / 2.54))
      : '',
  );
  const [weightLbs, setWeightLbs] = useState(
    user?.profile?.weightKg != null
      ? String(Math.round(user.profile.weightKg * 2.20462))
      : '',
  );
  const [ethnicity, setEthnicity] = useState(user?.profile?.ethnicity || '');
  const [bodyType, setBodyType] = useState(user?.profile?.bodyType || '');
  const [sexualPosition, setSexualPosition] = useState(
    user?.profile?.sexualPosition || '',
  );
  const [relationshipStatus, setRelationshipStatus] = useState(
    user?.profile?.relationshipStatus || '',
  );
  const [lookingFor, setLookingFor] = useState(user?.profile?.lookingFor || '');
  const [profilePicture, setProfilePicture] = useState<string | null>(
    user?.profile?.profilePicture || null
  );
  const [newProfilePicture, setNewProfilePicture] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant photo library access to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5, // Reduced quality to compress file size
      base64: false,
      exif: false,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setProfilePicture(asset.uri);
      setNewProfilePicture(asset);
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Please enter a display name');
      return;
    }

    setLoading(true);
    try {
      const heightInchesNum = heightInches ? parseInt(heightInches, 10) : null;
      const weightLbsNum = weightLbs ? parseInt(weightLbs, 10) : null;

      // Update profile text fields
      await api.patch('/profiles/me', {
        displayName: displayName.trim(),
        bio: bio.trim(),
        showAge,
        heightCm: heightInchesNum != null ? Math.round(heightInchesNum * 2.54) : null,
        weightKg: weightLbsNum != null ? Math.round(weightLbsNum / 2.20462) : null,
        ethnicity: ethnicity.trim() || null,
        bodyType: bodyType.trim() || null,
        sexualPosition: sexualPosition.trim() || null,
        relationshipStatus: relationshipStatus.trim() || null,
        lookingFor: lookingFor.trim() || null,
      });

      // Handle profile picture upload if changed
      if (newProfilePicture && newProfilePicture.uri && newProfilePicture.fileName && newProfilePicture.type) {
        try {
          // Step 1: Get signed upload URL
          const signedUrlResponse = await api.post('/media/signed-upload', {
            fileName: newProfilePicture.fileName,
            fileType: newProfilePicture.type,
            mediaType: 'photo',
          });

          const { uploadUrl, fileKey } = signedUrlResponse.data;

          // Step 2: Upload file to R2 with timeout
          const fileData = await fetch(newProfilePicture.uri);
          if (!fileData.ok) {
            throw new Error('Failed to read file from device');
          }
          const blob = await fileData.blob();
          
          const uploadResponse = await Promise.race([
            fetch(uploadUrl, {
              method: 'PUT',
              body: blob,
              headers: {
                'Content-Type': newProfilePicture.type,
              },
            }),
            new Promise<Response>((_, reject) =>
              setTimeout(() => reject(new Error('Upload timeout')), 60000)
            ),
          ]);

          if (!uploadResponse.ok) {
            throw new Error(`Upload failed with status ${uploadResponse.status}`);
          }

          // Step 3: Confirm upload and create media record
          const confirmResponse = await api.post('/media/confirm-upload', {
            fileKey,
            fileType: newProfilePicture.type,
            mediaType: 'photo',
          });

          // Step 4: Set as profile picture
          await api.post('/media/set-profile-picture', {
            mediaId: confirmResponse.data.id,
          });
        } catch (uploadError: any) {
          console.error('Profile picture upload error:', uploadError);
          const errorMsg = uploadError.message?.includes('Network request failed') 
            ? 'Network connection failed. Please check your internet connection.'
            : uploadError.message?.includes('timeout')
            ? 'Upload timed out. Please try again with a smaller image.'
            : 'Profile picture upload failed';
          Alert.alert('Warning', `Profile updated but ${errorMsg}`);
        }
      }

      await refreshUser();
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      let errorMessage = 'Failed to update profile';
      if (error.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          errorMessage = error.response.data.message.join('\n');
        } else {
          errorMessage = error.response.data.message;
        }
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          <Text style={[styles.saveButton, loading && styles.saveButtonDisabled]}>
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.imageContainer} onPress={handlePickImage}>
        <Image
          source={{ uri: profilePicture || 'https://via.placeholder.com/150' }}
          style={styles.profileImage}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay}>
          <Text style={styles.imageOverlayText}>Change Photo</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.form}>
        <Text style={styles.label}>Display Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Your name"
          placeholderTextColor={theme.colors.textSecondary}
          value={displayName}
          onChangeText={setDisplayName}
          maxLength={30}
        />
        <Text style={styles.charCount}>{displayName.length}/30</Text>

        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.bioInput]}
          placeholder="Tell us about yourself..."
          placeholderTextColor={theme.colors.textSecondary}
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={4}
          maxLength={200}
        />
        <Text style={styles.charCount}>{bio.length}/200</Text>

        <Text style={styles.sectionHeader}>Profile Details</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Show My Age</Text>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setShowAge(!showAge)}
          >
            <Text style={styles.toggleText}>{showAge ? 'On' : 'Off'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Height (inches)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 70"
          placeholderTextColor={theme.colors.textSecondary}
          value={heightInches}
          onChangeText={setHeightInches}
          keyboardType="numeric"
          maxLength={3}
        />

        <Text style={styles.label}>Weight (lbs)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 180"
          placeholderTextColor={theme.colors.textSecondary}
          value={weightLbs}
          onChangeText={setWeightLbs}
          keyboardType="numeric"
          maxLength={3}
        />

        <Text style={styles.label}>Ethnicity</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Latino, Black, White, Asian"
          placeholderTextColor={theme.colors.textSecondary}
          value={ethnicity}
          onChangeText={setEthnicity}
          maxLength={50}
        />

        <Text style={styles.label}>Body Type</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Slim, Average, Athletic, Muscular, Large"
          placeholderTextColor={theme.colors.textSecondary}
          value={bodyType}
          onChangeText={setBodyType}
          maxLength={50}
        />

        <Text style={styles.label}>Sexual Position</Text>
        <TextInput
          style={styles.input}
          placeholder="Top, Bottom, Vers, Vers Top, Vers Bottom"
          placeholderTextColor={theme.colors.textSecondary}
          value={sexualPosition}
          onChangeText={setSexualPosition}
          maxLength={50}
        />

        <Text style={styles.label}>Relationship Status</Text>
        <TextInput
          style={styles.input}
          placeholder="Single, In a relationship, Married, Open, etc."
          placeholderTextColor={theme.colors.textSecondary}
          value={relationshipStatus}
          onChangeText={setRelationshipStatus}
          maxLength={50}
        />

        <Text style={styles.label}>Looking For</Text>
        <TextInput
          style={styles.input}
          placeholder="Friends, Dates, Chat, Relationship, Hookup"
          placeholderTextColor={theme.colors.textSecondary}
          value={lookingFor}
          onChangeText={setLookingFor}
          maxLength={100}
        />
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}
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
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  saveButton: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  imageContainer: {
    alignSelf: 'center',
    marginVertical: theme.spacing.xl,
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.surface,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: theme.spacing.xs,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    alignItems: 'center',
  },
  imageOverlayText: {
    color: '#fff',
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },
  form: {
    padding: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    fontWeight: '600',
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xs,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    textAlign: 'right',
    marginBottom: theme.spacing.md,
  },
  sectionHeader: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  toggleButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  toggleText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
