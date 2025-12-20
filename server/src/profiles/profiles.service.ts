import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './profile.entity';
import { User } from '../users/user.entity';
import { Media } from '../media/media.entity';
import { MediaService } from '../media/media.service';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile) private readonly profiles: Repository<Profile>,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Media) private readonly media: Repository<Media>,
    private readonly mediaService: MediaService,
  ) {}

  async getOrCreate(userId: string): Promise<Profile> {
    let profile = await this.profiles.findOne({ where: { user: { id: userId } }, relations: ['user'] });
    if (!profile) {
      const user = await this.users.findOne({ where: { id: userId } });
      if (!user) {
        // User doesn't exist - token is invalid
        const { UnauthorizedException } = require('@nestjs/common');
        throw new UnauthorizedException('Invalid token. Please log in again.');
      }
      profile = this.profiles.create({ user, displayName: null, bio: null, isDistanceHidden: false, lat: null, lng: null });
      profile = await this.profiles.save(profile);
    }
    return profile;
  }

  async update(
    userId: string,
    updates: Partial<
      Pick<
        Profile,
        | 'displayName'
        | 'bio'
        | 'isDistanceHidden'
        | 'showAge'
        | 'lat'
        | 'lng'
        | 'heightCm'
        | 'weightKg'
        | 'heightIn'
        | 'weightLbs'
        | 'ethnicity'
        | 'bodyType'
        | 'sexualPosition'
        | 'relationshipStatus'
        | 'lookingFor'
      >
    >,
  ): Promise<Profile> {
    const profile = await this.getOrCreate(userId);
    Object.assign(profile, updates);
    return this.profiles.save(profile);
  }

  async getByUserId(userId: string): Promise<any> {
    const profile = await this.profiles.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    
    if (!profile) {
      throw new Error('Profile not found');
    }

    // Get user's media
    const userMedia = await this.media.find({
      where: { owner: { id: userId } },
      order: { createdAt: 'DESC' },
    });

    // Find profile picture
    const profilePic = userMedia.find(m => m.isProfilePicture);
    let profilePicUrl: string | null = null;
    if (profilePic) {
      const { url } = await this.mediaService.createSignedDownloadUrl(profilePic.key);
      profilePicUrl = url;
    }
    
    // Get gallery items (non-profile pictures)
    const galleryItems = userMedia.filter(m => !m.isProfilePicture).slice(0, 6);
    const galleryUrls = await Promise.all(
      galleryItems.map(async (m) => {
        const { url } = await this.mediaService.createSignedDownloadUrl(m.key);
        return url;
      })
    );

    // Calculate age from birthdate if available
    let age: number | null = null;
    if (profile.user?.birthdate) {
      const today = new Date();
      const birthDate = new Date(profile.user.birthdate);
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    // Respect user's preference to hide age
    const publicAge = profile.showAge ? age : null;

    // Prefer stored imperial height; fall back to converted cm if needed
    const heightIn =
      profile.heightIn != null
        ? profile.heightIn
        : profile.heightCm != null
        ? Math.round(profile.heightCm / 2.54)
        : null;

    return {
      id: userId,
      displayName: profile.displayName,
      age: publicAge,
      bio: profile.bio,
      distance: null, // Will be calculated by geo service
      heightIn,
      profilePicture: profilePicUrl,
      gallery: galleryUrls,
    };
  }
}
