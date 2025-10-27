import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileView } from './profile-view.entity';
import { User } from '../users/user.entity';
import { Profile } from '../profiles/profile.entity';
import { Media } from '../media/media.entity';

@Injectable()
export class ProfileViewsService {
  constructor(
    @InjectRepository(ProfileView) private readonly profileViews: Repository<ProfileView>,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Profile) private readonly profiles: Repository<Profile>,
    @InjectRepository(Media) private readonly media: Repository<Media>,
  ) {}

  async recordView(viewerId: string, viewedId: string): Promise<void> {
    // Don't record if viewing own profile
    if (viewerId === viewedId) {
      return;
    }

    // Check if already viewed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingView = await this.profileViews.findOne({
      where: {
        viewerId,
        viewedId,
      },
      order: {
        viewedAt: 'DESC',
      },
    });

    // If last view was today, don't record again
    if (existingView) {
      const lastViewDate = new Date(existingView.viewedAt);
      lastViewDate.setHours(0, 0, 0, 0);
      if (lastViewDate.getTime() === today.getTime()) {
        return;
      }
    }

    // Record new view
    const view = this.profileViews.create({
      viewerId,
      viewedId,
    });
    await this.profileViews.save(view);
  }

  async getViewers(userId: string, isPremium: boolean): Promise<any[]> {
    // Get all viewers ordered by most recent
    const views = await this.profileViews.find({
      where: { viewedId: userId },
      relations: ['viewer'],
      order: { viewedAt: 'DESC' },
    });

    // Get unique viewers (only most recent view per viewer)
    const uniqueViewers = new Map<string, ProfileView>();
    for (const view of views) {
      if (!uniqueViewers.has(view.viewerId)) {
        uniqueViewers.set(view.viewerId, view);
      }
    }

    const viewersList = Array.from(uniqueViewers.values());

    // Build response with profile data
    const result = await Promise.all(
      viewersList.map(async (view, index) => {
        const profile = await this.profiles.findOne({
          where: { user: { id: view.viewerId } },
        });

        const userMedia = await this.media.find({
          where: { owner: { id: view.viewerId } },
          order: { createdAt: 'DESC' },
        });

        const profilePic = userMedia.find(m => m.isProfilePicture);

        // Calculate age
        let age = 25;
        if (view.viewer?.birthdate) {
          const today = new Date();
          const birthDate = new Date(view.viewer.birthdate);
          age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
        }

        // For free users, blur viewers after the first 2
        const isBlurred = !isPremium && index >= 2;

        return {
          id: view.viewerId,
          displayName: isBlurred ? '???' : (profile?.displayName || 'Anonymous'),
          age: isBlurred ? null : age,
          profilePicture: isBlurred ? null : (profilePic ? this.getMediaUrl(profilePic.key) : null),
          viewedAt: view.viewedAt,
          isBlurred,
        };
      })
    );

    return result;
  }

  async getViewersCount(userId: string): Promise<number> {
    const views = await this.profileViews.find({
      where: { viewedId: userId },
    });

    // Count unique viewers
    const uniqueViewers = new Set(views.map(v => v.viewerId));
    return uniqueViewers.size;
  }

  private getMediaUrl(key: string): string {
    // This should match your R2 public URL or use signed URLs
    return key;
  }
}
