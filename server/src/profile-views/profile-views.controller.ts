import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../auth/current-user.decorator';
import { ProfileViewsService } from './profile-views.service';

@Controller('profile-views')
@UseGuards(AuthGuard('jwt'))
export class ProfileViewsController {
  constructor(private readonly profileViewsService: ProfileViewsService) {}

  @Get('viewers')
  async getViewers(
    @CurrentUser() user: { userId: string; isPremium: boolean },
  ) {
    const viewers = await this.profileViewsService.getViewers(
      user.userId,
      user.isPremium,
    );
    const count = await this.profileViewsService.getViewersCount(user.userId);

    return {
      viewers,
      totalCount: count,
      isPremium: user.isPremium,
    };
  }
}
