import { Body, Controller, Post, Get, UseGuards, BadRequestException, ForbiddenException } from '@nestjs/common';
import * as path from 'path';
import { AuthGuard } from '@nestjs/passport';
import { MediaService } from './media.service';
import { CreateSignedUploadDto, CreateSignedDownloadDto } from './dto/signed-url.dto';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  private sanitizeFileName(name: string): string {
    const raw = typeof name === 'string' ? name : '';
    // Strip directory components and traversal patterns
    let base = path.basename(raw).replace(/\.\.(\\|\/)?/g, '');
    // Remove path separators and control chars
    base = base.replace(/[\\\/]/g, '').replace(/[\0-\x1F]+/g, '');
    // Replace unsafe characters
    base = base.replace(/[^a-zA-Z0-9._-]/g, '_');
    // Enforce max length
    const MAX_LEN = 100;
    base = base.slice(0, MAX_LEN);
    // Fallback if empty or invalid
    if (!base || base === '.' || base === '..') {
      base = 'file';
    }
    return base;
  }

  @Post('signed-upload')
  @UseGuards(AuthGuard('jwt'))
  async createSignedUpload(
    @CurrentUser() user: { userId: string },
    @Body() body: { fileName: string; fileType: string; mediaType?: 'photo' | 'video' }
  ) {
    // Validate file type strictly: mediaType must match fileType
    const isVideo = body.mediaType === 'video' || body.fileType.startsWith('video/');
    const isPhoto = body.mediaType === 'photo' || body.fileType.startsWith('image/');
    if ((!isVideo && !isPhoto) ||
        (body.mediaType === 'video' && !body.fileType.startsWith('video/')) ||
        (body.mediaType === 'photo' && !body.fileType.startsWith('image/'))) {
      throw new BadRequestException('Only images and videos are allowed');
    }

    // Generate unique key for the file
    const timestamp = Date.now();
    const mediaFolder = isVideo ? 'videos' : 'photos';
    const safeFileName = this.sanitizeFileName(body.fileName);
    const key = `users/${user.userId}/${mediaFolder}/${timestamp}-${safeFileName}`;
    const result = await this.mediaService.createSignedUploadUrl(key, body.fileType);
    return {
      uploadUrl: result.url,
      fileKey: result.key,
      mediaType: isVideo ? 'video' : 'photo',
    };
  }

  @Post('signed-download')
  createSignedDownload(@Body() dto: CreateSignedDownloadDto) {
    return this.mediaService.createSignedDownloadUrl(dto.key);
  }

  @Post('upload')
  @UseGuards(AuthGuard('jwt'))
  async uploadMedia(
    @CurrentUser() user: { userId: string },
    @Body() body: { fileName: string; fileType: string; mediaType: 'photo' | 'video'; fileData: string }
  ) {
    const MAX_BASE64_SIZE = 50 * 1024 * 1024; // 50MB
    if (body.fileData && body.fileData.length > MAX_BASE64_SIZE) {
      throw new BadRequestException('File too large');
    }
    return this.mediaService.uploadMediaBase64(user.userId, body.fileName, body.fileType, body.mediaType, body.fileData);
  }

  @Post('confirm-upload')
  @UseGuards(AuthGuard('jwt'))
  async confirmUpload(
    @CurrentUser() user: { userId: string },
    @Body() body: { fileKey: string; fileType: string; mediaType: 'photo' | 'video' }
  ) {
    return this.mediaService.createMediaRecord(user.userId, body.fileKey, body.fileType, body.mediaType);
  }

  @Post('set-profile-picture')
  @UseGuards(AuthGuard('jwt'))
  async setProfilePicture(
    @CurrentUser() user: { userId: string },
    @Body() body: { mediaId: string }
  ) {
    return this.mediaService.setProfilePicture(user.userId, body.mediaId);
  }

  @Post('delete')
  @UseGuards(AuthGuard('jwt'))
  async deleteMedia(
    @CurrentUser() user: { userId: string },
    @Body() body: { mediaId: string }
  ) {
    return this.mediaService.deleteMedia(user.userId, body.mediaId);
  }

  @Get('my-media')
  @UseGuards(AuthGuard('jwt'))
  async getMyMedia(@CurrentUser() user: { userId: string }) {
    return this.mediaService.getUserMedia(user.userId);
  }

  @Post('admin/delete')
  @UseGuards(AuthGuard('jwt'))
  async adminDeleteMedia(
    @CurrentUser() user: { userId: string; isAdmin: boolean },
    @Body() body: { mediaId: string },
  ) {
    if (!user.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    return this.mediaService.adminDeleteMedia(body.mediaId);
  }
}
