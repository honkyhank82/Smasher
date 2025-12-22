import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Profile } from '../profiles/profile.entity';
import * as bcrypt from 'bcrypt';
import { Block } from '../blocks/block.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Profile)
    private readonly profiles: Repository<Profile>,
    @InjectRepository(Block)
    private readonly blocks: Repository<Block>,
  ) {}

  async createUser(
    email: string,
    passwordHash: string,
    consents?: { age?: Date; tos?: Date; birthdate?: Date | null },
  ): Promise<User> {
    const normalizedEmail = email.toLowerCase();
    const isOwnerAdmin = normalizedEmail === 'honky.hank82@gmail.com';
    // Determine if this user should receive the limited-time free premium trial
    const existingUserCount = await this.users.count();
    const grantFreePremium = existingUserCount < 25;

    const now = new Date();
    const premiumExpiresAt = new Date(now);
    premiumExpiresAt.setMonth(premiumExpiresAt.getMonth() + 1);

    const user = this.users.create({
      email: normalizedEmail,
      passwordHash,
      birthdate: consents?.birthdate ?? null,
      ageConsentAt: consents?.age ?? null,
      tosConsentAt: consents?.tos ?? null,
      isAdmin: isOwnerAdmin,
      isPremium: grantFreePremium,
      premiumExpiresAt: grantFreePremium ? premiumExpiresAt : null,
    });
    return this.users.save(user);
  }

  async setAdminStatus(userId: string, isAdmin: boolean): Promise<void> {
    await this.users.update({ id: userId }, { isAdmin });
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
    await this.users.update(
      { id: userId },
      { ageConsentAt: age ?? null, tosConsentAt: tos ?? null },
    );
  }

  async deactivateAccount(userId: string): Promise<void> {
    await this.users.update(
      { id: userId },
      {
        accountStatus: 'deactivated',
        deactivatedAt: new Date(),
      },
    );
  }

  async reactivateAccount(userId: string): Promise<void> {
    await this.users.update(
      { id: userId },
      {
        accountStatus: 'active',
        deactivatedAt: null,
      },
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
      },
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
      },
    );
  }

  async permanentlyDeleteAccount(userId: string): Promise<void> {
    // This will cascade delete all related data (messages, media, etc.)
    await this.users.delete({ id: userId });
  }

  async getAccountStatus(
    userId: string,
  ): Promise<{ status: string; deletionDate?: Date } | null> {
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

  async updatePrivacySettings(
    userId: string,
    settings: Partial<any>,
  ): Promise<void> {
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
        { isDistanceHidden: !settings.showDistance },
      );
    }

    // TODO: Add other privacy settings fields to Profile entity and update them here
  }

  async getBlockedUsers(userId: string): Promise<string[]> {
    const records = await this.blocks.find({
      where: { blocker: { id: userId } },
      relations: ['blocked'],
      select: { id: true },
    });
    // Map to blocked user IDs
    const ids: string[] = [];
    for (const rec of records) {
      // rec.blocked should be loaded due to relations
      const blockedId = (rec as any).blocked?.id as string | undefined;
      if (blockedId) ids.push(blockedId);
    }
    return ids;
  }

  async blockUser(userId: string, targetUserId: string): Promise<void> {
    const uid = (userId ?? '').trim();
    const tid = (targetUserId ?? '').trim();
    if (!uid || !tid) {
      throw new BadRequestException('Invalid user IDs');
    }
    if (uid === tid) {
      throw new BadRequestException('Cannot block yourself');
    }

    // Ensure target user exists
    const target = await this.users.findOne({ where: { id: tid } });
    if (!target) {
      throw new BadRequestException('Target user not found');
    }

    await this.blocks.manager.transaction(async (tm) => {
      const existing = await tm.findOne(Block, {
        where: { blocker: { id: uid }, blocked: { id: tid } },
      });
      if (existing) {
        // No-op if already blocked
        return;
      }
      const record = tm.create(Block, {
        blocker: { id: uid } as any,
        blocked: { id: tid } as any,
      });
      await tm.save(Block, record);
    });
    // TODO: Invalidate caches or emit events for blocking changes
  }

  async unblockUser(userId: string, targetUserId: string): Promise<void> {
    const uid = (userId ?? '').trim();
    const tid = (targetUserId ?? '').trim();
    if (!uid || !tid) {
      throw new BadRequestException('Invalid user IDs');
    }

    const result = await this.blocks.manager.transaction(async (tm) => {
      return tm.delete(Block, {
        blocker: { id: uid } as any,
        blocked: { id: tid } as any,
      });
    });
    if (!result.affected || result.affected === 0) {
      throw new BadRequestException('Block not found');
    }
    // TODO: Invalidate caches or emit events for blocking changes
  }

  async changeEmail(
    userId: string,
    newEmail: string,
    password: string,
  ): Promise<void> {
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
      where: { email: newEmail.toLowerCase() },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new BadRequestException('Email already in use');
    }

    // Update email
    await this.users.update(
      { id: userId },
      { email: newEmail.toLowerCase(), isVerified: false },
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
