import { forwardRef, Module } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';

import { JwtModule } from '@nestjs/jwt';

import { PrismaService } from 'src/common/prisma/prisma.service';
import { UserModule } from 'src/module/user/user.module';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { LocalStrategy } from './strategies/local.strategy';

import { AccessStrategy } from './strategies/access.strategy';

import { RefreshTokenStrategy } from './strategies/refreshToken.strategy';

import { RedisModule } from 'src/common/redis/redis.module';

import { getJwtConfig } from 'src/common/config/jwt.config';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    forwardRef(() => UserModule),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: getJwtConfig,
      inject: [ConfigService],
    }),
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, LocalStrategy, RefreshTokenStrategy, AccessStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {};