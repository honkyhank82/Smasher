import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('verification_codes')
export class VerificationCode {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  @Index('idx_verification_email')
  email!: string;

  @Column({ type: 'varchar', length: 255, name: 'code_hash', nullable: false })
  @Index('idx_verification_codehash')
  codeHash!: string;

  @Column({ type: 'timestamp', name: 'expires_at' })
  @Index('idx_verification_expires')
  expiresAt!: Date;

  @Column({ type: 'boolean', default: false })
  used!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}