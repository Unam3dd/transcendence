import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';

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

  public async findOneByLogin(login: string): Promise<User|null> {
    return (await this.usersRepository.findOne({ where: { login }}));
  }

  public async registerUser(user: CreateUserDto): Promise<User> {
    const { id } = user;

    const uinfo = await this.usersRepository.findOne({ where: { id } });

    if ((id != undefined || id != null) && uinfo)
      throw new HttpException('User ID already exists', HttpStatus.BAD_REQUEST);

    return this.usersRepository.save({ ...user });
  }

  public async updateUser(id: number, user: UpdateUserDto): Promise<User> {
    const target = await this.usersRepository.findOne({ where: { id } });

    if (!target) throw new Error('User not found');

    const updated = Object.assign(target, user);

    this.usersRepository.update(updated.id, updated);

    return (target);
  }

  public async deleteUser(id: number): Promise<User> {
    const target = await this.usersRepository.findOne({ where: { id } });

    if (!target) throw new Error('User not found');

    this.usersRepository.remove(target);

    return (target);
  }
}
