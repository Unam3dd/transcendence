import {
  IsString,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsEmail,
  Length,
  IsUrl,
} from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  @IsNumber({}, { message: 'id must be a integer !' })
  id?: number;

  @IsOptional()
  @IsString({ message: 'login must be a string or null' })
  login?: string | null;

  @IsOptional()
  @IsString({ message: 'firstName must be a string or null' })
  firstName?: string | null;

  @IsOptional()
  @IsString({ message: 'lastName must be a string or null' })
  lastName?: string | null;

  @IsOptional()
  @Length(8, 120, {
    message: 'password must be between 8 and 120 characters',
  })
  @IsString({ message: 'password must be a string' })
  password: string | null;

  @IsOptional()
  @Length(3, 120, {
    message: 'nickName must be between 3 and 120 characters',
  })
  @IsString()
  nickName?: string | null;

  @IsEmail({}, { message: 'Invalid email format !' })
  @IsOptional()
  email?: string | null;

  @IsOptional()
  @IsBoolean()
  a2f: boolean;

  @IsOptional()
  @IsString({ message: 'String or URL is required !' })
  avatar: string;

  @IsOptional()
  @IsBoolean({ message: 'Boolean is required !' })
  is42: boolean;
}
