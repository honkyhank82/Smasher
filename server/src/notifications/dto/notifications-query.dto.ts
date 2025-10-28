import { IsInt, IsOptional, Min } from 'class-validator';

export class NotificationsQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}