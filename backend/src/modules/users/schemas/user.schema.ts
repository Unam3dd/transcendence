import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsEmail,
  IsUrl,
} from 'class-validator';

export class UserSchema {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  login?: string | null;

  @ApiProperty()
  @IsOptional()
  @IsString()
  firstName?: string | null;

  @ApiProperty()
  @IsOptional()
  @IsString()
  lastName?: string | null;

  @ApiProperty()
  @IsOptional()
  @IsString()
  nickName?: string | null;

  @ApiProperty()
  @IsEmail()
  @IsOptional()
  email?: string | null;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  a2f: boolean;

  @ApiProperty()
  @IsOptional()
  @IsUrl()
  avatar: string;
}
