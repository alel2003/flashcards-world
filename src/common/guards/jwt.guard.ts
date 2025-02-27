import { Request } from 'express';

import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { ConfigService } from '@nestjs/config';

import { Reflector } from '@nestjs/core';

import { AuthGuard } from '@nestjs/passport';

import { IS_PUBLIC_KEY, STRATEGY_ACCESS } from 'src/common/constants';

@Injectable()
export class JwtGuard extends AuthGuard(STRATEGY_ACCESS) {
  constructor(
    private reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic: boolean = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      console.error('JwtGuard: Token missing!');
      throw new UnauthorizedException('Access denied: missing token.');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });

      console.log(`JwtGuard: Token valid! User ID: ${payload.sub}`);

      request.user = { sub: payload.sub };

      return true;
    } catch (error) {
      console.error(`JwtGuard: Token validation error: ${error.message}`);
      throw new UnauthorizedException('Access denied: invalid token.');
    }
  }

  // token verification 
  private extractToken(request: Request): string | undefined {
    console.log('🔍 Headers:', request.headers);
    console.log('🔍 Cookies:', request.cookies);
  
    const cookieHeader = request.headers.cookie;
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
      const accessTokens = cookies
        .filter(cookie => cookie.startsWith('accessToken='))
        .map(cookie => cookie.split('=')[1]);
  
      console.log('🔍 Found accessTokens:', accessTokens);
  
      for (const token of accessTokens.reverse()) {
        try {
          const payload = this.jwtService.verify(token, {
            secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
          });
          console.log('Found a valid token in Cookies:', token);
          return token; 
        } catch (error) {
          console.log('Invalid token in Cookies:', token, 'Error:', error.message);
        }
      }
    }
  
    const authHeader = request.headers.authorization;
    if (authHeader) {
      const [type, token] = authHeader.split(' ');
      if (type === 'Bearer' && token) {
        console.log('Found token in Authorization Header:', token);
        return token;
      }
    }
  
    console.error('Token not found in Cookies or Headers.');
    return undefined;
  }
};