import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';

import { APP_GUARD } from '@nestjs/core';

import { RedisModule } from '@nestjs-modules/ioredis';

import { CardModule } from './module/card/card.module';
import { AuthModule } from './module/auth/auth.module';
import { UserModule } from './module/user/user.module';

import { JwtGuard } from './common/guards/jwt.guard';

import { globalConfig } from './common/constants';

@Module({
  imports: [
    ConfigModule.forRoot(globalConfig),
    RedisModule,
    CardModule,
    AuthModule,
    UserModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
})
export class AppModule {};