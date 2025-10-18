import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Profile } from '../profiles/profile.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ type: 'date', nullable: true })
  birthdate!: Date | null;

  @Column({ default: false, name: 'is_verified' })
  isVerified!: boolean;

  @Column({ type: 'timestamp', name: 'age_consent_at', nullable: true })
  ageConsentAt!: Date | null;

  @Column({ type: 'timestamp', name: 'tos_consent_at', nullable: true })
  tosConsentAt!: Date | null;

  @Column({ default: false, name: 'is_premium' })
  isPremium!: boolean;

  @Column({ type: 'timestamp', name: 'premium_expires_at', nullable: true })
  premiumExpiresAt!: Date | null;

  @Column({ name: 'account_status', default: 'active' })
  accountStatus!: 'active' | 'deactivated' | 'deleted';

  @Column({ type: 'timestamp', name: 'deactivated_at', nullable: true })
  deactivatedAt!: Date | null;

  @Column({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;

  @Column({ type: 'timestamp', name: 'deletion_scheduled_at', nullable: true })
  deletionScheduledAt!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToOne(() => Profile, (p) => p.user)
  profile?: Profile;
}
