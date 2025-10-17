import { Body, Controller, Get, Patch, UseGuards, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsString, IsOptional, IsBoolean, IsNumber, MaxLength } from 'class-validator';
import { CurrentUser } from '../auth/current-user.decorator';
import { ProfilesService } from './profiles.service';
import { ProfileViewsService } from '../profile-views/profile-views.service';

class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(30)
  displayName?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  bio?: string | null;

  @IsOptional()
  @IsBoolean()
  isDistanceHidden?: boolean;

  @IsOptional()
  @IsNumber()
  lat?: number | null;

  @IsOptional()
  @IsNumber()
  lng?: number | null;
}

@Controller('profiles')
@UseGuards(AuthGuard('jwt'))
export class ProfilesController {
  constructor(
    private readonly profiles: ProfilesService,
    private readonly profileViews: ProfileViewsService,
  ) {}

  @Get('me')
  async me(@CurrentUser() user?: { userId: string }) {
    const profile = await this.profiles.getOrCreate(user!.userId);
    return {
      id: user!.userId,
      email: profile.user.email,
      profile: {
        displayName: profile.displayName,
        bio: profile.bio,
        profilePicture: null, // TODO: Add media relation
      },
    };
  }

  @Patch('me')
  update(@CurrentUser() user: { userId: string }, @Body() dto: UpdateProfileDto) {
    return this.profiles.update(user.userId, dto);
  }

  @Get(':userId')
  async getProfile(
    @Param('userId') userId: string,
    @CurrentUser() user: { userId: string; isPremium: boolean },
  ) {
    // Record the profile view
    await this.profileViews.recordView(user.userId, userId);
    
    return this.profiles.getByUserId(userId);
  }
}
