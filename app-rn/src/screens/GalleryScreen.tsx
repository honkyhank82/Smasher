import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { theme } from '../config/theme';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';

const { width } = Dimensions.get('window');
const imageSize = (width - theme.spacing.md * 4) / 3;

interface MediaItem {
  id: string;
  uri: string;
  type: 'photo' | 'video';
  isProfilePicture?: boolean;
}

export const GalleryScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      const response = await api.get('/media/my-media');
      setMedia(response.data.map((item: any) => ({
        id: item.id,
        uri: item.url,
        type: item.type,
        isProfilePicture: item.isProfilePicture,
      })));
    } catch (error) {
      console.error('Failed to load media:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const uploadToR2 = async (url: string, filePath: string, contentType: string) => {
    try {
      console.log('📤 Uploading file with axios...');
      console.log('File path:', filePath);
      
      // Fetch the file from local URI
      const fileResponse = await fetch(filePath);
      const blob = await fileResponse.blob();
      console.log('File loaded as blob, size:', blob.size);
      
      // Upload to R2 using axios
      console.log('Uploading to R2...');
      const response = await axios.put(url, blob, {
        headers: {
          'Content-Type': contentType,
        },
        timeout: 60000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });
      
      console.log('Upload response status:', response.status);
      console.log('✅ Upload successful');
      return { ok: true, status: response.status };
    } catch (error: any) {
      console.error('Upload error:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  };

  const handleAddMedia = async (type: 'photo' | 'video', retryCount: number = 0) => {
    if (media.length >= 6) {
      Alert.alert('Limit Reached', 'You can upload up to 6 photos/videos');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant photo library access to upload media.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: type === 'photo' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: type === 'photo',
      aspect: type === 'photo' ? [4, 3] : undefined,
      quality: 0.6, // Compressed to reduce file size
      videoMaxDuration: 60, // Limit video to 60 seconds
      base64: false,
      exif: false,
    });

    if (result.assets && result.assets[0]) {
      const asset = result.assets[0];
      if (asset.uri && asset.fileName && asset.type) {
        setLoading(true);
        try {
          console.log('=== UPLOAD START ===');
          console.log('File:', asset.fileName);
          console.log('Type:', asset.type);
          console.log('URI:', asset.uri);
          console.log('File size:', asset.fileSize);
          
          // Step 1: Get signed upload URL
          console.log('Step 1: Requesting signed URL from server...');
          const signedUrlResponse = await api.post('/media/signed-upload', {
            fileName: asset.fileName,
            fileType: asset.type,
            mediaType: type,
          });

          console.log('✓ Got upload endpoint');

          // Step 2: Upload file through backend proxy (avoids Android network issues)
          console.log('Step 2: Uploading file...');
          
          // Read file as base64
          const fileResponse = await fetch(asset.uri);
          const blob = await fileResponse.blob();
          const reader = new FileReader();
          
          const base64Data = await new Promise<string>((resolve, reject) => {
            reader.onloadend = () => {
              const result = reader.result as string;
              // Remove data URL prefix
              const base64 = result.split(',')[1];
              resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          
          console.log('File converted to base64, uploading...');
          
          // Upload through backend
          const uploadResponse = await api.post('/media/upload', {
            fileName: asset.fileName,
            fileType: asset.type,
            mediaType: type,
            fileData: base64Data,
          });

          console.log('✓ Upload successful');
          const confirmResponse = uploadResponse;

          console.log('✓ Upload confirmed, media record created');
          console.log('Media ID:', confirmResponse.data.id);
          console.log('=== UPLOAD COMPLETE ===');

          // Add to local state
          setMedia([...media, { 
            id: confirmResponse.data.id,
            uri: confirmResponse.data.url, 
            type: type 
          }]);
          Alert.alert('Success', `${type === 'photo' ? 'Photo' : 'Video'} added to gallery`);
        } catch (error: any) {
          console.error('❌ UPLOAD FAILED ❌');
          console.error('Error:', error);
          console.error('Error name:', error.name);
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
          console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            name: error.name,
            code: error.code,
          });
          
          let errorMessage = `Failed to upload ${type}`;
          let shouldRetry = false;
          let errorDetails = '';
          
          // Determine which step failed
          if (error.message?.includes('Failed to prepare file')) {
            errorDetails = 'Failed at: Step 2 (File conversion)';
          } else if (error.message?.includes('Upload failed with status')) {
            errorDetails = 'Failed at: Step 3 (R2 upload)';
          } else if (error.response?.config?.url?.includes('signed-upload')) {
            errorDetails = 'Failed at: Step 1 (Get signed URL)';
          } else if (error.response?.config?.url?.includes('confirm-upload')) {
            errorDetails = 'Failed at: Step 4 (Confirm upload)';
          }
          
          // Handle specific error cases
          if (error.message?.includes('Network request failed')) {
            errorMessage = 'Network connection failed. Please check your internet connection and try again.';
            shouldRetry = retryCount < 2;
            if (!errorDetails) errorDetails = 'Network connectivity issue';
          } else if (error.message?.includes('timeout') || error.message?.includes('Upload timeout')) {
            errorMessage = 'Upload timed out. The file may be too large or your connection is slow. Try a smaller image.';
            shouldRetry = retryCount < 1;
            if (!errorDetails) errorDetails = 'Upload timeout (60s limit exceeded)';
          } else if (error.response?.status === 403) {
            errorMessage = 'Upload permission denied. This may be a server configuration issue.';
            errorDetails = 'HTTP 403 - Check R2 credentials and CORS settings';
          } else if (error.response?.status === 401) {
            errorMessage = 'Authentication failed. Please log in again.';
            errorDetails = 'HTTP 401 - Token expired or invalid';
          } else if (error.response?.status === 500) {
            errorMessage = 'Server error occurred. Please try again later.';
            errorDetails = 'HTTP 500 - Server internal error';
          } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          // Show detailed error in development
          if (__DEV__) {
            errorMessage += `\n\n${errorDetails}\n\nDebug Info:\n${JSON.stringify({
              message: error.message,
              response: error.response?.data,
              status: error.response?.status,
              code: error.code,
            }, null, 2)}`;
          }
          
          console.log('Error summary:', errorDetails);
          console.log('User message:', errorMessage);
          console.log('Retry available:', shouldRetry);
          
          // Offer retry for network errors
          if (shouldRetry) {
            Alert.alert(
              'Upload Failed',
              `${errorMessage}\n\nWould you like to retry?`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Retry',
                  onPress: () => {
                    console.log(`🔄 Retrying upload (attempt ${retryCount + 2})...`);
                    // Re-trigger the image picker with the same type
                    handleAddMedia(type, retryCount + 1);
                  },
                },
              ]
            );
          } else {
            Alert.alert('Upload Error', errorMessage);
          }
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const handleDeleteMedia = (index: number) => {
    const item = media[index];
    Alert.alert(
      `Delete ${item.type === 'photo' ? 'Photo' : 'Video'}`,
      `Are you sure you want to delete this ${item.type}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post('/media/delete', { mediaId: item.id });
              const newMedia = media.filter((_, i) => i !== index);
              setMedia(newMedia);
              Alert.alert('Success', `${item.type === 'photo' ? 'Photo' : 'Video'} deleted`);
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete media');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Gallery</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Add up to 6 photos/videos to your profile
        </Text>

        <View style={styles.grid}>
          {media.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.photoContainer}
              onLongPress={() => handleDeleteMedia(index)}
            >
              {item.type === 'photo' ? (
                <Image source={{ uri: item.uri }} style={styles.photo} />
              ) : (
                <View style={styles.videoContainer}>
                  <Image 
                    source={{ uri: item.uri }} 
                    style={styles.photo}
                  />
                  <View style={styles.playIcon}>
                    <Text style={styles.playIconText}>▶</Text>
                  </View>
                </View>
              )}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteMedia(index)}
              >
                <Text style={styles.deleteButtonText}>×</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}

          {media.length < 6 && (
            <>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleAddMedia('photo')}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={theme.colors.primary} />
                ) : (
                  <>
                    <Text style={styles.addButtonIcon}>📷</Text>
                    <Text style={styles.addButtonText}>Add Photo</Text>
                  </>
                )}
              </TouchableOpacity>
              {media.length < 5 && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => handleAddMedia('video')}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={theme.colors.primary} />
                  ) : (
                    <>
                      <Text style={styles.addButtonIcon}>🎥</Text>
                      <Text style={styles.addButtonText}>Add Video</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>Tips for great media:</Text>
          <Text style={styles.tipText}>• Use clear, well-lit photos and videos</Text>
          <Text style={styles.tipText}>• Show your face clearly</Text>
          <Text style={styles.tipText}>• Include variety (close-up, full body, activities)</Text>
          <Text style={styles.tipText}>• Keep videos short and engaging (under 30 seconds)</Text>
          <Text style={styles.tipText}>• Avoid group photos/videos where you're hard to identify</Text>
          <Text style={styles.tipText}>• Long press to delete media</Text>
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
    padding: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: imageSize,
    height: imageSize,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  videoContainer: {
    position: 'relative',
  },
  playIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIconText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 3,
  },
  deleteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  addButton: {
    width: imageSize,
    height: imageSize,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonIcon: {
    fontSize: 40,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  addButtonText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  tips: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tipsTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  tipText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    lineHeight: 20,
  },
});
