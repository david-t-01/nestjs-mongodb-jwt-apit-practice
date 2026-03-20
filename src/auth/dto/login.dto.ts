import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Username', example: 'david' })
  @IsString()
  readonly username: string;

  @ApiProperty({ description: 'Password', example: 'changeme' })
  @IsString()
  readonly password: string;
}

export class LoginResponseDto {
  @ApiProperty({ description: 'JWT access token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token: string;
}
