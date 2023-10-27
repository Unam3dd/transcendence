import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ApiService } from '../api/api.service';
import { TokensFrom42API, UserInfoAPI } from 'src/interfaces/api.interfaces';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  @Inject(ApiService)
  private readonly apiService: ApiService;

  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  public async AuthTo42API(code: string): Promise<TokensFrom42API> {
    return await this.apiService.GetTokenFrom42API(code);
  }

  public async CheckAccountAlreadyExist(user: UserInfoAPI): Promise<boolean> {
    return (await this.userService.findOneByLogin(user.login)) ? true : false;
  }

  public async CreateNewAccountFrom42API(user: UserInfoAPI): Promise<boolean> {
    const NewAccountDTO: CreateUserDto = {
      login: user.login,
      firstName: user.first_name,
      lastName: user.last_name,
      password: null,
      nickName: user.login,
      a2f: false,
      email: null,
      avatar: user.image.versions.medium,
      is42: true,
    };

    try {
      await this.userService.registerUser(NewAccountDTO);
    } catch (err) {
      return false;
    }

    return true;
  }

  async generateJwt(login: string) {
    const user = await this.userService.findOneByLogin(login);

    if (!user) throw new UnauthorizedException();

    const payload = {
      sub: user.id,
      login: user.login,
      nickName: user.nickName,
    };

    return await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
    });
  }

  async generateJwtByUser(user: User) {
    if (!user) return null;

    const payload = {
      sub: user.id,
      login: user.login,
      nickName: user.nickName,
    };

    return await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
    });
  }
}
