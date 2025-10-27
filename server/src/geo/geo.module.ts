import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeoController } from './geo.controller';
import { GeoService } from './geo.service';
import { Profile } from '../profiles/profile.entity';
import { Media } from '../media/media.entity';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profile, Media]),
    MediaModule,
  ],
  controllers: [GeoController],
  providers: [GeoService],
  exports: [GeoService],
})
export class GeoModule {}
