import { forwardRef, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserService } from './user.service';
import { UserController } from './user.controller';

import { PrismaService } from 'src/common/prisma/prisma.service';

import { AuthModule } from '../auth/auth.module';

import { AccessStrategy } from '../auth/strategies/access.strategy';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [UserController],
  providers: [UserService, PrismaService, JwtService, AccessStrategy],
  exports: [UserService],
})
export class UserModule {};
