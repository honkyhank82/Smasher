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

  @Column({ name: 'show_age', type: 'boolean', default: true })
  showAge!: boolean;

  // Optional location snapshot (we will rely on PostGIS later)
  @Column({ type: 'real', nullable: true })
  lat!: number | null;

  @Column({ type: 'real', nullable: true })
  lng!: number | null;

   @Column({ name: 'height_cm', type: 'int', nullable: true })
   heightCm!: number | null;

   @Column({ name: 'weight_kg', type: 'int', nullable: true })
   weightKg!: number | null;

   @Column({ name: 'ethnicity', type: 'varchar', length: 50, nullable: true })
   ethnicity!: string | null;

   @Column({ name: 'body_type', type: 'varchar', length: 50, nullable: true })
   bodyType!: string | null;

   @Column({ name: 'sexual_position', type: 'varchar', length: 50, nullable: true })
   sexualPosition!: string | null;

   @Column({ name: 'relationship_status', type: 'varchar', length: 50, nullable: true })
   relationshipStatus!: string | null;

   @Column({ name: 'looking_for', type: 'varchar', length: 100, nullable: true })
   lookingFor!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
