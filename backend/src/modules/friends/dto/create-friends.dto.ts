import { IsEnum, IsNumber, IsOptional } from "class-validator";
import { friends_status } from '../friends.enum';

export class CreateFriendsDto {
    @IsNumber({}, { message: 'user1 must be an id !'})
    user1: number

    @IsNumber({}, { message: 'user2 must be an id !'})
    user2: number

    @IsOptional()
    @IsEnum(friends_status, { message: 'must be PENDING: 0 or APPROVED: 1'})
    status: friends_status
}