import { Module } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { PrismaService } from 'src/common/prisma/prisma.service';

import { CardService } from './card.service';
import { CardController } from './card.controller';

import { AuthModule } from '../auth/auth.module';

import { UserModule } from 'src/module/user/user.module';

import { AccessStrategy } from '../auth/strategies/access.strategy';

@Module({
  imports: [AuthModule, UserModule],
  controllers: [CardController],
  providers: [CardService, PrismaService, JwtService, AccessStrategy],
})
export class CardModule {};