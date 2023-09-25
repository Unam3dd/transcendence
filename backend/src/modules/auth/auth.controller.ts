import { Controller, Inject, Query, Res } from '@nestjs/common';
import { Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { TokensFrom42API, UserInfoAPI } from 'src/interfaces/api.interfaces';
import { ApiService } from '../api/api.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly apiService: ApiService,
  ) {}

  @Get('callback')
  async callback(@Query('code') code: string, @Res() res: Response): Promise<void> {
    const tokens: TokensFrom42API = await this.authService.AuthTo42API(code);

    const UserInfo: UserInfoAPI = await this.apiService.Get42UserInfo(tokens);

    const exist: boolean = await this.authService.CheckAccountAlreadyExist(UserInfo);

    console.log(exist);

    if (exist) {
      res.status(200).send();
      return ;
    }

    if (!(await this.authService.CreateNewAccount(UserInfo))) {
      res.status(500).send();
      return ;
    }

    res.status(201).send();
  }
}
