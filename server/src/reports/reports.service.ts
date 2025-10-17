import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './report.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
  ) {}

  async createReport(
    reporterId: string,
    reportedId: string,
    reason: string,
    details?: string,
  ): Promise<void> {
    const report = this.reportRepository.create({
      reporter: { id: reporterId },
      reported: { id: reportedId },
      reason,
      details: details || null,
      status: 'pending',
    });
    await this.reportRepository.save(report);
  }
}
