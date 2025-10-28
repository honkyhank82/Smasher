import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  @Index()
  userId!: string;

  @ManyToOne(() => User)
  user!: User;

  @Column({ type: 'varchar', length: 50 })
  type!: string; // 'location_share_started', 'location_share_stopped', 'location_share_expired', 'message', 'match', etc.

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({ type: 'jsonb', nullable: true })
  data: any;

  @Column({ type: 'boolean', default: false })
  @Index()
  read!: boolean;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;
}
