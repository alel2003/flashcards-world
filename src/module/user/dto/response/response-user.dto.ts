import { ApiProperty } from '@nestjs/swagger';

import { IsDate } from 'class-validator';

import { Type } from 'class-transformer';

export class UserResponseDto {
  @ApiProperty({ example: 'ckb9u3j4o0001x7yg8xj2j4o7' })
  id: string;

  @ApiProperty({ example: 'test@example.com' })
  email: string;

  @ApiProperty({ description: 'Last update timestamp', example: '2024-01-01T12:00:00Z' })
  @Type(() => Date) 
  @IsDate()
  updatedAt?: Date;
};