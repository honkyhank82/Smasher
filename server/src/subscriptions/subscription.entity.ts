import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'varchar', name: 'stripe_customer_id' })
  stripeCustomerId!: string;

  @Column({ type: 'varchar', name: 'stripe_subscription_id' })
  stripeSubscriptionId!: string;

  @Column({ type: 'varchar', name: 'stripe_price_id' })
  stripePriceId!: string;

  @Column({ type: 'varchar', name: 'plan_name', default: 'premium' })
  planName!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 9.99 })
  amount!: number;

  @Column({ type: 'varchar', default: 'USD' })
  currency!: string;

  @Column({ type: 'varchar', default: 'month' })
  interval!: string;

  @Column({ 
    type: 'varchar', 
    length: 50,
    default: 'active'
  })
  status!: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete' | 'trialing';

  @Column({ type: 'datetime', name: 'current_period_start' })
  currentPeriodStart!: Date;

  @Column({ type: 'datetime', name: 'current_period_end' })
  currentPeriodEnd!: Date;

  @Column({ type: 'datetime', name: 'cancel_at', nullable: true })
  cancelAt!: Date | null;

  @Column({ type: 'datetime', name: 'canceled_at', nullable: true })
  canceledAt!: Date | null;

  @Column({ type: 'datetime', name: 'ended_at', nullable: true })
  endedAt!: Date | null;

  @Column({ type: 'datetime', name: 'trial_start', nullable: true })
  trialStart!: Date | null;

  @Column({ type: 'datetime', name: 'trial_end', nullable: true })
  trialEnd!: Date | null;

  @Column({ type: 'boolean', name: 'cancel_at_period_end', default: false })
  cancelAtPeriodEnd!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
