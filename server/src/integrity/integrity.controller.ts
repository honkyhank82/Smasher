import { Controller, Post, Body, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IntegrityService } from './integrity.service';
import { SubmitScoreDto } from './dto/submit-score.dto';
import { ProcessPurchaseDto } from './dto/process-purchase.dto';
import { VerifyActionDto } from './dto/verify-action.dto';
import { ScoreSubmission } from './score-submission.entity';


@Controller('integrity')
export class IntegrityController {
  private readonly logger = new Logger(IntegrityController.name);

  constructor(
    private readonly integrityService: IntegrityService,
    @InjectRepository(ScoreSubmission)
    private readonly scoreRepo: Repository<ScoreSubmission>,
  ) {}

  /**
   * Example 1: Verify and submit game score
   */
  @Post('submit-score')
  async submitScore(@Body() dto: SubmitScoreDto) {
    // Reconstruct request data deterministically using URLSearchParams
    const params = new URLSearchParams();
    // Fixed key order, only include defined values
    if (dto.score !== undefined && dto.score !== null) params.append('score', String(dto.score));
    if (dto.userId) params.append('userId', dto.userId);
    const requestData = params.toString();

    // Verify integrity token with request hash
    const verification = await this.integrityService.verifyIntegrityWithRequestHash(
      dto.integrityToken,
      requestData,
    );

    if (!verification.isValid) {
      this.logger.warn('Score submission failed integrity check', {
        userId: dto.userId,
        error: verification.error,
        warnings: verification.warnings,
      });

      throw new HttpException(
        {
          message: 'Integrity verification failed',
          error: verification.error,
          warnings: verification.warnings,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // Check for warnings (replay attacks, etc.)
    if (verification.warnings && verification.warnings.length > 0) {
      this.logger.warn('Score submission has warnings', {
        userId: dto.userId,
        warnings: verification.warnings,
      });
    }

    // Integrity verified - proceed with score submission
    this.logger.log('Score submission verified', { userId: dto.userId, score: dto.score });
    // Persist score to database
    try {
      const record = this.scoreRepo.create({ userId: dto.userId, score: dto.score });
      await this.scoreRepo.save(record);
    } catch (err) {
      this.logger.error('Failed to persist score submission', { userId: dto.userId, error: err?.message || String(err) });
      throw new HttpException({ message: 'Failed to save score' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return {
      success: true,
      message: 'Score submitted successfully',
      score: dto.score,
    };
  }

  /**
   * Example 2: Verify and process purchase
   */
  @Post('process-purchase')
  async processPurchase(@Body() dto: ProcessPurchaseDto) {
    // Reconstruct request data deterministically
    const params = new URLSearchParams();
    if (dto.itemId) params.append('itemId', dto.itemId);
    if (dto.amount !== undefined && dto.amount !== null) params.append('amount', dto.amount.toFixed(2));
    if (dto.userId) params.append('userId', dto.userId);
    const requestData = params.toString();

    // Verify integrity token
    const verification = await this.integrityService.verifyIntegrityWithRequestHash(
      dto.integrityToken,
      requestData,
    );

    if (!verification.isValid) {
      this.logger.error('Purchase failed integrity check', {
        userId: dto.userId,
        itemId: dto.itemId,
        error: verification.error,
      });

      throw new HttpException(
        {
          message: 'Purchase verification failed',
          error: verification.error,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // Additional checks for purchases
    if (verification.payload?.accountDetails.appLicensingVerdict !== 'LICENSED') {
      throw new HttpException(
        {
          message: 'App is not licensed',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // Integrity verified - proceed with purchase
    this.logger.log('Purchase verified', {
      userId: dto.userId,
      itemId: dto.itemId,
      amount: dto.amount,
    });

    // TODO: Process purchase in database
    return {
      success: true,
      message: 'Purchase processed successfully',
      itemId: dto.itemId,
    };
  }

  /**
   * Example 3: Verify generic user action
   */
  @Post('verify-action')
  async verifyAction(@Body() dto: VerifyActionDto) {
    // Reconstruct request data deterministically
    const params = new URLSearchParams();
    if (dto.actionType) params.append('action', dto.actionType);
    if (dto.actionData) params.append('data', dto.actionData);
    const requestData = params.toString();

    // Verify integrity token
    const verification = await this.integrityService.verifyIntegrityWithRequestHash(
      dto.integrityToken,
      requestData,
    );

    if (!verification.isValid) {
      this.logger.warn('Action failed integrity check', {
        actionType: dto.actionType,
        error: verification.error,
      });

      throw new HttpException(
        {
          message: 'Action verification failed',
          error: verification.error,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // Integrity verified
    this.logger.log('Action verified', { actionType: dto.actionType });

    return {
      success: true,
      message: 'Action verified successfully',
      payload: verification.payload,
    };
  }

  /**
   * Decrypt and verify token without request hash (for testing)
   */
  @Post('verify-token')
  async verifyToken(@Body() body: { integrityToken: string }) {
    const verification = await this.integrityService.decryptAndVerifyToken(body.integrityToken);

    if (!verification.isValid) {
      throw new HttpException(
        {
          message: 'Token verification failed',
          error: verification.error,
          warnings: verification.warnings,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    return {
      success: true,
      payload: verification.payload,
      warnings: verification.warnings,
    };
  }
}
