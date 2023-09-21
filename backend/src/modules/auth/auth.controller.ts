import { Controller, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { Get } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Get('callback')
  callback(@Query('code') code: string) {
    console.log(`New Code has been received : ${code}`);
  }
}
