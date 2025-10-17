import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

export type MediaType = 'photo' | 'video';

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  owner!: User;

  @Column({ type: 'varchar', length: 16 })
  type!: MediaType; // 'photo' | 'video'

  @Column({ type: 'text' })
  key!: string; // S3/MinIO object key

  @Column({ name: 'content_type', type: 'varchar', length: 64 })
  contentType!: string;

  @Column({ name: 'is_nsfw', default: false })
  isNsfw!: boolean;

  @Column({ name: 'is_profile_picture', default: false })
  isProfilePicture!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
