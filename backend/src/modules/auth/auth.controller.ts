import { Controller } from '@nestjs/common';
import { Get, Param } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Get('callback')
  callback(@Param('code') code: string) {
    console.log(`New Code has been received : ${code}`);
  }
}
