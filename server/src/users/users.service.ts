import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Profile } from '../profiles/profile.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Profile)
    private readonly profiles: Repository<Profile>,
  ) {}

  async createUser(email: string, passwordHash: string, consents?: { age?: Date; tos?: Date; birthdate?: Date | null }): Promise<User> {
    const user = this.users.create({
      email: email.toLowerCase(),
      passwordHash,
      birthdate: consents?.birthdate ?? null,
      ageConsentAt: consents?.age ?? null,
      tosConsentAt: consents?.tos ?? null,
    });
    return this.users.save(user);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.users.findOne({ where: { email: email.toLowerCase() } });
  }

  findById(id: string): Promise<User | null> {
    return this.users.findOne({ where: { id } });
  }

  async setVerified(userId: string): Promise<void> {
    await this.users.update({ id: userId }, { isVerified: true });
  }

  async updateConsents(userId: string, age?: Date, tos?: Date): Promise<void> {
    await this.users.update({ id: userId }, { ageConsentAt: age ?? null, tosConsentAt: tos ?? null });
  }

  async deactivateAccount(userId: string): Promise<void> {
    await this.users.update(
      { id: userId },
      {
        accountStatus: 'deactivated',
        deactivatedAt: new Date(),
      }
    );
  }

  async reactivateAccount(userId: string): Promise<void> {
    await this.users.update(
      { id: userId },
      {
        accountStatus: 'active',
        deactivatedAt: null,
      }
    );
  }

  async scheduleAccountDeletion(userId: string): Promise<Date> {
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30); // 30-day grace period

    await this.users.update(
      { id: userId },
      {
        accountStatus: 'deleted',
        deletionScheduledAt: new Date(),
        deletedAt: deletionDate,
      }
    );

    return deletionDate;
  }

  async cancelAccountDeletion(userId: string): Promise<void> {
    await this.users.update(
      { id: userId },
      {
        accountStatus: 'active',
        deletionScheduledAt: null,
        deletedAt: null,
      }
    );
  }

  async permanentlyDeleteAccount(userId: string): Promise<void> {
    // This will cascade delete all related data (messages, media, etc.)
    await this.users.delete({ id: userId });
  }

  async getAccountStatus(userId: string): Promise<{ status: string; deletionDate?: Date } | null> {
    const user = await this.users.findOne({
      where: { id: userId },
      select: ['accountStatus', 'deletedAt', 'deletionScheduledAt'],
    });

    if (!user) return null;

    return {
      status: user.accountStatus,
      deletionDate: user.deletedAt || undefined,
    };
  }

  async getPrivacySettings(userId: string): Promise<any> {
    const profile = await this.profiles.findOne({
      where: { user: { id: userId } },
    });

    if (!profile) {
      // Return default settings if profile doesn't exist
      return {
        showOnlineStatus: true,
        showLastSeen: true,
        showReadReceipts: true,
        allowProfileViewing: true,
        showDistance: true,
        discoverableInSearch: true,
      };
    }

    // For now, return default settings
    // TODO: Add these fields to Profile entity
    return {
      showOnlineStatus: true,
      showLastSeen: true,
      showReadReceipts: true,
      allowProfileViewing: true,
      showDistance: !profile.isDistanceHidden,
      discoverableInSearch: true,
    };
  }

  async updatePrivacySettings(userId: string, settings: Partial<any>): Promise<void> {
    const profile = await this.profiles.findOne({
      where: { user: { id: userId } },
    });

    if (!profile) {
      throw new BadRequestException('Profile not found');
    }

    // Update the isDistanceHidden field if showDistance is provided
    if (settings.showDistance !== undefined) {
      await this.profiles.update(
        { user: { id: userId } },
        { isDistanceHidden: !settings.showDistance }
      );
    }

    // TODO: Add other privacy settings fields to Profile entity and update them here
  }

  async getBlockedUsers(userId: string): Promise<any[]> {
    // TODO: Implement blocked users table
    // For now, return empty array
    return [];
  }

  async blockUser(userId: string, targetUserId: string): Promise<void> {
    // TODO: Implement blocked users table
    // For now, just log
    console.log(`User ${userId} blocked user ${targetUserId}`);
  }

  async unblockUser(userId: string, targetUserId: string): Promise<void> {
    // TODO: Implement blocked users table
    // For now, just log
    console.log(`User ${userId} unblocked user ${targetUserId}`);
  }

  async changeEmail(userId: string, newEmail: string, password: string): Promise<void> {
    const user = await this.users.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Check if new email is already in use
    const existingUser = await this.users.findOne({ 
      where: { email: newEmail.toLowerCase() } 
    });
    
    if (existingUser && existingUser.id !== userId) {
      throw new BadRequestException('Email already in use');
    }

    // Update email
    await this.users.update(
      { id: userId },
      { email: newEmail.toLowerCase(), isVerified: false }
    );

    // TODO: Send verification email
  }

  async savePushToken(userId: string, pushToken: string): Promise<void> {
    await this.users.update({ id: userId }, { pushToken });
  }

  async removePushToken(userId: string): Promise<void> {
    await this.users.update({ id: userId }, { pushToken: null });
  }
}
