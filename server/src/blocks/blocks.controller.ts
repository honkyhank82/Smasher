import { Controller, Post, Delete, Body, UseGuards, Request, Param } from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('blocks')
@UseGuards(JwtAuthGuard)
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Post()
  async blockUser(
    @Request() req: any,
    @Body() body: { blockedUserId: string },
  ) {
    await this.blocksService.blockUser(req.user.userId, body.blockedUserId);
    return { message: 'User blocked successfully' };
  }

  @Delete(':blockedUserId')
  async unblockUser(
    @Request() req: any,
    @Param('blockedUserId') blockedUserId: string,
  ) {
    await this.blocksService.unblockUser(req.user.userId, blockedUserId);
    return { message: 'User unblocked successfully' };
  }
}
