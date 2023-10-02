import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { isEmpty } from 'class-validator';
import { UserError } from './users.type';

// This class will do all operations needed for our requests like writing, modifiyng or accessing data from database
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Return an array with all users from database 
  public findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }
  
  // Return a single user from database using its id
  public async findOne(id: number): Promise<User | null> {
    return (await this.usersRepository.findOne({ where: { id }}));
  }

  // Return a single user from database using its login
  public async findOneByLogin(login: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { login } });
  }

  // Adding in the database a new user with all informations collected with the CreateUserDto
  public async registerUser(user: CreateUserDto): Promise<User> {
    const { id } = user;

    const uinfo = await this.usersRepository.findOne({ where: { id } });

    if (isEmpty(id) && uinfo) throw new UserError('User already exist');

    return (this.usersRepository.save({ ...user }));
  }

  // Updating an user with all informations collected with the UpdateUserDto
  public async updateUser(id: number, user: UpdateUserDto): Promise<User> {
    const target = await this.usersRepository.findOne({ where: { id } });

    if (!target) throw new UserError('User not found');

    const updated = Object.assign(target, user);

    this.usersRepository.update(updated.id, updated);

    return (target);
  }

  // Deleting an user in the database with its id
  public async deleteUser(id: number): Promise<User> {
    const target = await this.usersRepository.findOne({ where: { id } });

    if (!target) throw new UserError('User not found !');

    this.usersRepository.remove(target);

    return (target);
  }
}
