import { Module } from '@nestjs/common';
import { IntegrityService } from './integrity.service';
import { IntegrityController } from './integrity.controller';

@Module({
  controllers: [IntegrityController],
  providers: [IntegrityService],
  exports: [IntegrityService],
})
export class IntegrityModule {}
