import { Controller, Query, Res } from '@nestjs/common';
import { Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { TokensFrom42API } from 'src/interfaces/api.interfaces';
import { ApiService } from '../api/api.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly apiService: ApiService) {}

  @Get('callback')
  async callback(@Query('code') code: string, @Res() res: Response) {

    const tokens: TokensFrom42API = await this.authService.AuthTo42API(code);

    const me = await this.apiService.Get42UserInfo(tokens);
    
    console.log(me);
    
    res.status(200).send();
  }
}
