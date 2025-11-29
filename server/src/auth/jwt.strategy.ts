import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error(
        'JWT_SECRET is not configured. Please set JWT_SECRET in your environment or configuration before starting the server.'
      );
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: { sub: string; isPremium?: boolean; isAdmin?: boolean }) {
    return { 
      userId: payload.sub,
      isPremium: payload.isPremium || false,
      isAdmin: payload.isAdmin || false,
    };
  }
}
