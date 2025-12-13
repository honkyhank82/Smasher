import { Body, Controller, Get, Patch, UseGuards, Param, ForbiddenException, NotFoundException } from '@nestjs/common';
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
  @IsBoolean()
  showAge?: boolean;

  @IsOptional()
  @IsNumber()
  lat?: number | null;

  @IsOptional()
  @IsNumber()
  lng?: number | null;

  @IsOptional()
  @IsNumber()
  heightCm?: number | null;

  @IsOptional()
  @IsNumber()
  weightKg?: number | null;

  @IsOptional()
  @IsNumber()
  heightIn?: number | null;

  @IsOptional()
  @IsNumber()
  weightLbs?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  ethnicity?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  bodyType?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  sexualPosition?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  relationshipStatus?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lookingFor?: string | null;
}

@Controller('profiles')
@UseGuards(AuthGuard('jwt'))
export class ProfilesController {
  constructor(
    private readonly profiles: ProfilesService,
    private readonly profileViews: ProfileViewsService,
  ) {}

  @Get('me')
  async me(@CurrentUser() user?: { userId: string; isPremium: boolean; isAdmin: boolean }) {
    try {
      const profile = await this.profiles.getByUserId(user!.userId);
      return {
        id: user!.userId,
        email: profile.email,
        isPremium: user!.isPremium,
        isAdmin: user!.isAdmin,
        profile: {
          displayName: profile.displayName,
          bio: profile.bio,
          showAge: profile.showAge,
          heightCm: profile.heightCm,
          weightKg: profile.weightKg,
          heightIn: profile.heightIn,
          weightLbs: profile.weightLbs,
          ethnicity: profile.ethnicity,
          bodyType: profile.bodyType,
          sexualPosition: profile.sexualPosition,
          relationshipStatus: profile.relationshipStatus,
          lookingFor: profile.lookingFor,
          profilePicture: null, // TODO: Add media relation
        },
      };
    } catch (error) {
      console.error('Error in me endpoint:', error);
      throw new NotFoundException('Profile not found');
    }
  }

  @Get(':id')
  async getProfile(
    @CurrentUser() currentUser: { userId: string; isPremium: boolean; isAdmin: boolean },
    @Param('id') userId: string,
  ) {
    try {
      // If the requested profile is the current user's profile, return it directly
      if (userId === 'me' || userId === currentUser.userId) {
        return await this.me(currentUser);
      }

      // For other users' profiles, get the profile and record the view
      const profile = await this.profiles.getByUserId(userId);
      
      // Record the profile view (if not viewing your own profile)
      if (userId !== currentUser.userId) {
        await this.profileViews.recordView(currentUser.userId, userId);
      }

      return profile;
    } catch (error) {
      console.error('Error in getProfile endpoint:', error);
      throw new NotFoundException('Profile not found');
    }
        relationshipStatus: profile.relationshipStatus,
        lookingFor: profile.lookingFor,
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

  @Patch('admin/:userId')
  updateByAdmin(
    @CurrentUser() current: { userId: string; isAdmin: boolean },
    @Param('userId') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    if (!current.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    return this.profiles.update(userId, dto);
  }
}
