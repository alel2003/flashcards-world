import { Request } from 'express';

import { Injectable, UnauthorizedException } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

import { UserService } from 'src/module/user/user.service';

import { STRATEGY_ACCESS } from 'src/common/constants';

@Injectable()
export class AccessStrategy extends PassportStrategy(Strategy, STRATEGY_ACCESS) {
  constructor(
    public readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req.cookies?.accessToken || null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: { sub: string }): Promise<{id: string}> {
    const user = await this.userService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found or invalid token');
    }

    return {
      id: user.id,
    };
  }
};