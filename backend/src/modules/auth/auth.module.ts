import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ApiModule } from '../api/api.module';
import { ApiService } from '../api/api.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { A2fService } from '../a2f/a2f.service';
import { A2fModule } from '../a2f/a2f.module';

@Module({
  imports: [
    ApiModule,
    UsersModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '5h' },
    }),
    A2fModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, ApiService, UsersService, A2fService],
})
export class AuthModule {}
