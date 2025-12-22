import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileView } from './profile-view.entity';
import { ProfileViewsService } from './profile-views.service';
import { ProfileViewsController } from './profile-views.controller';
import { User } from '../users/user.entity';
import { Profile } from '../profiles/profile.entity';
import { Media } from '../media/media.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProfileView, User, Profile, Media])],
  controllers: [ProfileViewsController],
  providers: [ProfileViewsService],
  exports: [ProfileViewsService],
})
export class ProfileViewsModule {}
