import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { Profile } from './profile.entity';
import { User } from '../users/user.entity';
import { Media } from '../media/media.entity';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { ProfileViewsModule } from '../profile-views/profile-views.module';

import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profile, User, Media]),
    PassportModule,
    ProfileViewsModule,
    MediaModule,
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService],
})
export class ProfilesModule {}
