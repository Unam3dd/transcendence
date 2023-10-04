import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { isEmpty } from 'class-validator';
import { UserError } from './users.type';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  public async findAll(): Promise<User[]> {
    return (await this.usersRepository.find());
  }

  public async findOne(id: number): Promise<User | null> {
    return (await this.usersRepository.findOne({ where: { id } }));
  }

  public async findOneByLogin(login: string): Promise<User | null> {
    return (await this.usersRepository.findOne({ where: { login } }));
  }

  public async registerUser(user: CreateUserDto): Promise<User> {
    const { id } = user;

    const uinfo = await this.usersRepository.findOne({ where: { id } });

    if (isEmpty(id) && uinfo) throw new UserError('User already exist');

    return (await this.usersRepository.save({ ...user }));
  }

  public async updateUser(id: number, user: UpdateUserDto): Promise<User> {
    const target = await this.usersRepository.findOne({ where: { id } });

    if (!target) throw new UserError('User not found');

    const updated = Object.assign(target, user);

    await this.usersRepository.update(updated.id, updated);

    return (target);
  }

  public async deleteUser(id: number): Promise<User> {
    const target = await this.usersRepository.findOne({ where: { id } });

    if (!target) throw new UserError('User not found !');

    await this.usersRepository.remove(target);

    return (target);
  }
}
