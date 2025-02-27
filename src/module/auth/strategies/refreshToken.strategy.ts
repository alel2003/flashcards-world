import { Request } from 'express';

import Redis from 'ioredis';

import { PassportStrategy } from '@nestjs/passport';

import { InjectRedis } from '@nestjs-modules/ioredis';

import { ExtractJwt, Strategy } from 'passport-jwt';

import { Injectable } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { BEARER, STRATEGY_REFRESH } from 'src/common/constants';

import { unauthorizedException } from 'src/common/utils/error.util';


@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  STRATEGY_REFRESH,
) {
  constructor(
    public readonly configService: ConfigService,
    @InjectRedis() private readonly redis: Redis,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, sub: string) {
    const authHeader = req.get('Authorization') || '';

    unauthorizedException(
      !authHeader ||
        typeof authHeader !== 'string' ||
        !authHeader.startsWith(BEARER),
      'Missing or invalid refresh token',
    );

    const refreshToken = authHeader.replace(BEARER, '').trim();

    const tokenCache = await this.redis.get(`user:${sub}`);

    unauthorizedException(
      !tokenCache || tokenCache !== refreshToken,
      'Invalid refresh token.',
    );

    unauthorizedException(!refreshToken, 'Refresh token is required');

    await this.redis.del(`user:${sub}`);

    return { sub, refreshToken };
  }
};