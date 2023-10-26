import { Controller, HttpStatus, Query, Req, Res } from '@nestjs/common';
import { Get, Post} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { TokensFrom42API, UserInfoAPI } from 'src/interfaces/api.interfaces';
import { ApiService } from '../api/api.service';
import { Body } from '@nestjs/common';

import {
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';

@ApiTags('Auth Module')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly apiService: ApiService,
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
  async RegisterNewAccount(@Body() body: CreateUserDto) {
    console.log(body);
  }
}
