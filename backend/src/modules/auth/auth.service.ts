import { Inject, Injectable } from '@nestjs/common';
import { ApiService } from '../api/api.service';
import { TokensFrom42API, UserInfoAPI } from 'src/interfaces/api.interfaces';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { isEmpty } from 'class-validator';

@Injectable()
export class AuthService {
  @Inject(ApiService)
  private readonly apiService: ApiService;
  @Inject(UsersService)
  private readonly userService: UsersService;
  @Inject(JwtService)
  private readonly jwtService: JwtService;

  public async AuthTo42API(code: string): Promise<TokensFrom42API> {
    return await this.apiService.GetTokenFrom42API(code);
  }

  public async CheckAccountAlreadyExist(user: UserInfoAPI): Promise<boolean> {
    return (await this.userService.findOneByLogin(user.login)) ? true : false;
  }

  public async CreateNewAccount(user: UserInfoAPI): Promise<boolean> {
    const NewAccountDTO: CreateUserDto = {
      login: user.login,
      firstName: user.first_name,
      lastName: user.last_name,
      nickName: user.login,
      a2f: false,
      email: null,
      avatar: user.image.versions.medium,
    };

    try {
      await this.userService.registerUser(NewAccountDTO);
    } catch (err) {
      return false;
    }

    return true;
  }

  public async generateJWT(login: string) {
    const account = await this.userService.findOneByLogin(login);
    
    if (isEmpty(account)) return ({});

    const payload = { sub: account.id, login: login, nickName: account.nickName };

    return (
      { token: await this.jwtService.signAsync(payload)}
      );
  }
}
