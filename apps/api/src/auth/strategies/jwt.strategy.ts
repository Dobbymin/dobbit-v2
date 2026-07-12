import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '@dobbit/shared';

const jwtSecret = process.env.JWT_SECRET ?? '<JWT_SECRET_PLACEHOLDER>';

export interface AuthenticatedUser {
  userId: string;
  username: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  validate(payload: TokenPayload): AuthenticatedUser {
    return { userId: payload.sub, username: payload.username };
  }
}
