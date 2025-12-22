import { IsString } from 'class-validator';

export class VerifyActionDto {
  @IsString()
  actionType: string;

  @IsString()
  actionData: string;

  @IsString()
  integrityToken: string;
}
