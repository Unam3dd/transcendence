import { Controller, Query, Res } from '@nestjs/common';
import { Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('callback')
  callback(@Query('code') code: string, @Res() res: Response) {
    console.log(`New Code has been received : ${code}`);
    this.authService.AuthTo42API(code);
    res.status(200).send();
  }
}
