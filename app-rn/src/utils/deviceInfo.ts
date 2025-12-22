import { Platform } from 'react-native';
import * as Application from 'expo-application';
import * as Device from 'expo-device';

export interface DeviceInfo {
  uniqueId: string;
  deviceName: string;
  osName: string;
  osVersion: string;
  deviceType: number | null;
  brand: string | null;
  modelName: string | null;
  platform: string;
  appVersion: string | null;
  buildNumber: string | null;
}

export const getDeviceInfo = (): DeviceInfo => {
  return {
    uniqueId: Application.getAndroidId?.() || 'unknown',
    deviceName: Device.deviceName || 'unknown',
    osName: Device.osName || 'unknown',
    osVersion: Device.osVersion || 'unknown',
    deviceType: Device.deviceType || null,
    brand: Device.brand || null,
    modelName: Device.modelName || null,
    platform: Platform.OS,
    appVersion: Application.nativeApplicationVersion || null,
    buildNumber: Application.nativeBuildVersion || null,
  };
};

export const getAppVersion = (): string => {
  const info = getDeviceInfo();
  return `${info.appVersion} (${info.buildNumber})`;
};
