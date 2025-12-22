import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('blocks')
@Unique(['blocker', 'blocked'])
export class Block {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'blocker_id' })
  blocker!: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'blocked_id' })
  blocked!: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
