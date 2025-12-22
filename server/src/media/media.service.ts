import { Injectable, Logger, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from './media.entity';
import { User } from '../users/user.entity';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import * as https from 'https';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl?: string;

  constructor(
    @InjectRepository(Media) private readonly mediaRepo: Repository<Media>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {
    const endpoint = process.env.S3_ENDPOINT;
    const region = process.env.S3_REGION ?? 'auto';
    const accessKeyId = process.env.S3_ACCESS_KEY_ID;
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
    this.bucket = process.env.S3_BUCKET ?? 'smasher-media';
    this.publicBaseUrl = process.env.PUBLIC_MEDIA_BASE_URL ?? undefined;

    this.logger.log(`Initializing S3 client with endpoint: ${endpoint}, region: ${region}, bucket: ${this.bucket}`);
    this.logger.log(`Access Key ID: ${accessKeyId ? accessKeyId.substring(0, 8) + '...' : 'NOT SET'}`);

    // Create custom HTTPS agent for R2
    const httpsAgent = new https.Agent({
      keepAlive: true,
      maxSockets: 50,
      minVersion: 'TLSv1.2',
      ciphers: 'HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA',
      honorCipherOrder: true,
      secureOptions: require('constants').SSL_OP_NO_SSLv2 | require('constants').SSL_OP_NO_SSLv3,
    });

    this.s3 = new S3Client({
      region,
      endpoint,
      forcePathStyle: true, // R2 requires path-style URLs
      credentials: accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined,
      requestHandler: new NodeHttpHandler({
        httpsAgent,
        requestTimeout: 60000,
        connectionTimeout: 10000,
      }),
    });
  }

  async createSignedUploadUrl(key: string, contentType: string): Promise<{ url: string; key: string; method: 'PUT' }> {
    const command = new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: contentType });
    const url = await getSignedUrl(this.s3, command, { expiresIn: 60 * 5 }); // 5 minutes
    return { url, key, method: 'PUT' };
  }

  async createSignedDownloadUrl(key: string): Promise<{ url: string; key: string }> {
    if (this.publicBaseUrl) {
      return { url: `${this.publicBaseUrl.replace(/\/$/, '')}/${encodeURIComponent(key)}`, key };
    }
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    const url = await getSignedUrl(this.s3, command, { expiresIn: 60 * 10 }); // 10 minutes
    return { url, key };
  }

  async uploadMediaBase64(userId: string, fileName: string, contentType: string, mediaType: 'photo' | 'video', base64Data: string): Promise<{ id: string; key: string; url: string }> {
    this.logger.log(`Uploading ${mediaType} for user ${userId}`);
    
    // Generate unique key for the file
    const timestamp = Date.now();
    const mediaFolder = mediaType === 'video' ? 'videos' : 'photos';
    const key = `users/${userId}/${mediaFolder}/${timestamp}-${fileName}`;
    
    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64');
    this.logger.log(`File size: ${buffer.length} bytes`);
    
    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });
    
    try {
      this.logger.log(`Attempting upload to bucket: ${this.bucket}, key: ${key}`);
      const result = await this.s3.send(command);
      this.logger.log(`File uploaded successfully to R2: ${key}`, result);
    } catch (error) {
      this.logger.error(`Failed to upload to R2: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to upload file: ${error.message}`);
    }
    
    // Create media record
    return this.createMediaRecord(userId, key, contentType, mediaType);
  }

  async createMediaRecord(userId: string, key: string, contentType: string, mediaType: 'photo' | 'video'): Promise<{ id: string; key: string; url: string }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Check photo limit for photos only
    if (mediaType === 'photo') {
      const photoCount = await this.mediaRepo.count({
        where: { owner: { id: userId }, type: 'photo' },
      });

      const maxPhotos = user.isPremium ? 6 : 5;
      
      if (photoCount >= maxPhotos) {
        throw new BadRequestException(
          user.isPremium 
            ? 'Maximum 6 photos allowed for Premium users' 
            : 'Maximum 5 photos allowed. Upgrade to Premium to upload 6 photos'
        );
      }
    }

    const media = this.mediaRepo.create({
      owner: user,
      type: mediaType,
      key,
      contentType,
      isNsfw: false,
      isProfilePicture: false,
    });

    const saved = await this.mediaRepo.save(media);
    const { url } = await this.createSignedDownloadUrl(key);

    return {
      id: saved.id,
      key: saved.key,
      url,
    };
  }

  async setProfilePicture(userId: string, mediaId: string): Promise<{ ok: true }> {
    const media = await this.mediaRepo.findOne({ where: { id: mediaId }, relations: ['owner'] });
    if (!media) throw new NotFoundException('Media not found');
    if (!media.owner || media.owner.id !== userId) throw new ForbiddenException('Not your media');
    if (media.isNsfw) throw new BadRequestException('NSFW cannot be profile picture');

    // Unset previous profile pictures for this user
    await this.mediaRepo
      .createQueryBuilder()
      .update(Media)
      .set({ isProfilePicture: false })
      .where('ownerId = :userId', { userId })
      .andWhere('isProfilePicture = :flag', { flag: true })
      .execute();

    // Set this media as profile picture
    await this.mediaRepo.update({ id: mediaId }, { isProfilePicture: true });
    return { ok: true };
  }

  async deleteMedia(userId: string, mediaId: string): Promise<{ ok: true }> {
    const media = await this.mediaRepo.findOne({ where: { id: mediaId }, relations: ['owner'] });
    if (!media) throw new NotFoundException('Media not found');
    if (!media.owner || media.owner.id !== userId) throw new ForbiddenException('Not your media');

    await this.mediaRepo.remove(media);
    // Note: You may want to also delete from S3/R2 here
    return { ok: true };
  }

  async adminDeleteMedia(mediaId: string): Promise<{ ok: true }> {
    const media = await this.mediaRepo.findOne({ where: { id: mediaId } });
    if (!media) {
      throw new NotFoundException('Media not found');
    }
    await this.mediaRepo.remove(media);
    return { ok: true };
  }

  async getUserMedia(userId: string): Promise<any[]> {
    const media = await this.mediaRepo.find({
      where: { owner: { id: userId } },
      order: { createdAt: 'DESC' },
    });

    const result: any[] = [];
    for (const item of media) {
      const { url } = await this.createSignedDownloadUrl(item.key);
      result.push({
        id: item.id,
        type: item.type,
        url,
        isProfilePicture: item.isProfilePicture,
        createdAt: item.createdAt,
      });
    }

    return result;
  }
}
