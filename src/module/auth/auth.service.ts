import {
  Response,
} from 'express';

import * as bcrypt from 'bcrypt';

import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

import {
  Injectable,
  BadRequestException,
  Inject,
  forwardRef,
  Logger,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { JwtService } from '@nestjs/jwt';

import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { UserResponseDto } from '@user/dto/response/response-user.dto';

import { UserService } from 'src/module/user/user.service';

import { JwtTokens } from './interface/jwt-token.interface';

import { TOKEN_NAME_ACCESS } from 'src/common/constants';

import {
  badRequestException,
} from 'src/common/utils/error.util';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwt: JwtService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    @InjectRedis() private readonly redisClient: Redis,
  ) {}

  async validateUser(email: string, password: string): Promise<UserResponseDto> {
    // logger
    this.logger.log(`Validating user with email: ${email}`);

    const user = await this.userService.findOneByEmail(email);

    if (!user) {
      this.logger.warn(`User with email ${email} not found`);
      throw new BadRequestException(`User with email: ${email} not found`);
    }

    const isMatch: boolean = await bcrypt.compare(password, user.password);
    badRequestException(!isMatch, 'Password does not match');

    // logger
    this.logger.log(`User ${email} validated successfully`);
    return { id: user.id, email: user.email };
  }

  async signUp(dto: CreateAuthDto, res: Response): Promise<{ message: string }> {
    // logger
    this.logger.log(`Signing up user with email: ${dto.email}`);

    const userExists = await this.userService.findOneByEmail(dto.email);
    badRequestException(userExists, `User with email: ${dto.email} already exists`);
    badRequestException(dto.password !== dto.repeatPassword, "Passwords don't match");

    const hashedPassword: string = await this.hashedPassword(dto.password);
    const user = await this.userService.create(dto.email, hashedPassword);

    // create tokens
    const tokens = await this.getTokens(user.id);
    this.logger.debug(`Generated tokens for user ${user.id}: ${JSON.stringify(tokens)}`);

    // adding to the redis store
    await this.storeRedisRefreshToken(user.id, tokens.refreshToken);
    // logger
    this.logger.log(`Stored refresh token in Redis for user ${user.id}`);

    // adding to the cookie store
    this.storeCookieAccess(res, tokens.accessToken);
    // logger
    this.logger.log(`Stored access token in cookies for user ${user.id}`);

    return { message: 'Register successful' };
  }

  async signIn(dto: LoginAuthDto, res: Response): Promise<{ message: string }> {
    // logger
    this.logger.log(`Signing in user with email: ${dto.email}`);

    const user = await this.validateUser(dto.email, dto.password);

    if (!user) {
      // logger
      this.logger.warn(`User does not exist: ${dto.email}`);
      throw new BadRequestException('User does not exist');
    }

    // create tokens
    const tokens = await this.getTokens(user.id);
    // logger
    this.logger.debug(`Generated tokens for user ${user.id}: ${JSON.stringify(tokens)}`);

    await this.storeRedisRefreshToken(user.id, tokens.refreshToken);

    // adding to the cookie store
    this.storeCookieAccess(res, tokens.accessToken);

    return { message: 'Login successful' };
  }

  async refreshToken(sub: string, res: Response): Promise<{ message: string }> {
    // logger
    this.logger.log(`Refreshing token for user: ${sub}`);

    // create tokens
    const tokens = await this.getTokens(sub);
    // logger
    this.logger.debug(`Generated new tokens for user ${sub}: ${JSON.stringify(tokens)}`);

    // adding to the redis store
    await this.storeRedisRefreshToken(sub, tokens.refreshToken);

    // adding to the cookie store
    this.storeCookieAccess(res, tokens.accessToken);

    return { message: 'Token refreshed' };
  }

  hashedPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  // private methods
  private async getTokens(sub: string): Promise<JwtTokens> {
    // logger
    this.logger.log(`Generating tokens for user ${sub}`);

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(
        { sub },
        {
          secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
          expiresIn: parseInt(this.configService.getOrThrow<string>('ACCESS_TOKEN_VALIDITY_DURATION_IN_SEC'), 10)
        },
      ),
      this.jwt.signAsync(
        { sub },
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
          expiresIn: parseInt(this.configService.getOrThrow<string>('REFRESH_TOKEN_VALIDITY_DURATION_IN_SEC'), 10),
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  private async storeRedisRefreshToken(userId: string, refreshToken: string): Promise<'OK'> {
    // logger
    this.logger.log(`Storing refresh token in Redis for user ${userId}`);

    return this.redisClient.set(
      `user:${userId}`,
      JSON.stringify(refreshToken),
      'EX',
      this.configService.getOrThrow<number>('REDIS_DURATION'),
    );
  }

  private storeCookieAccess(res: Response, accessToken: string) {
    const tokenTimeLive = parseInt(
      this.configService.getOrThrow<string>('ACCESS_TOKEN_VALIDITY_DURATION_IN_SEC'),
      10
    );

    const expires = new Date(Date.now() + tokenTimeLive * 1000);

    console.log('✅ Cookie Expires At (UTC):', expires.toUTCString());
  
    res.cookie(TOKEN_NAME_ACCESS, accessToken, {
      httpOnly: true,
      secure: this.configService.getOrThrow<string>('NODE_ENV') === 'production' ? true : false,
      sameSite: this.configService.getOrThrow<string>('NODE_ENV') === 'production' ? 'strict' : 'lax',
      expires
    });
  };
};