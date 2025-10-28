import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Param, 
  UseGuards,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BuddiesService } from './buddies.service';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('buddies')
@UseGuards(AuthGuard('jwt'))
export class BuddiesController {
  constructor(private readonly buddiesService: BuddiesService) {}

  @Get()
  async getBuddies(@CurrentUser() user: { userId: string }) {
    try {
      const buddies = await this.buddiesService.getBuddies(user.userId);
      
      return buddies.map((buddy) => ({
        id: buddy.id,
        email: buddy.email,
        displayName: buddy.profile?.displayName || 'Unknown',
        bio: buddy.profile?.bio,
        lat: buddy.profile?.lat,
        lng: buddy.profile?.lng,
      }));
    } catch (error) {
      if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
        throw new NotFoundException('User not found');
      }
      if (error.message?.includes('permission') || error.message?.includes('unauthorized')) {
        throw new ForbiddenException('Access denied');
      }
      throw new InternalServerErrorException('Failed to retrieve buddies');
    }
  }

  @Post(':buddyId')
  async addBuddy(
    @CurrentUser() user: { userId: string },
    @Param('buddyId') buddyId: string,
  ) {
    try {
      if (!buddyId || buddyId.trim() === '') {
        throw new BadRequestException('Buddy ID is required');
      }
      
      await this.buddiesService.addBuddy(user.userId, buddyId);
      return { message: 'Buddy added successfully' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
        throw new NotFoundException('Buddy not found');
      }
      if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
        throw new BadRequestException('Buddy already added');
      }
      if (error.message?.includes('permission') || error.message?.includes('unauthorized')) {
        throw new ForbiddenException('Cannot add this buddy');
      }
      throw new InternalServerErrorException('Failed to add buddy');
    }
  }

  @Delete(':buddyId')
  async removeBuddy(
    @CurrentUser() user: { userId: string },
    @Param('buddyId') buddyId: string,
  ) {
    try {
      if (!buddyId || buddyId.trim() === '') {
        throw new BadRequestException('Buddy ID is required');
      }
      
      await this.buddiesService.removeBuddy(user.userId, buddyId);
      return { message: 'Buddy removed successfully' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
        throw new NotFoundException('Buddy relationship not found');
      }
      if (error.message?.includes('permission') || error.message?.includes('unauthorized')) {
        throw new ForbiddenException('Cannot remove this buddy');
      }
      throw new InternalServerErrorException('Failed to remove buddy');
    }
  }

  @Get('check/:buddyId')
  async checkBuddy(
    @CurrentUser() user: { userId: string },
    @Param('buddyId') buddyId: string,
  ) {
    try {
      if (!buddyId || buddyId.trim() === '') {
        throw new BadRequestException('Buddy ID is required');
      }
      
      const isBuddy = await this.buddiesService.isBuddy(user.userId, buddyId);
      return { isBuddy };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
        throw new NotFoundException('User not found');
      }
      if (error.message?.includes('permission') || error.message?.includes('unauthorized')) {
        throw new ForbiddenException('Access denied');
      }
      throw new InternalServerErrorException('Failed to check buddy status');
    }
  }
}
