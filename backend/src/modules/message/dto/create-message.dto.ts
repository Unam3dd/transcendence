import { IsObject, IsString } from 'class-validator';
import { ListUserSanitizeInterface } from 'src/interfaces/user.interfaces';

export class CreateMessageDto {
  @IsObject({ message: 'content must be an object ListUserSanitizeInterface' })
  author: ListUserSanitizeInterface | null;

  @IsObject({ message: 'content must be an object ListUserSanitizeInterface' })
  recipient: ListUserSanitizeInterface | null;

  @IsString({ message: 'content must be a string !' })
  content: string;
}
