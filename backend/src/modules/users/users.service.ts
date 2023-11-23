import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { isEmpty } from 'class-validator';
import { UserError } from './users.type';
import { UserSanitize } from 'src/interfaces/user.interfaces';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

// This class will do all operations needed for our requests like writing, modifiyng or accessing data from database
@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  // Return an array with all users from database
  public async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  public async getUsers(): Promise<UserSanitize[]> {
    const users = await this.usersRepository.find();
    const data = [];

    users.forEach((u) => {
      data.push(<UserSanitize>{
        id: u.id,
        login: u.login,
        nickName: u.nickName,
        avatar: u.avatar,
      });
    });

    return data;
  }

  // Return a single user from database using its id
  public async findOne(id: number): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { id } });
  }

  public async findOneSanitize(id: number): Promise<UserSanitize | null> {
    const user: User = await this.usersRepository.findOne({ where: { id } });

    return <UserSanitize>{
      id: user.id,
      login: user.login,
      nickName: user.nickName,
      avatar: user.avatar,
    };
  }

  // Return a single user from database using its login
  public async findOneByLogin(login: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { login } });
  }

  // Adding in the database a new user with all informations collected with the CreateUserDto
  public async registerUser(user: CreateUserDto): Promise<User> {
    const { login } = user;

    const uinfo = await this.usersRepository.findOne({ where: { login } });

    if (isEmpty(login) && uinfo) throw new UserError('User already exist');

    return await this.usersRepository.save({ ...user });
  }

  // Updating a user with all informations collected with the UpdateUserDto
  public async updateUser(id: number, user: UpdateUserDto): Promise<User> {
    const target = await this.usersRepository.findOne({ where: { id } });

    if (!target) throw new UserError('User not found');

    if (user.a2f != target.a2f && !user.a2f) user.a2fsecret = null;

    if (user.a2f != target.a2f && user.a2f)
      user.a2fsecret = JSON.stringify(this.generateSecret());

    const updated = Object.assign(target, user);

    await this.usersRepository.update(updated.id, updated);

    return target;
  }

  // Deleting an user in the database with its id
  public async deleteUser(id: number): Promise<User> {
    const target = await this.usersRepository.findOne({ where: { id } });

    if (!target) throw new UserError('User not found !');

    await this.usersRepository.remove(target);

    return target;
  }

  public async decodeJWT(token: string): Promise<string[] | null> {

    const [type, jwt] = decodeURI(token)?.split(' ');

    if (type !== 'Bearer') return null;

    const [header, payload, signature] = jwt.split('.');
    return [atob(header), atob(payload), signature];
  }

  generateSecret() {
    const secret = speakeasy.generateSecret({
        name: 'transcendence'
    });

    return ({ otpauthUrl: secret.otpauth_url, base32: secret.base32});
  }

  async respondWithQRCode(otpauthUrl: string) {
    return (await QRCode.toDataURL(otpauthUrl));
  }
}
