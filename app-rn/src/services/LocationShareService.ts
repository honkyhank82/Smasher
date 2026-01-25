import * as Location from "expo-location";
import api from "./api";
import {
  LocationShare,
  LocationShareRequest,
  LocationShareUpdate,
} from "../types/locationShare";

class LocationShareService {
  private activeShares: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private locationSubscription: Location.LocationSubscription | null = null;

  /**
   * Start sharing location with a specific user
   */
  async startSharing(request: LocationShareRequest): Promise<LocationShare> {
    try {
      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Create share on backend
      const response = await api.post("/location-share/start", {
        sharedWithUserId: request.sharedWithUserId,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        durationMinutes: request.durationMinutes,
      });

      const share: LocationShare = response.data;

      // Start tracking location updates
      this.startLocationTracking(share.id);

      // Set auto-expiry timer
      this.setExpiryTimer(share.id, request.durationMinutes);

      return share;
    } catch (error) {
      console.error("Failed to start location sharing:", error);
      throw error;
    }
  }

  /**
   * Stop sharing location
   */
  async stopSharing(shareId: string): Promise<void> {
    try {
      await api.post(`/location-share/${shareId}/stop`);
      this.cleanup(shareId);
    } catch (error) {
      console.error("Failed to stop location sharing:", error);
      throw error;
    }
  }

  /**
   * Get active shares (locations being shared with me)
   */
  async getActiveShares(): Promise<LocationShare[]> {
    try {
      const response = await api.get("/location-share/active");
      return response.data;
    } catch (error) {
      console.error("Failed to get active shares:", error);
      throw error;
    }
  }

  /**
   * Get my active shares (locations I'm sharing)
   */
  async getMyShares(): Promise<LocationShare[]> {
    try {
      const response = await api.get("/location-share/my-shares");
      return response.data;
    } catch (error) {
      console.error("Failed to get my shares:", error);
      throw error;
    }
  }

  /**
   * Get specific share details
   */
  async getShare(shareId: string): Promise<LocationShare> {
    try {
      const response = await api.get(`/location-share/${shareId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to get share:", error);
      throw error;
    }
  }

  /**
   * Start tracking location and sending updates
   */
  private async startLocationTracking(shareId: string): Promise<void> {
    try {
      // Request foreground permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Location permission not granted");
      }

      // Start watching location
      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 10, // Or when moved 10 meters
        },
        async (location) => {
          await this.updateLocation(shareId, {
            shareId,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        },
      );
    } catch (error) {
      console.error("Failed to start location tracking:", error);
      throw error;
    }
  }

  /**
   * Update location on backend
   */
  private async updateLocation(
    shareId: string,
    update: LocationShareUpdate,
  ): Promise<void> {
    try {
      await api.put(`/location-share/${shareId}/location`, {
        latitude: update.latitude,
        longitude: update.longitude,
      });
    } catch (error) {
      console.error("Failed to update location:", error);
      // Don't throw - continue tracking
    }
  }

  /**
   * Set timer to auto-expire share
   */
  private setExpiryTimer(shareId: string, durationMinutes: number): void {
    const timer = setTimeout(
      async () => {
        await this.stopSharing(shareId);
      },
      durationMinutes * 60 * 1000,
    );

    this.activeShares.set(shareId, timer);
  }

  /**
   * Cleanup timers and subscriptions
   */
  private cleanup(shareId: string): void {
    // Clear expiry timer
    const timer = this.activeShares.get(shareId);
    if (timer) {
      clearTimeout(timer);
      this.activeShares.delete(shareId);
    }

    // Stop location tracking if no more active shares
    if (this.activeShares.size === 0 && this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }
  }

  /**
   * Cleanup all shares (call on logout)
   */
  async cleanupAll(): Promise<void> {
    const shareIds = Array.from(this.activeShares.keys());
    for (const shareId of shareIds) {
      await this.stopSharing(shareId);
    }
  }
}

export default new LocationShareService();
