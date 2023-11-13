import { Controller, HttpStatus, Query, Req, Res } from '@nestjs/common';
import { Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { TokensFrom42API, UserInfoAPI } from 'src/interfaces/api.interfaces';
import { ApiService } from '../api/api.service';
import { Body } from '@nestjs/common';
import { isEmpty } from 'class-validator';
import * as argon2 from "argon2";

import {
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { A2fService } from '../a2f/a2f.service';

@ApiTags('Auth Module')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly apiService: ApiService,
    private readonly userService: UsersService,
    private readonly a2fService: A2fService
  ) {}

  @ApiOperation({ summary: 'Authentication with the 42 Api' })
  @ApiQuery({
    name: 'code',
    type: String,
    required: true,
    description: '42 Api Token',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<any> {
    const tokens: TokensFrom42API = await this.authService.AuthTo42API(code);

    const UserInfo: UserInfoAPI = await this.apiService.Get42UserInfo(tokens);

    const exist: boolean =
      await this.authService.CheckAccountAlreadyExist(UserInfo);

    const redirectURI = process.env.DEV_MODE
      ? process.env.HOME_REDIRECT_DEV
      : process.env.HOME_REDIRECT;

    if (exist) {
      res.cookie(
        'authorization',
        `Bearer ${await this.authService.generateJwt(UserInfo.login)}`,
      );
      res.redirect(redirectURI);
      return;
    }

    if (!(await this.authService.CreateNewAccountFrom42API(UserInfo))) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
      return;
    }

    res.cookie(
      'authorization',
      `Bearer ${await this.authService.generateJwt(UserInfo.login)}`,
    );
    res.redirect(redirectURI);
  }

  @Post('register')
  async RegisterNewAccount(@Res() res: Response, @Body() body: CreateUserDto) {
    const data: CreateUserDto = JSON.parse(JSON.stringify(body));

    data.avatar =
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Halloween.JPG/260px-Halloween.JPG';
    
    const status = await this.authService.CreateNewAccount(data);

    if (!status) return (res.status(HttpStatus.CONFLICT).send());

    if (data.a2f) {
      const user = await this.userService.findOneByLogin(data.login);
      const { otpauthUrl } = JSON.parse(user.a2fsecret);

      const qrcode = await this.a2fService.respondWithQRCode(otpauthUrl);

      return (res.status(HttpStatus.CREATED).send(qrcode));
    }
  
    return (res.status(HttpStatus.OK).send());
  }

  @Post('login')
  async LoginAccount(@Res() res: Response, @Body() body: CreateUserDto) {
    const { login, password } = JSON.parse(JSON.stringify(body));

    const user = await this.userService.findOneByLogin(login);

    if (isEmpty(user) || user.is42 || !(await argon2.verify(user.password, password)))
      return res.status(HttpStatus.UNAUTHORIZED).send();

    if (user.a2f) return res.status(HttpStatus.OK).send({ a2f: true });

    return res.status(HttpStatus.OK).send({
      token: `Bearer ${await this.authService.generateJwt(user.login)}`,
    });
  }
}
