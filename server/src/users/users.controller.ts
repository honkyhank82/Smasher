import { Controller, Post, Get, Patch, Put, Delete, Body, Param, UseGuards, HttpCode, HttpStatus, ForbiddenException, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('deactivate')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async deactivateAccount(@CurrentUser() user: { userId: string }) {
    await this.usersService.deactivateAccount(user.userId);
    return {
      message: 'Account deactivated successfully. You can reactivate it anytime by logging in.',
    };
  }

  @Post('reactivate')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async reactivateAccount(@CurrentUser() user: { userId: string }) {
    await this.usersService.reactivateAccount(user.userId);
    return {
      message: 'Account reactivated successfully.',
    };
  }

  @Post('delete')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async scheduleAccountDeletion(@CurrentUser() user: { userId: string }) {
    const deletionDate = await this.usersService.scheduleAccountDeletion(user.userId);
    return {
      message: 'Account deletion scheduled. Your account will be permanently deleted in 30 days.',
      deletionDate,
    };
  }

  @Post('cancel-deletion')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async cancelAccountDeletion(@CurrentUser() user: { userId: string }) {
    await this.usersService.cancelAccountDeletion(user.userId);
    return {
      message: 'Account deletion cancelled. Your account is now active.',
    };
  }

  @Get('account-status')
  @UseGuards(AuthGuard('jwt'))
  async getAccountStatus(@CurrentUser() user: { userId: string }) {
    const status = await this.usersService.getAccountStatus(user.userId);
    return status;
  }

  @Get('privacy-settings')
  @UseGuards(AuthGuard('jwt'))
  async getPrivacySettings(@CurrentUser() user: { userId: string }) {
    const settings = await this.usersService.getPrivacySettings(user.userId);
    return settings;
  }

  @Patch('privacy-settings')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async updatePrivacySettings(
    @CurrentUser() user: { userId: string },
    @Body() settings: Partial<any>,
  ) {
    await this.usersService.updatePrivacySettings(user.userId, settings);
    return { message: 'Privacy settings updated successfully' };
  }

  @Get('blocked')
  @UseGuards(AuthGuard('jwt'))
  async getBlockedUsers(@CurrentUser() user: { userId: string }) {
    const blockedUsers = await this.usersService.getBlockedUsers(user.userId);
    return blockedUsers;
  }

  @Post('block/:targetUserId')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async blockUser(
    @CurrentUser() user: { userId: string },
    @Param('targetUserId') targetUserId: string,
  ) {
    await this.usersService.blockUser(user.userId, targetUserId);
    return { message: 'User blocked successfully' };
  }

  @Post('unblock/:targetUserId')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async unblockUser(
    @CurrentUser() user: { userId: string },
    @Param('targetUserId') targetUserId: string,
  ) {
    await this.usersService.unblockUser(user.userId, targetUserId);
    return { message: 'User unblocked successfully' };
  }

  @Put('push-token')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async savePushToken(
    @CurrentUser() user: { userId: string },
    @Body() body: { pushToken: string },
  ) {
    await this.usersService.savePushToken(user.userId, body.pushToken);
    return { message: 'Push token saved successfully' };
  }

  @Delete('push-token')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async removePushToken(@CurrentUser() user: { userId: string }) {
    await this.usersService.removePushToken(user.userId);
    return { message: 'Push token removed successfully' };
  }
}

  @Post('change-email')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async changeEmail(
    @CurrentUser() user: { userId: string },
    @Body() body: { newEmail: string; password: string },
  ) {
    await this.usersService.changeEmail(user.userId, body.newEmail, body.password);
    return { message: 'Email change requested. Please verify your new email address.' };
  }

  @Put('push-token')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async savePushToken(
    @CurrentUser() user: { userId: string },
    @Body() body: { pushToken: string },
  ) {
    await this.usersService.savePushToken(user.userId, body.pushToken);
    return { message: 'Push token saved successfully' };
  }

  @Delete('push-token')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async removePushToken(@CurrentUser() user: { userId: string }) {
    await this.usersService.removePushToken(user.userId);
    return { message: 'Push token removed successfully' };
  }

  @Get('admin/by-id/:targetUserId')
  @UseGuards(AuthGuard('jwt'))
  async adminGetUserById(
    @CurrentUser() user: { userId: string; isAdmin: boolean },
    @Param('targetUserId') targetUserId: string,
  ) {
    if (!user.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    const target = await this.usersService.findById(targetUserId);
    if (!target) {
      return null;
    }
    const { passwordHash, ...safe } = target as any;
    return {
      id: safe.id,
      email: safe.email,
      isAdmin: safe.isAdmin,
      isPremium: safe.isPremium,
      accountStatus: safe.accountStatus,
      createdAt: safe.createdAt,
    };
  }

  @Get('admin/by-email')
  @UseGuards(AuthGuard('jwt'))
  async adminGetUserByEmail(
    @CurrentUser() user: { userId: string; isAdmin: boolean },
    @Query('email') email: string,
  ) {
    if (!user.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    const target = await this.usersService.findByEmail(email);
    if (!target) {
      return null;
    }
    const { passwordHash, ...safe } = target as any;
    return {
      id: safe.id,
      email: safe.email,
      isAdmin: safe.isAdmin,
      isPremium: safe.isPremium,
      accountStatus: safe.accountStatus,
      createdAt: safe.createdAt,
    };
  }

  @Post('admin/deactivate/:targetUserId')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async adminDeactivateAccount(
    @CurrentUser() user: { userId: string; isAdmin: boolean },
    @Param('targetUserId') targetUserId: string,
  ) {
    if (!user.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    await this.usersService.deactivateAccount(targetUserId);
    return { message: 'User account deactivated successfully.' };
  }

  @Post('admin/reactivate/:targetUserId')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async adminReactivateAccount(
    @CurrentUser() user: { userId: string; isAdmin: boolean },
    @Param('targetUserId') targetUserId: string,
  ) {
    if (!user.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    await this.usersService.reactivateAccount(targetUserId);
    return { message: 'User account reactivated successfully.' };
  }

  @Post('admin/ban/:targetUserId')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async adminBanAccount(
    @CurrentUser() user: { userId: string; isAdmin: boolean },
    @Param('targetUserId') targetUserId: string,
  ) {
    if (!user.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    const deletionDate = await this.usersService.scheduleAccountDeletion(targetUserId);
    return {
      message: 'User account scheduled for deletion.',
      deletionDate,
    };
  }

  @Post('admin/privileges/:targetUserId')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async adminSetPrivileges(
    @CurrentUser() user: { userId: string; isAdmin: boolean },
    @Param('targetUserId') targetUserId: string,
    @Body() body: { isAdmin: boolean },
  ) {
    if (!user.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    await this.usersService.setAdminStatus(targetUserId, !!body.isAdmin);
    return { message: 'User privileges updated successfully.' };
  }
}
