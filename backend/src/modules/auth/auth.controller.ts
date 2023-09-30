import { Controller, HttpStatus, Query, Res } from '@nestjs/common';
import { Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { TokensFrom42API, UserInfoAPI } from 'src/interfaces/api.interfaces';
import { ApiService } from '../api/api.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly apiService: ApiService,
  ) {}

  @Get('callback')
  public async callback(
    @Query('code') code: string,
    @Res() res: Response,
  ): Promise<any> {
    const tokens: TokensFrom42API = await this.authService.AuthTo42API(code);

    const UserInfo: UserInfoAPI = await this.apiService.Get42UserInfo(tokens);

    const exist: boolean =
      await this.authService.CheckAccountAlreadyExist(UserInfo.login);

    const redirectURI = process.env.DEV_MODE
      ? process.env.HOME_REDIRECT_DEV
      : process.env.HOME_REDIRECT;

    if (exist) {
      res.redirect(redirectURI);
      return;
    }

    if (!(await this.authService.CreateNewAccount(UserInfo))) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
      return;
    }

    res.redirect(redirectURI);
  }
}
