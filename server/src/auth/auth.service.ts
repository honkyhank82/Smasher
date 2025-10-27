import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
// import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcryptjs';

// Verification code logic removed

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

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

}
