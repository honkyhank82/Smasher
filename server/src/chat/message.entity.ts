import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  sender!: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'receiver_id' })
  receiver!: User;

  @Column({ type: 'text' })
  content!: string;

  @Column({ default: false, name: 'is_read' })
  isRead!: boolean;

  @Column({ type: 'timestamp', name: 'read_at', nullable: true })
  readAt!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
