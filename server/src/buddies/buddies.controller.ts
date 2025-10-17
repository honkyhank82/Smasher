import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BuddiesService } from './buddies.service';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('buddies')
@UseGuards(AuthGuard('jwt'))
export class BuddiesController {
  constructor(private readonly buddiesService: BuddiesService) {}

  @Get()
  async getBuddies(@CurrentUser() user: { userId: string }) {
    const buddies = await this.buddiesService.getBuddies(user.userId);
    
    return buddies.map((buddy) => ({
      id: buddy.id,
      email: buddy.email,
      displayName: buddy.profile?.displayName || 'Unknown',
      bio: buddy.profile?.bio,
      lat: buddy.profile?.lat,
      lng: buddy.profile?.lng,
    }));
  }

  @Post(':buddyId')
  async addBuddy(
    @CurrentUser() user: { userId: string },
    @Param('buddyId') buddyId: string,
  ) {
    await this.buddiesService.addBuddy(user.userId, buddyId);
    return { message: 'Buddy added successfully' };
  }

  @Delete(':buddyId')
  async removeBuddy(
    @CurrentUser() user: { userId: string },
    @Param('buddyId') buddyId: string,
  ) {
    await this.buddiesService.removeBuddy(user.userId, buddyId);
    return { message: 'Buddy removed successfully' };
  }

  @Get('check/:buddyId')
  async checkBuddy(
    @CurrentUser() user: { userId: string },
    @Param('buddyId') buddyId: string,
  ) {
    const isBuddy = await this.buddiesService.isBuddy(user.userId, buddyId);
    return { isBuddy };
  }
}
