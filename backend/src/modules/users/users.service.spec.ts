import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { AppModule } from '../../app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserError } from './users.type';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

//Do a serie of tests for a specific set of methods (UsersServices methods here)
describe('UsersServices', () => {
    let usersService : UsersService;
    let userRepository : Repository<User>;
    let result = new User();

    //validators doesn't seem to work here? (url, email)
    const userDto = {
      id: 1,
      login: "chjoihe5rgrgghyht",
      firstName: "chharles",
      lastName: "joie",
      nickName: "mologuegrhyhegtg",
      email: "chjoie@42.frgeghyhtggr",
      a2f: false,
      avatar: "link"
    }
    // Loading things I need to run my tests
    beforeAll( async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [AppModule,
              TypeOrmModule.forFeature([User])
            ],
            providers: [UsersService]
        }).compile();
      
        usersService = module.get<UsersService>(UsersService);
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));

        // Remove every users in the database to make the tests
        await userRepository.query('DELETE FROM "user"');
        await userRepository.query('ALTER SEQUENCE user_id_seq RESTART WITH 1');
    });
        test('add new User in database', async () => {

          result = await usersService.registerUser(userDto);
          expect(result).toBeDefined();

          const compare = await usersService.findOne(result.id);
          expect(compare).toEqual(result);

        });
        test('delete existing user', async () => {
          await expect(usersService.deleteUser(1)).resolves.toEqual(result);
        });
        test('delete non existent error', async () => {
          await expect(usersService.deleteUser(999)).rejects.toThrowError(new UserError('User not found !'));
        });
});