import {
  Request,
  Response,
} from 'express';

import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UsePipes,
  UseGuards,
  Res,
  Req,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Public } from 'src/common/decorators/public.decorator';
import { CurrentUserId } from 'src/common/decorators/user.decorator';

import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';

import { BaseUserDto } from '../user/dto/base-user.dto';

@Public()
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //swagger
  @ApiOperation({ summary: 'sign up user' })
  @ApiBody({ description: 'sign up user', type: CreateAuthDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: BaseUserDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid email or password',
  })

  // sign-up
  @UsePipes(new ValidationPipe())
  @Post('sign-up')
  register(
    @Body() dto: CreateAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.signUp(dto, res);
  }

  //swagger
  @ApiOperation({ summary: 'sign in user' })
  @ApiBody({ description: 'sign in auth user', type: LoginAuthDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: BaseUserDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'User does not exist',
  })

  // sign-in
  @UseGuards(AuthGuard('local'))
  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('sign-in')
  login(
    @Body() dto: LoginAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.signIn(dto, res);
  }

  //swagger
  @ApiOperation({ summary: 'refresh token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: BaseUserDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Refresh token invalid or expired',
  })

  // refresh
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  refresh(
    @CurrentUserId() sub: string,
    @Res({ passthrough: true }) res: Response,
  ){
    return this.authService.refreshToken( sub, res);
  }
};