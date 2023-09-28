import { Test, TestingModule} from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;
  let mockUserRepository: Repository<User>;

  beforeEach(async () => {

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService, {
        provide: getRepositoryToken(User),
        useValue: mockUserRepository,
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('Should return Array of Users in Database', async () => {
    const mockUserDto : CreateUserDto = {
      login: "chjoie",
      firstName: "charles",
      lastName: "joie",
      nickName: "mologue",
      email: "chjoie@42.fr",
      a2f: false,
      avatar: "http://google.com"
    };

    let arr_user: User[];

    const mockFunctions = {
      findAll: jest.fn()
    }

    for (let i = 0; i < 10; i++) {
      
      mockUserDto.id = i;
      mockUserDto.login = `${mockUserDto.login}${(Math.random() + 1).toString(36).substring(1)}`;
      mockUserDto.nickName = `${(Math.random() + 1).toString(36).substring(1)}`;
      mockUserDto.a2f = (i & 0x1) ? true : false;
      
      console.log(`Register new User ${mockUserDto.login} ${mockUserDto.nickName}`);
    }
  })
});
