import * as ExpoLocation from 'expo-location';
import { Alert, Linking } from 'react-native';

class PermissionsService {
  async requestLocationPermission(): Promise<boolean> {
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        return true;
      } else if (status === 'denied') {
        this.showSettingsAlert();
        return false;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Location permission error:', error);
      return false;
    }
  }

  async checkLocationPermission(): Promise<boolean> {
    try {
      const { status } = await ExpoLocation.getForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Check location permission error:', error);
      return false;
    }
  }

  private showSettingsAlert() {
    Alert.alert(
      'Location Permission Required',
      'SMASHER needs location access to show you nearby users. Please enable it in Settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => Linking.openSettings(),
        },
      ]
    );
  }

  showLocationRationale() {
    Alert.alert(
      'Location Access',
      'SMASHER uses your location to help you discover people nearby. Your exact location is never shared with other users - only approximate distance.',
      [
        { text: 'Not Now', style: 'cancel' },
        {
          text: 'Enable Location',
          onPress: () => this.requestLocationPermission(),
        },
      ]
    );
  }
}

export default new PermissionsService();
