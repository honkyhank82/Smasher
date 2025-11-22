import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { randomInt, createHmac } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { VerificationCode } from './verification-code.entity';
import * as bcrypt from 'bcrypt';
import { Cron, CronExpression } from '@nestjs/schedule';

// Password+JWT auth remains; add passwordless verification code flow

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private pepper: string;
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly email: EmailService,
    @InjectRepository(VerificationCode)
    private readonly codes: Repository<VerificationCode>,
  ) {
    this.initPepper();
  }
  // Initialize and enforce required env vars
  private initPepper() {
    const rawPepper = process.env.VERIFICATION_CODE_PEPPER;
    const envPepper = (rawPepper ?? '').trim();

    if (!envPepper) {
      const nodeEnv = process.env.NODE_ENV || 'undefined';
      const hasJwt = !!(process.env.JWT_SECRET ?? '').trim();
      this.logger.error(
        `[AuthService] VERIFICATION_CODE_PEPPER is missing or empty. NODE_ENV=${nodeEnv}, JWT_SECRET set=${hasJwt}. ` +
        'Using fallback pepper derived from JWT_SECRET or a built-in default. Configure VERIFICATION_CODE_PEPPER as soon as possible.',
      );

      const jwtSecret = (process.env.JWT_SECRET ?? '').trim();
      if (jwtSecret) {
        // Derive a stable fallback pepper from JWT_SECRET so codes remain verifiable across restarts
        this.pepper = createHmac('sha256', 'verification-pepper-fallback').update(jwtSecret).digest('hex');
      } else {
        // Last-resort fallback; verification codes will still be hashed, but all environments share this pepper
        this.pepper = 'fallback-verification-pepper-change-me';
      }

      return;
    }

    this.pepper = envPepper;
  }

  async register(params: {
    email: string;
    birthdate: string;
    password: string;
  }) {
    try {
      // Check if user already exists
      const existing = await this.users.findByEmail(params.email);
      if (existing) {
        throw new BadRequestException('Email already in use');
      }

      // Validate birthdate (must be 18+)
      const birthDate = new Date(params.birthdate);
      const age = Math.floor(
        (Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
      );
      if (age < 18) {
        throw new BadRequestException('Must be 18 or older to register');
      }
      
      // Hash password
      const passwordHash = await bcrypt.hash(params.password, 10);
      await this.users.createUser(params.email, passwordHash, {
        birthdate: birthDate,
        age: new Date(),
        tos: new Date(),
      });
      return { message: 'Registration successful' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('[auth.service] Registration error:', error);
      throw new BadRequestException('Registration failed');
    }
  }

  async login(params: { email: string; password: string }) {
    try {
      const user = await this.users.findByEmail(params.email);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(params.password, user.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
      
      // Sign JWT token
      const accessToken = await this.jwt.signAsync({ 
        sub: user.id,
        isPremium: user.isPremium || false,
      });
      
      // Return user without sensitive data
      const { passwordHash, ...userWithoutPassword } = user;
      return { 
        access_token: accessToken, 
        user: userWithoutPassword 
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // Log unexpected errors for debugging
      console.error('[auth.service] Login error:', error);
      throw new UnauthorizedException('Login failed');
    }
  }

  // Send a 6-digit verification code for passwordless login
  async sendVerification(email: string) {
    const trimmedEmail = (email ?? '').trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      throw new BadRequestException('Invalid email format');
    }
    const normalizedEmail = trimmedEmail.toLowerCase();

    // Always generate a fresh code; avoid persisting plaintext beyond what's necessary
    const now = new Date();
    const codeToSend = randomInt(100000, 1000000).toString();
    const expiresAt = new Date(now.getTime() + 15 * 60_000);
    const codeHash = createHmac('sha256', this.pepper).update(codeToSend).digest('hex');

    const newRecord = this.codes.create({
      email: normalizedEmail,
      codeHash,
      expiresAt,
      used: false,
    });
    await this.codes.save(newRecord);

    // Send email (logs code even if email service not configured)
    await this.email.sendVerificationCode(normalizedEmail, codeToSend);

    return { message: 'Verification code sent' };
  }

  // Verify code and issue JWT (create user if needed)
  async verify(email: string, code: string) {
    const trimmedEmail = (email ?? '').trim();
    const trimmedCode = (code ?? '').trim();
    // Basic input validation to prevent invalid data reaching DB
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      throw new BadRequestException('Invalid email format');
    }
    if (!trimmedCode || !/^\d{6}$/.test(trimmedCode)) {
      throw new BadRequestException('Invalid verification code format');
    }

    const normalizedEmail = trimmedEmail.toLowerCase();
    const now = new Date();
    const codeHash = createHmac('sha256', this.pepper).update(trimmedCode).digest('hex');

    // Atomically mark code as used if it is valid and unexpired (match by hash)
    const updateResult = await this.codes
      .createQueryBuilder()
      .update(VerificationCode)
      .set({ used: true })
      .where('email = :email', { email: normalizedEmail })
      .andWhere('codeHash = :codeHash', { codeHash })
      .andWhere('used = :used', { used: false })
      .andWhere('expiresAt > :now', { now })
      .execute();

    if (!updateResult.affected || updateResult.affected === 0) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    // Find user; do NOT auto-create here to enforce age/TOS
    const user = await this.users.findByEmail(normalizedEmail);
    if (!user) {
      // Require registration so birthdate and ToS acceptance are collected and validated
      throw new BadRequestException('Registration required before passwordless login');
    }

    // Mark verified
    await this.users.setVerified(user.id);

    // Sign JWT
    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      isPremium: user.isPremium || false,
    });

    const { passwordHash, ...userWithoutPassword } = user;
    return {
      access_token: accessToken,
      user: userWithoutPassword,
    };
  }

  // Daily cleanup of expired verification codes
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredCodes() {
    try {
      const now = new Date();
      const result = await this.codes.delete({
        expiresAt: LessThan(now),
      });
      if (result.affected && result.affected > 0) {
        this.logger.log(`CleanupExpiredCodes deleted ${result.affected} records.`);
      }
    } catch (err) {
      this.logger.error('CleanupExpiredCodes failed', err as Error);
    }
  }
}
