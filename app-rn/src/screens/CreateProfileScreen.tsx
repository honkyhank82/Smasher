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

interface CreateProfileScreenProps {
  navigation: any;
}

export const CreateProfileScreen = ({ navigation }: CreateProfileScreenProps) => {
  const { refreshUser } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
   const [showAge, setShowAge] = useState(true);
   const [heightInches, setHeightInches] = useState('');
   const [weightLbs, setWeightLbs] = useState('');
   const [ethnicity, setEthnicity] = useState('');
   const [bodyType, setBodyType] = useState('');
   const [sexualPosition, setSexualPosition] = useState('');
   const [relationshipStatus, setRelationshipStatus] = useState('');
   const [lookingFor, setLookingFor] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
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
      setProfilePicture(result.assets[0].uri);
    }
  };

  const uploadProfilePicture = async (imageUri: string): Promise<string> => {
    try {
      console.log('📤 Step 1: Getting signed URL from server...');
      // Get signed upload URL from backend
      const { data } = await api.post('/media/signed-upload', {
        fileName: `profile_${Date.now()}.jpg`,
        fileType: 'image/jpeg',
      });
      console.log('✅ Step 1 complete: Got signed URL');

      console.log('📤 Step 2: Reading image from device...');
      // Upload to Cloudflare R2 using signed URL with timeout
      const imageResponse = await fetch(imageUri);
      if (!imageResponse.ok) {
        throw new Error('Failed to read image from device');
      }
      const imageBlob = await imageResponse.blob();
      console.log(`✅ Step 2 complete: Image size = ${imageBlob.size} bytes (${(imageBlob.size / 1024 / 1024).toFixed(2)} MB)`);

      console.log('📤 Step 3: Uploading to Cloudflare R2...');
      const uploadResponse = await Promise.race([
        fetch(data.uploadUrl, {
          method: 'PUT',
          body: imageBlob,
          headers: {
            'Content-Type': 'image/jpeg',
          },
        }),
        new Promise<Response>((_, reject) =>
          setTimeout(() => reject(new Error('Upload timeout')), 60000)
        ),
      ]);

      if (!uploadResponse.ok) {
        console.error(`❌ Upload failed with status ${uploadResponse.status}: ${uploadResponse.statusText}`);
        throw new Error(`Upload failed with status ${uploadResponse.status}: ${uploadResponse.statusText}`);
      }
      console.log('✅ Step 3 complete: Upload successful!');

      return data.fileKey; // Return the file key for backend storage
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });
      
      const errorMsg = error.message?.includes('413')
        ? 'Image file is too large. Please try a different photo or reduce quality.'
        : error.message?.includes('Network request failed')
        ? 'Network connection failed. Please check your internet connection.'
        : error.message?.includes('timeout')
        ? 'Upload timed out. Please try again with a smaller image.'
        : error.message || 'Failed to upload profile picture';
      throw new Error(errorMsg);
    }
  };

  const handleCreateProfile = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Please enter a display name');
      return;
    }

    setLoading(true);
    try {
      const heightInchesNum = heightInches ? parseInt(heightInches, 10) : null;
      const weightLbsNum = weightLbs ? parseInt(weightLbs, 10) : null;

      // Create profile first
      await api.patch('/profiles/me', {
        displayName: displayName.trim(),
        bio: bio.trim(),
        showAge,
        heightIn: heightInchesNum,
        weightLbs: weightLbsNum,
        ethnicity: ethnicity.trim() || null,
        bodyType: bodyType.trim() || null,
        sexualPosition: sexualPosition.trim() || null,
        relationshipStatus: relationshipStatus.trim() || null,
        lookingFor: lookingFor.trim() || null,
      });

      // Upload profile picture if provided (optional)
      if (profilePicture) {
        try {
          const pictureKey = await uploadProfilePicture(profilePicture);
          await api.post('/media/set-profile-picture', {
            fileKey: pictureKey,
          });
        } catch (uploadError: any) {
          console.error('Profile picture upload failed:', uploadError);
          // Continue anyway - profile picture is optional
          Alert.alert(
            'Profile Created',
            'Your profile was created but the picture upload failed. You can add it later.',
            [{ text: 'OK', onPress: async () => await refreshUser() }]
          );
          return;
        }
      }

      // Refresh user data to update hasProfile flag
      await refreshUser();
      Alert.alert('Success', 'Profile created successfully!');
    } catch (error: any) {
      console.error('Profile creation failed:', error);
      
      // Handle validation errors (array of messages)
      let errorMessage = 'Failed to create profile';
      if (error.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          errorMessage = error.response.data.message.join('\n');
        } else {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Your Profile</Text>
        <Text style={styles.subtitle}>Tell others about yourself</Text>
      </View>

      <TouchableOpacity style={styles.imageContainer} onPress={handlePickImage}>
        {profilePicture ? (
          <Image source={{ uri: profilePicture }} style={styles.profileImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>+</Text>
            <Text style={styles.imagePlaceholderLabel}>Add Photo (Optional)</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.form}>
        <Text style={styles.label}>Display Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="How should others see you?"
          placeholderTextColor={theme.colors.textSecondary}
          value={displayName}
          onChangeText={setDisplayName}
          maxLength={30}
        />

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

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleCreateProfile}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.text} />
        ) : (
          <Text style={styles.buttonText}>Create Profile</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        Your profile will be visible to other users. Make sure to follow our
        community guidelines.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  imageContainer: {
    alignSelf: 'center',
    marginBottom: theme.spacing.xl,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  imagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 48,
    color: theme.colors.textSecondary,
  },
  imagePlaceholderLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  form: {
    marginBottom: theme.spacing.xl,
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
    marginBottom: theme.spacing.md,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    textAlign: 'right',
    marginTop: -theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
  },
  disclaimer: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.xs,
    textAlign: 'center',
    lineHeight: 18,
  },
});
