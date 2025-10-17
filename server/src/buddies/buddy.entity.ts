import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('buddies')
export class Buddy {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column()
  buddyId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'buddyId' })
  buddy!: User;

  @CreateDateColumn()
  createdAt!: Date;
}
