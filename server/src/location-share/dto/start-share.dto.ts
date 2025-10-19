import { IsUUID, IsNumber, Min, Max } from 'class-validator';

export class StartShareDto {
  @IsUUID()
  sharedWithUserId: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsNumber()
  @Min(1)
  @Max(1440) // Max 24 hours
  durationMinutes: number;
}
