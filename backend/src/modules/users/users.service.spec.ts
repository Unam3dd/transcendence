import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersModule } from './users.module';

describe('UsersService', () => {
  let userService: UsersService;
  let userRepository: User

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, {
        provide: getRepositoryToken(User),
        useClass: UsersModule
      }],
    }).compile();

    userService = module.get<UsersService>(UsersService);
    userRepository = module.get<User>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
    expect(userRepository).toBeDefined();
  });
});
