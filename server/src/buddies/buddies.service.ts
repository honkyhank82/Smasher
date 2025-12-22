import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
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
    const uid = (userId ?? '').trim();
    const bid = (buddyId ?? '').trim();
    if (!uid || !bid) {
      throw new BadRequestException('User ID and Buddy ID are required');
    }
    const user = await this.userRepository.findOne({ where: { id: uid } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const buddyUser = await this.userRepository.findOne({ where: { id: bid } });
    if (!buddyUser) {
      throw new NotFoundException('Buddy not found');
    }
    // Placeholder for permission checks (e.g., blocks, privacy)
    const hasPermission = true;
    if (!hasPermission) {
      throw new ForbiddenException('Access denied');
    }
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
    const uid = (userId ?? '').trim();
    const bid = (buddyId ?? '').trim();
    if (!uid || !bid) {
      throw new BadRequestException('User ID and Buddy ID are required');
    }
    const user = await this.userRepository.findOne({ where: { id: uid } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const existing = await this.buddyRepository.findOne({
      where: { userId: uid, buddyId: bid },
    });
    if (!existing) {
      throw new NotFoundException('Buddy relationship not found');
    }
    await this.buddyRepository.delete({ userId: uid, buddyId: bid });
  }

  async getBuddies(userId: string): Promise<User[]> {
    const uid = (userId ?? '').trim();
    const user = await this.userRepository.findOne({ where: { id: uid } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const buddies = await this.buddyRepository.find({
      where: { userId: uid },
      relations: ['buddy', 'buddy.profile'],
    });

    return buddies.map((b) => b.buddy);
  }

  async isBuddy(userId: string, buddyId: string): Promise<boolean> {
    const uid = (userId ?? '').trim();
    const bid = (buddyId ?? '').trim();
    const buddy = await this.buddyRepository.findOne({
      where: { userId: uid, buddyId: bid },
    });

    return !!buddy;
  }

  async getBuddyCount(userId: string): Promise<number> {
    return this.buddyRepository.count({ where: { userId } });
  }
}
