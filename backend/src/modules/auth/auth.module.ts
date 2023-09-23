import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ApiModule } from '../api/api.module';
import { ApiService } from '../api/api.service';

@Module({
  imports: [ApiModule],
  controllers: [AuthController],
  providers: [AuthService, ApiService],
})
export class AuthModule {}
