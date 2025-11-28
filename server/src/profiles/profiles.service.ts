import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './profile.entity';
import { User } from '../users/user.entity';
import { Media } from '../media/media.entity';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile) private readonly profiles: Repository<Profile>,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Media) private readonly media: Repository<Media>,
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
    
    // Get gallery items (non-profile pictures)
    const galleryItems = userMedia.filter(m => !m.isProfilePicture).slice(0, 6);

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

    return {
      id: userId,
      displayName: profile.displayName,
      age: publicAge,
      bio: profile.bio,
      distance: null, // Will be calculated by geo service
      profilePicture: profilePic ? this.getMediaUrl(profilePic.key) : null,
      gallery: galleryItems.map(m => this.getMediaUrl(m.key)),
    };
  }

  private getMediaUrl(key: string): string {
    // This should match your R2 public URL or use signed URLs
    // For now, return the key - you'll need to generate signed URLs in production
    return key;
  }
}
