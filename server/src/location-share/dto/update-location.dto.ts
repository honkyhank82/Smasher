import { IsNumber } from 'class-validator';

export class UpdateLocationDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}
