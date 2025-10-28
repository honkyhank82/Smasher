import { IsNumber, IsUUID, IsString } from 'class-validator';

export class ProcessPurchaseDto {
  @IsString()
  itemId: string;

  @IsNumber()
  amount: number;

  @IsUUID()
  userId: string;

  @IsString()
  integrityToken: string;
}