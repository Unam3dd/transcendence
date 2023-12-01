import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMessageDto {
  //auto-increment
  // @IsOptional()
  // @IsNumber({}, { message: 'id must be a number !' })
  // id?: number;

  @IsNumber({}, { message: 'content must be an number' })
  author: number;

  @IsNumber({}, { message: 'content must be an number' })
  recipient: number;

  @IsString({ message: 'content must be a string !' })
  content: string;

  // auto-completed
  // @IsDate({ message: 'createdAt must be a Date' })
  // createdAt: Date;
}
