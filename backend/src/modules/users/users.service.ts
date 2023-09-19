import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  public findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  public async findOne(id: number): Promise<User> {
    const data = await this.usersRepository.find();
    if (id <= 0 || id > data.length) return null;
    return data.find((e) => id === e.id);
  }

  public async register(user: CreateUserDto): Promise<User> {
    const { id } = user;

    const uinfo = await this.usersRepository.findOne({ where: { id } });

    if (uinfo)
      throw new HttpException('User ID already exists', HttpStatus.BAD_REQUEST);

    return this.usersRepository.save({ ...user });
  }
}
