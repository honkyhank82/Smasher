import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { theme } from '../config/theme';

const { width } = Dimensions.get('window');

interface PhotoEditorScreenProps {
  route: {
    params: {
      imageUri: string;
      onSave: (editedUri: string) => void;
    };
  };
  navigation: any;
}

interface Filter {
  name: string;
  icon: string;
  actions: ImageManipulator.Action[];
}

const FILTERS: Filter[] = [
  {
    name: 'Original',
    icon: '📷',
    actions: [],
  },
  {
    name: 'Bright',
    icon: '☀️',
    actions: [
      { brightness: 0.2 },
      { contrast: 0.1 },
    ],
  },
  {
    name: 'Vivid',
    icon: '🌈',
    actions: [
      { saturate: 1.5 },
      { contrast: 0.15 },
    ],
  },
  {
    name: 'Warm',
    icon: '🔥',
    actions: [
      { saturate: 0.3 },
      { brightness: 0.1 },
    ],
  },
  {
    name: 'Cool',
    icon: '❄️',
    actions: [
      { saturate: -0.2 },
      { brightness: -0.05 },
    ],
  },
  {
    name: 'B&W',
    icon: '⚫',
    actions: [
      { grayscale: 1 },
      { contrast: 0.1 },
    ],
  },
  {
    name: 'Vintage',
    icon: '📺',
    actions: [
      { sepia: 0.5 },
      { brightness: -0.1 },
    ],
  },
  {
    name: 'Sharp',
    icon: '🔪',
    actions: [
      { contrast: 0.3 },
      { saturate: 0.2 },
    ],
  },
];

export const PhotoEditorScreen: React.FC<PhotoEditorScreenProps> = ({
  route,
  navigation,
}) => {
  const { imageUri, onSave } = route.params;
  const [editedUri, setEditedUri] = useState(imageUri);
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);

  const applyFilter = async (filterIndex: number) => {
    setProcessing(true);
    try {
      const filter = FILTERS[filterIndex];
      const actions: ImageManipulator.Action[] = [...filter.actions];

      // Add rotation if any
      if (rotation !== 0) {
        actions.push({ rotate: rotation });
      }

      // Add manual adjustments
      if (brightness !== 0) {
        actions.push({ brightness });
      }
      if (contrast !== 0) {
        actions.push({ contrast });
      }
      if (saturation !== 0) {
        actions.push({ saturate: saturation });
      }

      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        actions,
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      setEditedUri(result.uri);
      setSelectedFilter(filterIndex);
    } catch (error) {
      console.error('Filter error:', error);
      Alert.alert('Error', 'Failed to apply filter');
    } finally {
      setProcessing(false);
    }
  };

  const handleRotate = async () => {
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
    applyFilter(selectedFilter);
  };

  const handleCrop = async () => {
    setProcessing(true);
    try {
      const result = await ImageManipulator.manipulateAsync(
        editedUri,
        [
          {
            crop: {
              originX: 0,
              originY: 0,
              width: 1000,
              height: 1000,
            },
          },
        ],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      setEditedUri(result.uri);
    } catch (error) {
      console.error('Crop error:', error);
      Alert.alert('Error', 'Failed to crop image');
    } finally {
      setProcessing(false);
    }
  };

  const handleFlip = async (direction: 'horizontal' | 'vertical') => {
    setProcessing(true);
    try {
      const result = await ImageManipulator.manipulateAsync(
        editedUri,
        [{ flip: direction === 'horizontal' ? ImageManipulator.FlipType.Horizontal : ImageManipulator.FlipType.Vertical }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      setEditedUri(result.uri);
    } catch (error) {
      console.error('Flip error:', error);
      Alert.alert('Error', 'Failed to flip image');
    } finally {
      setProcessing(false);
    }
  };

  const handleSave = () => {
    onSave(editedUri);
    navigation.goBack();
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Photo</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Image Preview */}
      <View style={styles.imageContainer}>
        {processing && (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.processingText}>Processing...</Text>
          </View>
        )}
        <Image
          source={{ uri: editedUri }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Tools */}
      <View style={styles.toolsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity style={styles.tool} onPress={handleRotate}>
            <Text style={styles.toolIcon}>🔄</Text>
            <Text style={styles.toolText}>Rotate</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tool} onPress={() => handleFlip('horizontal')}>
            <Text style={styles.toolIcon}>↔️</Text>
            <Text style={styles.toolText}>Flip H</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tool} onPress={() => handleFlip('vertical')}>
            <Text style={styles.toolIcon}>↕️</Text>
            <Text style={styles.toolText}>Flip V</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.tool} 
            onPress={() => {
              setBrightness(brightness === 0 ? 0.2 : 0);
              applyFilter(selectedFilter);
            }}
          >
            <Text style={styles.toolIcon}>💡</Text>
            <Text style={styles.toolText}>Bright</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.tool}
            onPress={() => {
              setContrast(contrast === 0 ? 0.2 : 0);
              applyFilter(selectedFilter);
            }}
          >
            <Text style={styles.toolIcon}>◐</Text>
            <Text style={styles.toolText}>Contrast</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.tool}
            onPress={() => {
              setSaturation(saturation === 0 ? 0.3 : 0);
              applyFilter(selectedFilter);
            }}
          >
            <Text style={styles.toolIcon}>🎨</Text>
            <Text style={styles.toolText}>Saturate</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>Filters</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FILTERS.map((filter, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.filterButton,
                selectedFilter === index && styles.filterButtonActive,
              ]}
              onPress={() => applyFilter(index)}
            >
              <Text style={styles.filterIcon}>{filter.icon}</Text>
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === index && styles.filterTextActive,
                ]}
              >
                {filter.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
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
  cancelButton: {
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
  imageContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: width,
    height: '100%',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  processingText: {
    color: '#fff',
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.md,
  },
  toolsContainer: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingVertical: theme.spacing.sm,
  },
  tool: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  toolIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  toolText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text,
  },
  filtersContainer: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingVertical: theme.spacing.md,
  },
  filtersTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: 'bold',
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  filterButton: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    marginHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  filterIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  filterText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text,
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
