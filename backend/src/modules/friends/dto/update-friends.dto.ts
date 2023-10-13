import { PartialType } from '@nestjs/mapped-types';
import { CreateFriendsDto } from './create-friends.dto';

export class UpdateFriendsDto extends PartialType(CreateFriendsDto) {}
