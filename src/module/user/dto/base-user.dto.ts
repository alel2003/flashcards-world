import { ApiProperty } from '@nestjs/swagger';

import { IsEmail, IsString, MinLength } from 'class-validator';

export class BaseUserDto {
  @ApiProperty({
    description: 'email for authorization',
    example: 'test@gmail.com',
  })
  @IsEmail({}, { message: 'Email is not valid' })
  email: string;

  @ApiProperty({ description: 'password for authorization', example: '123456' })
  @MinLength(6, { message: 'Password is too short' })
  @IsString()
  password: string;

  @ApiProperty({ description: 'Last update timestamp', example: '2024-01-01T12:00:00Z' })
  updatedAt?: Date;
};