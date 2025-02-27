import {
  Response,
} from 'express';

import Redis from 'ioredis';

import { forwardRef, Inject, Injectable } from '@nestjs/common';

import { InjectRedis } from '@nestjs-modules/ioredis';

import { User } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';

import { UpdateUserDto } from './dto/update-user.dto';

import { AuthService } from '../auth/auth.service';

import { TOKEN_NAME_ACCESS } from 'src/common/constants';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectRedis() private readonly redisClient: Redis,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  create(email: string, hashedPassword: string): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
      },
    });
  };

  async update(
    id: string,
    dto: UpdateUserDto,
  ): Promise<{email: string; updatedAt: Date}> {
    let data = dto;

    if (dto.password) { 
      data = { ...dto, password: await this.authService.hashedPassword(dto.password)};
    };

    return this.prisma.user.update({
      where: {
        id,
      },
      data
    });
  };

  async remove(
    id: string,
    res: Response,
  ): Promise<{ message: string }> {

    await this.redisClient.del(`user:${id}`);

    await this.prisma.user.delete({
      where: {
        id,
      },
    });

    res.clearCookie(TOKEN_NAME_ACCESS);

    return { message: 'Deleted successfully !' };
  };

  findOneByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        email
      },
    });
  };

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id
      }
    });
  };
};