import { Controller, Post, Body } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, SendVerificationDto, VerifyDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register({
      email: dto.email,
      birthdate: dto.birthdate,
      password: dto.password,
    });
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('send-verification')
  @Throttle(3, 3600) // 3 requests per hour
  sendVerification(@Body() dto: SendVerificationDto) {
    return this.auth.sendVerification(dto.email);
  }

  @Post('verify')
  @Throttle(10, 900) // 10 requests per 15 minutes
  verify(@Body() dto: VerifyDto) {
    return this.auth.verify(dto.email, dto.code);
  }
}
