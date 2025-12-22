import 'reflect-metadata';
import { DataSource, type DataSourceOptions } from 'typeorm';

import { VerificationCode } from './auth/verification-code.entity';
import { Block } from './blocks/block.entity';
import { Buddy } from './buddies/buddy.entity';
import { Message } from './chat/message.entity';
import { ScoreSubmission } from './integrity/score-submission.entity';
import { LocationShare } from './location-share/location-share.entity';
import { Media } from './media/media.entity';
import { Notification } from './notifications/notification.entity';
import { ProfileView } from './profile-views/profile-view.entity';
import { Profile } from './profiles/profile.entity';
import { Report } from './reports/report.entity';
import { Subscription } from './subscriptions/subscription.entity';
import { User } from './users/user.entity';

import { CreateBuddiesTable1710000000000 } from './migrations/1710000000000-CreateBuddiesTable';
import { CreateSubscriptionsTable1737417600000 } from './migrations/1737417600000-CreateSubscriptionsTable';
import { DropPlaintextVerificationCode1738000000000 } from './migrations/1738000000000-DropPlaintextVerificationCode';

function shouldUseSsl(databaseUrl: string): boolean {
  const u = databaseUrl.toLowerCase();

  if (u.includes('.flycast')) return false;
  if (u.includes('localhost')) return false;
  if (u.includes('127.0.0.1')) return false;
  if (u.includes('@postgres:')) return false;

  return true;
}

const entities = [
  VerificationCode,
  Block,
  Buddy,
  Message,
  ScoreSubmission,
  LocationShare,
  Media,
  Notification,
  ProfileView,
  Profile,
  Report,
  Subscription,
  User,
];

const migrations = [
  CreateBuddiesTable1710000000000,
  CreateSubscriptionsTable1737417600000,
  DropPlaintextVerificationCode1738000000000,
];

const databaseUrl = (process.env.DATABASE_URL ?? '').trim();

const options: DataSourceOptions = databaseUrl
  ? {
      type: 'postgres',
      url: databaseUrl,
      uuidExtension: 'pgcrypto',
      ssl: shouldUseSsl(databaseUrl)
        ? {
            rejectUnauthorized: false,
          }
        : false,
      entities,
      migrations,
      synchronize: false,
    }
  : {
      type: 'sqlite',
      database: ':memory:',
      entities,
      migrations,
      synchronize: true,
    };

export default new DataSource(options);
