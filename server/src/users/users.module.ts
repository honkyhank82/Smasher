import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Profile } from '../profiles/profile.entity';
import { Block } from '../blocks/block.entity';
import { Message } from '../chat/message.entity';
import { NotificationModule } from '../notifications/notification.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AdminMessageService } from './admin-message.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile, Block, Message]),
    NotificationModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, AdminMessageService],
  exports: [UsersService, AdminMessageService]
})
export class UsersModule {}
