import { Injectable } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { UserError } from '../users/users.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  public async saveFilePath(id: number, filePath: string): Promise<User> {
    const file = await this.usersRepository.findOne({ where: { id } });

    if (!file) throw new UserError('User not found !');

    file.avatar = filePath;

    await this.usersRepository.update(file.id, file);

    return file;
  }

  public async decodeJWT(token: string): Promise<string[] | null> {
    const [type, jwt] = decodeURI(token)?.split(' ');

    if (type !== 'Bearer') return null;

    const [header, payload, signature] = jwt.split('.');
    return [atob(header), atob(payload), signature];
  }
}
