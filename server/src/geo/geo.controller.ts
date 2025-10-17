import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { GeoService } from './geo.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('geo')
@UseGuards(JwtAuthGuard)
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Post('update-location')
  async updateLocation(
    @Request() req: any,
    @Body() body: { latitude: number; longitude: number },
  ) {
    await this.geoService.updateLocation(req.user.userId, body.latitude, body.longitude);
    return { message: 'Location updated successfully' };
  }

  @Get('nearby')
  async getNearbyUsers(@Request() req: any) {
    const users = await this.geoService.getNearbyUsers(req.user.userId);
    return users;
  }
}
