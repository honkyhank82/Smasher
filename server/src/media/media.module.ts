import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { Media } from './media.entity';
import { User } from '../users/user.entity';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Media, User]), PassportModule],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
