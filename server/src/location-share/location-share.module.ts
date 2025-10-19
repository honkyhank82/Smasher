import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationShareController } from './location-share.controller';
import { LocationShareService } from './location-share.service';
import { LocationShare } from './location-share.entity';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LocationShare]),
    NotificationModule,
  ],
  controllers: [LocationShareController],
  providers: [LocationShareService],
  exports: [LocationShareService],
})
export class LocationShareModule {}
