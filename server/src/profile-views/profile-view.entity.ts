import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('profile_views')
export class ProfileView {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'viewer_id' })
  viewer!: User;

  @Column({ type: 'uuid', name: 'viewer_id' })
  viewerId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'viewed_id' })
  viewed!: User;

  @Column({ type: 'uuid', name: 'viewed_id' })
  viewedId!: string;

  @CreateDateColumn({ name: 'viewed_at' })
  viewedAt!: Date;
}
