import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  async reportUser(
    @Request() req: any,
    @Body() body: { reportedUserId: string; reason: string; details?: string },
  ) {
    await this.reportsService.createReport(
      req.user.userId,
      body.reportedUserId,
      body.reason,
      body.details,
    );
    return { message: 'Report submitted successfully' };
  }
}
