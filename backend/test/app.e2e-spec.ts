import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { User } from '../src/modules/users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from '../src/modules/users/users.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let usersService : UsersService;
  let userRepository : Repository<User>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

// Loading things I need to run my tests
  beforeAll( async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule,
         TypeOrmModule.forFeature([User]),
      ],
      providers: [UsersService]
    }).compile();
      
      usersService = module.get<UsersService>(UsersService);
      userRepository = module.get<Repository<User>>(getRepositoryToken(User));

      // Remove every users in the database to make the tests
      await userRepository.query('DELETE FROM "user"');
      await userRepository.query('ALTER SEQUENCE user_id_seq RESTART WITH 1');
    });
  // Create a http POST request to URI /users and send body to create a new user
  test('/ (POST) add new user', async () => {
    await request(app.getHttpServer())
    .post('/users').send(
      {
        id: 1,
        login: "chjoie",
        firstName: "charles",
        lastName: "joie",
        nickName: "mologuegrhgtg",
        email: "chjoie@42.fr",
        a2f: false,
        avatar: "link"
      }
    ).expect(HttpStatus.CREATED);

  });
  // Create a http PUT request to URI /users and send body to update an user
  test('/ (PUT) update user', async () => {
    await request(app.getHttpServer())
      .put('/users').send(
        {
          id: 1,
          nickName: "lasttest",
        }
      )
      .expect(200);
  });
});
