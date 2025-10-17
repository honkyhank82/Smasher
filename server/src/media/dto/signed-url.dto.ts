import { IsIn, IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateSignedUploadDto {
  @IsString()
  @IsNotEmpty()
  // e.g., users/{userId}/images/{uuid}.jpg or videos/{uuid}.mp4
  // Avoid path traversal
  @Matches(/^(?!\.\.|\/)([\w\-\/\.])+$/)
  key!: string;

  @IsString()
  @IsNotEmpty()
  // Basic safeguard for content types
  @Matches(/^(image\/(jpeg|png|webp|gif)|video\/(mp4|webm))$/)
  contentType!: string;
}

export class CreateSignedDownloadDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?!\.\.|\/)([\w\-\/\.])+$/)
  key!: string;
}
