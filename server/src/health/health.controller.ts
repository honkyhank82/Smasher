import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async check() {
    return this.healthService.check();
  }

  @Get('detailed')
  async detailedCheck() {
    return this.healthService.detailedCheck();
  }

  @Get('ready')
  async readiness() {
    return this.healthService.readinessCheck();
  }

  @Get('live')
  async liveness() {
    return this.healthService.livenessCheck();
  }
}
