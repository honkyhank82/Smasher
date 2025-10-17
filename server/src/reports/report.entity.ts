import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reporter_id' })
  reporter!: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reported_id' })
  reported!: User;

  @Column({ type: 'varchar', length: 50 })
  reason!: string;

  @Column({ type: 'text', nullable: true })
  details!: string | null;

  @Column({ default: 'pending' })
  status!: string; // pending, reviewed, actioned

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
