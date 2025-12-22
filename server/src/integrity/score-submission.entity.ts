import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('score_submissions')
export class ScoreSubmission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'int' })
  score!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}