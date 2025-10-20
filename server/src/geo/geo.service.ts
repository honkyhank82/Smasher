import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../profiles/profile.entity';
import { Media } from '../media/media.entity';
import { MediaService } from '../media/media.service';
import { ChatGateway } from '../chat/chat.gateway';

@Injectable()
export class GeoService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    private readonly mediaService: MediaService,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
  ) {}

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
    maxDistance: number = 15,
  ): Promise<any[]> {
    try {
      const currentUser = await this.profileRepository.findOne({
        where: { user: { id: userId } },
      });
      if (!currentUser) return [];
      const userLat = currentUser.lat;
      const userLng = currentUser.lng;
      
      // If current user doesn't have location, return empty
      if (userLat === null || userLng === null) {
        console.log('Current user has no location set');
        return [];
      }
      
      const nearbyUsers = await this.profileRepository
        .createQueryBuilder('profile')
        .where('profile.userId != :userId', { userId })
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

      const results = await Promise.all(
        nearbyUsers.entities.map(async (profile, index) => {
          const distance = parseFloat(nearbyUsers.raw[index].distance);
          
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
            })
          );
          
          // Check online status
          const isOnline = this.chatGateway.isUserOnline(profile.user.id);
          const lastSeen = this.chatGateway.getLastSeen(profile.user.id);
          
          return {
            id: profile.user.id,
            displayName: profile.displayName,
            age: this.calculateAge(profile.user),
            bio: profile.bio,
            distance: profile.isDistanceHidden ? null : Math.round(distance * 10) / 10,
            profilePicture: profilePictureUrl,
            gallery,
            isOnline,
            lastSeen,
          };
        })
      );
      
      return results;
    } catch (error) {
      console.error('Error fetching nearby users:', error);
      return [];
    }
  }

  private calculateAge(user: any): number {
    if (!user.birthdate) {
      return 25;
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
