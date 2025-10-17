import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Buddy } from './buddy.entity';
import { User } from '../users/user.entity';

@Injectable()
export class BuddiesService {
  constructor(
    @InjectRepository(Buddy)
    private buddyRepository: Repository<Buddy>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async addBuddy(userId: string, buddyId: string): Promise<Buddy> {
    // Check if already buddies
    const existing = await this.buddyRepository.findOne({
      where: { userId, buddyId },
    });

    if (existing) {
      return existing;
    }

    const buddy = this.buddyRepository.create({
      userId,
      buddyId,
    });

    return this.buddyRepository.save(buddy);
  }

  async removeBuddy(userId: string, buddyId: string): Promise<void> {
    await this.buddyRepository.delete({ userId, buddyId });
  }

  async getBuddies(userId: string): Promise<User[]> {
    const buddies = await this.buddyRepository.find({
      where: { userId },
      relations: ['buddy', 'buddy.profile'],
    });

    return buddies.map((b) => b.buddy);
  }

  async isBuddy(userId: string, buddyId: string): Promise<boolean> {
    const buddy = await this.buddyRepository.findOne({
      where: { userId, buddyId },
    });

    return !!buddy;
  }

  async getBuddyCount(userId: string): Promise<number> {
    return this.buddyRepository.count({ where: { userId } });
  }
}
