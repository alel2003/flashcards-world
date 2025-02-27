import { IsString, MinLength } from 'class-validator';

import { BaseUserDto } from '../../user/dto/base-user.dto';

import { ApiProperty } from '@nestjs/swagger';

export class CreateAuthDto extends BaseUserDto {
  @ApiProperty({
    description: 'repeat password for authorization',
    example: '123456',
  })
  
  @MinLength(6, { message: 'Password is too short' })
  @IsString()
  repeatPassword: string;
};