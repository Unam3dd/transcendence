import { IsNumber } from 'class-validator';

export class CreateBlockDto {
  @IsNumber({}, { message: 'user1 must be an id !' })
  user1: number;

  @IsNumber({}, { message: 'user2 must be an id !' })
  user2: number;
}
