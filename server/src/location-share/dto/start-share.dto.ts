import { IsUUID, IsNumber, Min, Max } from 'class-validator';

export class StartShareDto {
  @IsUUID()
  sharedWithUserId: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsNumber()
  @Min(1)
  @Max(1440) // Max 24 hours
  durationMinutes: number;
}
