import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Block } from './block.entity';

@Injectable()
export class BlocksService {
  constructor(
    @InjectRepository(Block)
    private blockRepository: Repository<Block>,
  ) {}

  async blockUser(blockerId: string, blockedId: string): Promise<void> {
    const existingBlock = await this.blockRepository.findOne({
      where: {
        blocker: { id: blockerId },
        blocked: { id: blockedId },
      },
    });

    if (!existingBlock) {
      const block = this.blockRepository.create({
        blocker: { id: blockerId },
        blocked: { id: blockedId },
      });
      await this.blockRepository.save(block);
    }
  }

  async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    await this.blockRepository.delete({
      blocker: { id: blockerId },
      blocked: { id: blockedId },
    });
  }

  async isBlocked(userId1: string, userId2: string): Promise<boolean> {
    const block = await this.blockRepository.findOne({
      where: [
        { blocker: { id: userId1 }, blocked: { id: userId2 } },
        { blocker: { id: userId2 }, blocked: { id: userId1 } },
      ],
    });
    return !!block;
  }
}
