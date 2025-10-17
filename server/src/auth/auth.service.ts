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
  }

  async login(params: { email: string; password: string }) {
    const user = await this.users.findByEmail(params.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = await bcrypt.compare(params.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const accessToken = await this.jwt.signAsync({ 
      sub: user.id,
      isPremium: user.isPremium || false,
    });
    return { access_token: accessToken, user };
  }

}
