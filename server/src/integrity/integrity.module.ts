import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrityService } from './integrity.service';
import { IntegrityController } from './integrity.controller';
import { ScoreSubmission } from './score-submission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ScoreSubmission])],
  controllers: [IntegrityController],
  providers: [IntegrityService],
  exports: [IntegrityService],
})
export class IntegrityModule {}
