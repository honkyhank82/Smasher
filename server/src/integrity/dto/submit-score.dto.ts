import { IsNumber, IsUUID, IsString } from 'class-validator';

export class SubmitScoreDto {
  @IsNumber()
  score: number;

  @IsUUID()
  userId: string;

  @IsString()
  integrityToken: string;
}
