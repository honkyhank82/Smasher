import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User, (u) => u.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'display_name', type: 'varchar', length: 50, nullable: true })
  displayName!: string | null;

  @Column({ type: 'text', nullable: true })
  bio!: string | null;

  @Column({ name: 'is_distance_hidden', type: 'boolean', default: false })
  isDistanceHidden!: boolean;

  // Optional location snapshot (we will rely on PostGIS later)
  @Column({ type: 'real', nullable: true })
  lat!: number | null;

  @Column({ type: 'real', nullable: true })
  lng!: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
