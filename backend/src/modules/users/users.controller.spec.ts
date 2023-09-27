import { Test, TestingModule} from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;
  let mockUserRepository: Repository<User>;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {

    mockUserRepository = {
      create: jest.fn(),
      save: jest.fn(),
    } as any;

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

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it('shoudl return 201 if User is successfully created', async () => {
    const mockUserDto : CreateUserDto = {
      id: 1,
      login: "chjoie",
      firstName: "charles",
      lastName: "joie",
      nickName: "mologue",
      email: "chjoie@42.fr",
      a2f: true,
      avatar: "http://google.com"
    };

    const mockUser : User = {
      id: 1,
      login: "chjoie",
      firstName: "charles",
      lastName: "joie",
      nickName: "mologue",
      email: "chjoie@42.fr",
      a2f: true,
      avatar: "http://google.com",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    jest.spyOn(mockUserRepository, 'create').mockReturnValue(mockUser);
    jest.spyOn(mockUserRepository, 'save').mockResolvedValue(mockUser);

    jest.spyOn(usersService, 'registerUser').mockResolvedValue(undefined);

    await usersController.RegisterNewUser(mockUserDto, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
  });

  it('Should return 409 if user cant be created', async () => {
    const mockUserDto : CreateUserDto = {
      id: 1,
      login: "chjoie",
      firstName: "charles",
      lastName: "joie",
      nickName: "mologue",
      email: "chjoie@42.fr",
      a2f: true,
      avatar: "link"
    };

    const mockUser : User = {
      id: 1,
      login: "chjoie",
      firstName: "charles",
      lastName: "joie",
      nickName: "mologue",
      email: "chjoie@42.fr",
      a2f: true,
      avatar: "link",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    jest.spyOn(mockUserRepository, 'create').mockReturnValue(mockUser);
    jest.spyOn(mockUserRepository, 'save').mockResolvedValue(mockUser);

    jest.spyOn(usersService, 'registerUser').mockRejectedValue(new Error("Error thrown when trying to create user"));

    await usersController.RegisterNewUser(mockUserDto, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
  });
});
