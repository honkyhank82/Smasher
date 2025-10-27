import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './config/config.module';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProfilesModule } from './profiles/profiles.module';
import { MediaModule } from './media/media.module';
import { GeoModule } from './geo/geo.module';
import { ChatModule } from './chat/chat.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { ReportsModule } from './reports/reports.module';
import { BuddiesModule } from './buddies/buddies.module';
import { BlocksModule } from './blocks/blocks.module';
import { EmailModule } from './email/email.module';
import { ProfileViewsModule } from './profile-views/profile-views.module';
import { LocationShareModule } from './location-share/location-share.module';
import { NotificationModule } from './notifications/notification.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const url = process.env.DATABASE_URL;
        return url
          ? {
              type: 'postgres',
              url,
              autoLoadEntities: true,
              synchronize: false, // Disabled for production - use migrations instead
              ssl: url.includes('.flycast') ? false : {
                rejectUnauthorized: false,
              },
              retryAttempts: 5,
              retryDelay: 5000,
              connectTimeoutMS: 10000,
            }
          : {
              type: 'sqlite',
              database: ':memory:',
              autoLoadEntities: true,
              synchronize: true,
            };
      },
    }),
    ThrottlerModule.forRoot([
      {
        // ttl in milliseconds in newer throttler versions
        ttl: 60_000,
        limit: 60,
      },
    ]),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    AppConfigModule,
    UsersModule,
    AuthModule,
    ProfilesModule,
    MediaModule,
    GeoModule,
    ChatModule,
    SubscriptionsModule,
    ReportsModule,
    BuddiesModule,
    BlocksModule,
    EmailModule,
    ProfileViewsModule,
    LocationShareModule,
    NotificationModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
