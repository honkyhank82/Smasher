import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../profiles/profile.entity';
import { Media } from '../media/media.entity';
import { MediaService } from '../media/media.service';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class GeoService {
  private onlineUsers: Map<string, Date> = new Map(); // userId -> last online timestamp
  private offlineUsers: Map<string, Date> = new Map(); // userId -> last seen timestamp

  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    private readonly mediaService: MediaService,
  ) {}

  @OnEvent('user.online')
  handleUserOnline(payload: { userId: string; timestamp: Date }) {
    this.onlineUsers.set(payload.userId, payload.timestamp);
    this.offlineUsers.delete(payload.userId);
  }

  @OnEvent('user.offline')
  handleUserOffline(payload: { userId: string; timestamp: Date }) {
    this.onlineUsers.delete(payload.userId);
    this.offlineUsers.set(payload.userId, payload.timestamp);
  }

  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  getLastSeen(userId: string): Date | null {
    return this.offlineUsers.get(userId) || null;
  }

  async updateLocation(
    userId: string,
    latitude: number,
    longitude: number,
  ): Promise<void> {
    await this.profileRepository.update(
      { user: { id: userId } },
      { lat: latitude, lng: longitude }
    );
  }

  async getNearbyUsers(
    userId: string,
    maxDistance: number = 100,
  ): Promise<any[]> {
    try {
      console.log('GeoService.getNearbyUsers called for user', userId, 'maxDistance', maxDistance);
      const currentUser = await this.profileRepository.findOne({
        where: { user: { id: userId } },
      });
      if (!currentUser) return [];
      const userLat = currentUser.lat;
      const userLng = currentUser.lng;
      
      // If current user doesn't have location, return a generic list of users
      if (userLat === null || userLng === null) {
        console.log('Current user has no location set, returning generic nearby users list');

        let profiles = await this.profileRepository
          .createQueryBuilder('profile')
          .leftJoinAndSelect('profile.user', 'user')
          .where('user.id != :userId', { userId })
          .andWhere('profile.lat IS NOT NULL')
          .andWhere('profile.lng IS NOT NULL')
          .orderBy('profile.created_at', 'DESC')
          .limit(50)
          .getMany();

        console.log('Generic nearby profiles with location count:', profiles.length);

        if (profiles.length === 0) {
          console.log('No profiles with location found, falling back to recent profiles regardless of location');
          profiles = await this.profileRepository
            .createQueryBuilder('profile')
            .leftJoinAndSelect('profile.user', 'user')
            .where('user.id != :userId', { userId })
            .orderBy('profile.created_at', 'DESC')
            .limit(50)
            .getMany();
        }

        const results = await Promise.all(
          profiles.map(async (profile) =>
            this.buildProfileResponse(profile, null),
          ),
        );

        console.log('Returning generic nearby users results count:', results.length);

        return results;
      }
      
      const nearbyUsers = await this.profileRepository
        .createQueryBuilder('profile')
        .leftJoinAndSelect('profile.user', 'user')
        .where('user.id != :userId', { userId })
        .andWhere('profile.lat IS NOT NULL')
        .andWhere('profile.lng IS NOT NULL')
        .addSelect(
          `(
            3959 * acos(
              cos(radians(:userLat)) * cos(radians(profile.lat)) *
              cos(radians(profile.lng) - radians(:userLng)) +
              sin(radians(:userLat)) * sin(radians(profile.lat))
            )
          )`,
          'distance'
        )
        .andWhere(
          `(
            3959 * acos(
              cos(radians(:userLat)) * cos(radians(profile.lat)) *
              cos(radians(profile.lng) - radians(:userLng)) +
              sin(radians(:userLat)) * sin(radians(profile.lat))
            )
          ) <= :maxDistance`,
          { userLat, userLng, maxDistance }
        )
        .orderBy('distance', 'ASC')
        .limit(50)
        .getRawAndEntities();

      console.log('Nearby users found by distance:', nearbyUsers.entities.length);

      if (nearbyUsers.entities.length === 0) {
        console.log('No nearby users found within distance, falling back to recent profiles regardless of location');

        const fallbackProfiles = await this.profileRepository
          .createQueryBuilder('profile')
          .leftJoinAndSelect('profile.user', 'user')
          .where('user.id != :userId', { userId })
          .orderBy('profile.created_at', 'DESC')
          .limit(50)
          .getMany();

        const fallbackResults = await Promise.all(
          fallbackProfiles.map((profile) =>
            this.buildProfileResponse(profile, null),
          ),
        );

        console.log('Returning fallback recent profiles count:', fallbackResults.length);
        return fallbackResults;
      }

      const results = await Promise.all(
        nearbyUsers.entities.map((profile, index) =>
          this.buildProfileResponse(
            profile,
            parseFloat(nearbyUsers.raw[index].distance),
          ),
        ),
      );

      console.log('Returning distance-based nearby users count:', results.length);
      return results;
    } catch (error) {
      console.error('Error fetching nearby users:', error);
      return [];
    }
  }

  /**
   * Calculate distance between two users in miles
   */
  async calculateDistanceBetweenUsers(userId1: string, userId2: string): Promise<number | null> {
    const profile1 = await this.profileRepository.findOne({
      where: { user: { id: userId1 } },
    });
    const profile2 = await this.profileRepository.findOne({
      where: { user: { id: userId2 } },
    });

    if (!profile1 || !profile2 || 
        profile1.lat === null || profile1.lng === null ||
        profile2.lat === null || profile2.lng === null) {
      return null;
    }

    // Haversine formula to calculate distance in miles
    const lat1 = profile1.lat;
    const lng1 = profile1.lng;
    const lat2 = profile2.lat;
    const lng2 = profile2.lng;

    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);

    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private async buildProfileResponse(profile: Profile, distanceMiles: number | null) {
    // Get profile picture
    const profilePicture = await this.mediaRepository.findOne({
      where: { owner: { id: profile.user.id }, isProfilePicture: true },
    });

    let profilePictureUrl: string | null = null;
    if (profilePicture) {
      const { url } = await this.mediaService.createSignedDownloadUrl(profilePicture.key);
      profilePictureUrl = url;
    }

    // Get gallery media
    const galleryMedia = await this.mediaRepository.find({
      where: { owner: { id: profile.user.id } },
      order: { createdAt: 'DESC' },
      take: 6,
    });

    const gallery = await Promise.all(
      galleryMedia.map(async (media) => {
        const { url } = await this.mediaService.createSignedDownloadUrl(media.key);
        return {
          id: media.id,
          type: media.type,
          url,
        };
      }),
    );

    // Online status from event emitters
    const isOnline = this.isUserOnline(profile.user.id);
    const lastSeen = this.getLastSeen(profile.user.id);

    const distance =
      distanceMiles !== null && !profile.isDistanceHidden
        ? Math.round(distanceMiles * 10) / 10
        : null;

    return {
      id: profile.user.id,
      displayName: profile.displayName,
      age: this.calculateAge(profile.user),
      bio: profile.bio,
      distance,
      profilePicture: profilePictureUrl,
      gallery,
      isOnline,
      lastSeen,
    };
  }

  private calculateAge(user: any): number | null {
    if (!user.birthdate) {
      const configuredDefault = process.env.DEFAULT_AGE;
      const defaultAge = configuredDefault ? parseInt(configuredDefault, 10) : NaN;
      return Number.isFinite(defaultAge) ? defaultAge : null;
    }
    const birthDate = new Date(user.birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}
