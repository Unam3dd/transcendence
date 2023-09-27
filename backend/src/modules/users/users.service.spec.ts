import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersService', () => {
  let userService: UsersService;
  let mockUserRepository: Repository<User>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, {
        provide: getRepositoryToken(User),
        useValue: mockUserRepository
      }],
    }).compile();

    userService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
    expect(userService.deleteUser).toBeDefined();
    expect(userService.findAll).toBeDefined();
    expect(userService.findOne).toBeDefined();
    expect(userService.findOneByLogin).toBeDefined();
    expect(userService.registerUser).toBeDefined();
    expect(userService.updateUser).toBeDefined();
  });

  test('Create fews users', () => {
    let u: CreateUserDto = {
      id: 1,
      login: 'stales',
      firstName: 'sam',
      lastName: 'tales',
      nickName: 'unam3dd',
      email: null,
      a2f: false,
      avatar: 'http://avatar.com/'
    };

    let users =  [
      {
        id: 1,
        login: 'stales',
        firstName: 'sam',
        lastName: 'tales',
        nickName: 'unam3dd',
        email: null,
        a2f: false,
        avatar: 'http://avatar.com/'
      },
      {
        id: 2,
        login: 'test1',
        firstName: 'test1',
        lastName: 'test1',
        nickName: null,
        email: 'test1@gmail.com',
        a2f: true,
        avatar: 'http://avatar.com/'
      },
      {
        id: 3,
        login: 'test2',
        firstName: 'test2',
        lastName: 'test2',
        nickName: 'superNickName',
        email: 'test2@gmail.com',
        a2f: false,
        avatar: 'http://avatar.com'
      }
    ];
  })
});
