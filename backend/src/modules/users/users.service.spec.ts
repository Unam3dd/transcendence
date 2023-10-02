import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { AppModule } from '../../app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { error } from 'console';
import { UserError } from './users.type';

//Do a serie of tests for a specific set of methods (UsersServices methods here)
describe('UsersServices', () => {
    let usersService : UsersService;

    // I load things I need to run my tests
    beforeAll( async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [AppModule,
              TypeOrmModule.forFeature([User])
            ],
            providers: [UsersService]
        }).compile();

        usersService = module.get<UsersService>(UsersService);
    });

/* Things to do before each test
    beforeEach( async () => {

    })
*/

    describe('check registerUser() function', () => {

        it('Should add new User in database', async () => {

          const userDto = {
                id: 1,
                login: "chjoie",
                firstName: "charles",
                lastName: "joie",
                nickName: "mologue",
                email: "chjoie@42.fr",
                a2f: false,
                avatar: "link"
            }
          
            //jest.spyOn() will "spy" what happen when method 'registerUser' from usersService is called,
            //so I can check if the method work as expected
            const registerUserSpy = jest.spyOn(usersService, 'registerUser');

            await usersService.registerUser(userDto);

            expect(registerUserSpy).toBeCalledWith(userDto);
      });

      it('Should throw an error', async () => {

        const userDto2 = {
              id: 1,
              login: "chjoie",
              firstName: "charles",
              lastName: "joie",
              nickName: "mologue",
              email: "chjoie@42.fr",
              a2f: false,
              avatar: "link"
        }
        
        //jest.spyOn() will "spy" what happen when method 'registerUser' from usersService is called,
        //so I can check if the method work as expected
        const registerUserSpy = jest.spyOn(usersService, 'registerUser');

        try {
          await usersService.registerUser(userDto2);
        } 
        catch (e) {
           expect(e).toBeInstanceOf(UserError);
        }
      });
    });
});
