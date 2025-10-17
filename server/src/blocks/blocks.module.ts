import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlocksController } from './blocks.controller';
import { BlocksService } from './blocks.service';
import { Block } from './block.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Block])],
  controllers: [BlocksController],
  providers: [BlocksService],
  exports: [BlocksService],
})
export class BlocksModule {}
