import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ApiModule } from '../api/api.module';
import { ApiService } from '../api/api.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [ApiModule, UsersModule, TypeOrmModule.forFeature([User])],
  controllers: [AuthController],
  providers: [AuthService, ApiService, UsersService],
})
export class AuthModule {}
