import * as ExpoLocation from 'expo-location';
import { Alert } from 'react-native';
import api from './api';

export interface Location {
  latitude: number;
  longitude: number;
}

class LocationService {
  private watchSubscription: ExpoLocation.LocationSubscription | null = null;

  async requestPermission(): Promise<boolean> {
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Location permission error:', error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<Location | null> {
    try {
      const { status } = await ExpoLocation.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        const { status: newStatus } = await ExpoLocation.requestForegroundPermissionsAsync();
        if (newStatus !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Location permission is required to find nearby users.'
          );
          return null;
        }
      }

      const position = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.High,
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to get your location');
      return null;
    }
  }

  async updateLocationOnServer(location: Location): Promise<void> {
    try {
      await api.post('/geo/update-location', {
        latitude: location.latitude,
        longitude: location.longitude,
      });
    } catch (error) {
      console.error('Failed to update location on server:', error);
    }
  }

  async startLocationTracking(): Promise<void> {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) return;

      // Update location every 5 minutes or 100 meters
      this.watchSubscription = await ExpoLocation.watchPositionAsync(
        {
          accuracy: ExpoLocation.Accuracy.Balanced,
          distanceInterval: 100, // Update every 100 meters
          timeInterval: 300000, // 5 minutes
        },
        async (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          await this.updateLocationOnServer(location);
        }
      );
    } catch (error) {
      console.error('Location watch error:', error);
    }
  }

  stopLocationTracking(): void {
    if (this.watchSubscription) {
      this.watchSubscription.remove();
      this.watchSubscription = null;
    }
  }
}

export default new LocationService();
