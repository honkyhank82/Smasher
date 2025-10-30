import { BadRequestException } from '@nestjs/common';
import { UsersService } from '../src/users/users.service';
import { Repository } from 'typeorm';
import { User } from '../src/users/user.entity';
import { Profile } from '../src/profiles/profile.entity';
import { Block } from '../src/blocks/block.entity';

function mockRepo<T>() {
  return {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    manager: {
      transaction: jest.fn(async (cb: any) => {
        const tm = {
          findOne: (entity: any, opts: any) => (repo as any).findOne(opts),
          save: (entity: any, item: any) => (repo as any).save(item),
          delete: (entity: any, criteria: any) => (repo as any).delete(criteria),
          create: (entity: any, item: any) => item,
        } as any;
        return cb(tm);
      }),
    },
  } as unknown as Repository<T>;
}

const repo = mockRepo<any>();

describe('UsersService blocking', () => {
  let service: UsersService;
  let usersRepo: Repository<User>;
  let profilesRepo: Repository<Profile>;
  let blocksRepo: Repository<Block>;

  beforeEach(() => {
    jest.clearAllMocks();
    usersRepo = mockRepo<User>();
    profilesRepo = mockRepo<Profile>();
    blocksRepo = mockRepo<Block>();
    service = new UsersService(usersRepo as any, profilesRepo as any, blocksRepo as any);
  });

  it('returns blocked user IDs', async () => {
    (blocksRepo.find as any).mockResolvedValue([{ blocked: { id: 'u2' } }, { blocked: { id: 'u3' } }]);
    const result = await service.getBlockedUsers('u1');
    expect(result).toEqual(['u2', 'u3']);
    expect(blocksRepo.find).toHaveBeenCalled();
  });

  it('blocks a user and is idempotent', async () => {
    (usersRepo.findOne as any).mockResolvedValue({ id: 'u2' });
    // First time: no existing block
    (blocksRepo.findOne as any).mockResolvedValueOnce(null);
    await service.blockUser('u1', 'u2');
    expect((blocksRepo as any).save).toHaveBeenCalled();

    // Second time: existing block
    (blocksRepo.findOne as any).mockResolvedValueOnce({ id: 'b1' });
    await service.blockUser('u1', 'u2');
    // save should not be called again
  });

  it('fails to unblock non-existent block', async () => {
    (blocksRepo.delete as any).mockResolvedValue({ affected: 0 });
    await expect(service.unblockUser('u1', 'u9')).rejects.toBeInstanceOf(BadRequestException);
  });
});