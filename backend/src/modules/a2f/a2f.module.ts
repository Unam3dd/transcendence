import { Module } from '@nestjs/common';
import { A2fService } from './a2f.service';
import { UsersService } from '../users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { A2fController } from './a2f.controller';
import { AuthService } from '../auth/auth.service';
import { ApiService } from '../api/api.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [A2fService, UsersService, AuthService, ApiService],
  controllers: [A2fController],
})
export class A2fModule {}
