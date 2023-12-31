import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class CreateFriendsDto {
  @IsNumber({}, { message: 'user1 must be an id !' })
  user1: number;

  @IsNumber({}, { message: 'user2 must be an id !' })
  user2: number;

  @IsOptional()
  @IsBoolean({ message: 'status must be a boolean !' })
  status: boolean;

  @IsOptional()
  @IsBoolean({ message: 'must be true on applicant !' })
  applicant: boolean;
}
