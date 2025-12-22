import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { IsNumber, Min, Max } from 'class-validator';
import { GeoService } from './geo.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Interface for authenticated requests
interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    isPremium: boolean;
  };
}

// DTO for location data with validation
export class LocationDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}

@Controller('geo')
@UseGuards(JwtAuthGuard)
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Post('update-location')
  async updateLocation(
    @Req() req: AuthenticatedRequest,
    @Body() body: LocationDto,
  ) {
    await this.geoService.updateLocation(
      req.user.userId,
      body.latitude,
      body.longitude,
    );
    return { message: 'Location updated successfully' };
  }

  @Get('nearby')
  async getNearbyUsers(@Req() req: AuthenticatedRequest) {
    const users = await this.geoService.getNearbyUsers(req.user.userId);
    return users;
  }
}
