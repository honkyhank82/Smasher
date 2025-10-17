import { Controller, Post, Body, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { IntegrityService } from './integrity.service';

/**
 * DTO for score submission with integrity token
 */
export class SubmitScoreDto {
  score: number;
  userId: string;
  integrityToken: string;
}

/**
 * DTO for purchase with integrity token
 */
export class ProcessPurchaseDto {
  itemId: string;
  amount: number;
  userId: string;
  integrityToken: string;
}

/**
 * DTO for generic action with integrity token
 */
export class VerifyActionDto {
  actionType: string;
  actionData: string;
  integrityToken: string;
}

@Controller('integrity')
export class IntegrityController {
  private readonly logger = new Logger(IntegrityController.name);

  constructor(private readonly integrityService: IntegrityService) {}

  /**
   * Example 1: Verify and submit game score
   */
  @Post('submit-score')
  async submitScore(@Body() dto: SubmitScoreDto) {
    // Reconstruct the request data exactly as it was on the client
    const requestData = `score=${dto.score}&userId=${dto.userId}`;

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

    // TODO: Save score to database
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
    // Reconstruct the request data
    const requestData = `itemId=${dto.itemId}&amount=${dto.amount.toFixed(2)}&userId=${dto.userId}`;

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
    // Reconstruct the request data
    const requestData = `action=${dto.actionType}&data=${dto.actionData}`;

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
