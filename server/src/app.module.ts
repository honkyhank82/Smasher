import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './config/config.module';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
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
              synchronize: true, // Temporarily enabled to fix schema
              ssl: {
                rejectUnauthorized: false,
              },
              retryAttempts: 3,
              retryDelay: 3000,
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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
