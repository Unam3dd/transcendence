import { Module } from '@nestjs/common';
import { A2fService } from './a2f.service';
import { UsersService } from '../users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { A2fController } from './a2f.controller';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [A2fService, UsersService],
    controllers: [A2fController]
})
export class A2fModule {}
