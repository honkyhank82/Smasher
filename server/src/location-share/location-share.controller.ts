import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LocationShareService } from './location-share.service';
import { StartShareDto } from './dto/start-share.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Controller('location-share')
@UseGuards(JwtAuthGuard)
export class LocationShareController {
  constructor(private readonly locationShareService: LocationShareService) {}

  @Post('start')
  async startShare(@Request() req, @Body() dto: StartShareDto) {
    return this.locationShareService.startShare(req.user.userId, dto);
  }

  @Post(':id/stop')
  async stopShare(@Request() req, @Param('id') shareId: string) {
    await this.locationShareService.stopShare(req.user.userId, shareId);
    return { message: 'Location sharing stopped' };
  }

  @Put(':id/location')
  async updateLocation(
    @Request() req,
    @Param('id') shareId: string,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.locationShareService.updateLocation(
      req.user.userId,
      shareId,
      dto,
    );
  }

  @Get('active')
  async getActiveShares(@Request() req) {
    return this.locationShareService.getActiveShares(req.user.userId);
  }

  @Get('my-shares')
  async getMyShares(@Request() req) {
    return this.locationShareService.getMyShares(req.user.userId);
  }

  @Get(':id')
  async getShare(@Request() req, @Param('id') shareId: string) {
    return this.locationShareService.getShare(req.user.userId, shareId);
  }
}
