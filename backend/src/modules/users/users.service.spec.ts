import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

describe('UsersService', () => {
  let userService: UsersService;
  let mockUserRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    userService = await module.resolve(UsersService);
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
});
