import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Profile } from '../profiles/profile.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ type: 'varchar', name: 'password_hash' })
  passwordHash!: string;

  @Column({ type: 'date', nullable: true })
  birthdate!: Date | null;

  @Column({ type: 'boolean', default: false, name: 'is_verified' })
  isVerified!: boolean;

  @Column({ name: 'age_consent_at', nullable: true })
  ageConsentAt!: Date | null;

  @Column({ name: 'tos_consent_at', nullable: true })
  tosConsentAt!: Date | null;

  @Column({ type: 'boolean', default: false, name: 'is_premium' })
  isPremium!: boolean;

  @Column({ name: 'premium_expires_at', nullable: true })
  premiumExpiresAt!: Date | null;

  @Column({ type: 'varchar', name: 'account_status', default: 'active' })
  accountStatus!: 'active' | 'deactivated' | 'deleted';

  @Column({ name: 'deactivated_at', nullable: true })
  deactivatedAt!: Date | null;

  @Column({ name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;

  @Column({ name: 'deletion_scheduled_at', nullable: true })
  deletionScheduledAt!: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'push_token' })
  pushToken!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToOne(() => Profile, (p) => p.user)
  profile?: Profile;
}
