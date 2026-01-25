import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { theme } from "../config/theme";
import LocationShareService from "../services/LocationShareService";
import { LocationShare } from "../types/locationShare";

export const SharedLocationMapScreen = ({ route, navigation }: any) => {
  const { shareId, userName } = route.params;
  const [loading, setLoading] = useState(true);
  const [share, setShare] = useState<LocationShare | null>(null);
  const [myLocation, setMyLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const mapRef = useRef<MapView>(null);
  const updateInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadShare();
    getMyLocation();

    // Poll for location updates every 10 seconds
    updateInterval.current = setInterval(() => {
      loadShare();
    }, 10000);

    return () => {
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
      }
    };
  }, []);

  const loadShare = async () => {
    try {
      const shareData = await LocationShareService.getShare(shareId);
      setShare(shareData);

      if (!shareData.isActive) {
        Alert.alert(
          "Location Sharing Ended",
          `${userName} has stopped sharing their location.`,
          [{ text: "OK", onPress: () => navigation.goBack() }],
        );
      }
    } catch (error) {
      console.error("Failed to load share:", error);
      Alert.alert("Error", "Failed to load shared location");
    } finally {
      setLoading(false);
    }
  };

  const getMyLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setMyLocation(location);
      }
    } catch (error) {
      console.error("Failed to get my location:", error);
    }
  };

  const handleCenterOnSharedLocation = () => {
    if (share && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: share.latitude,
        longitude: share.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const handleCenterOnMe = () => {
    if (myLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: myLocation.coords.latitude,
        longitude: myLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const getDistance = (): string => {
    if (!share || !myLocation) {
      return "";
    }

    const R = 3959; // Earth's radius in miles
    const lat1 = myLocation.coords.latitude * (Math.PI / 180);
    const lat2 = share.latitude * (Math.PI / 180);
    const dLat =
      (share.latitude - myLocation.coords.latitude) * (Math.PI / 180);
    const dLon =
      (share.longitude - myLocation.coords.longitude) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    if (distance < 0.1) {
      return `${Math.round(distance * 5280)} ft away`;
    }
    return `${distance.toFixed(2)} mi away`;
  };

  const getTimeRemaining = (): string => {
    if (!share) {
      return "";
    }

    const now = new Date();
    const expires = new Date(share.expiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) {
      return "Expired";
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    }
    return `${minutes}m left`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!share) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Location share not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: share.latitude,
          longitude: share.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {/* Shared Location Marker */}
        <Marker
          coordinate={{
            latitude: share.latitude,
            longitude: share.longitude,
          }}
          title={userName}
          description="Current location"
          pinColor={theme.colors.primary}
        />
      </MapView>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📍 {userName}'s Location</Text>
          <Text style={styles.infoTime}>{getTimeRemaining()}</Text>
        </View>
        {myLocation && <Text style={styles.infoDistance}>{getDistance()}</Text>}
      </View>

      {/* Control Buttons */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleCenterOnSharedLocation}
        >
          <Text style={styles.controlButtonText}>📍 Center on {userName}</Text>
        </TouchableOpacity>
        {myLocation && (
          <TouchableOpacity
            style={[styles.controlButton, styles.controlButtonSecondary]}
            onPress={handleCenterOnMe}
          >
            <Text style={styles.controlButtonText}>🧭 Center on Me</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  errorText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  header: {
    position: "absolute",
    top: 50,
    left: theme.spacing.md,
    right: theme.spacing.md,
  },
  backButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backButtonText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
    fontWeight: "bold",
  },
  infoCard: {
    position: "absolute",
    bottom: 120,
    left: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  infoLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  infoTime: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: "bold",
  },
  infoDistance: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  controls: {
    position: "absolute",
    bottom: 20,
    left: theme.spacing.md,
    right: theme.spacing.md,
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  controlButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  controlButtonSecondary: {
    backgroundColor: theme.colors.surface,
  },
  controlButtonText: {
    color: "#fff",
    fontSize: theme.fontSize.sm,
    fontWeight: "bold",
  },
});
