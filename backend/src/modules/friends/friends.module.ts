import { Module } from '@nestjs/common';
import { Friends } from './entities/friends.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Friends]),
    TypeOrmModule.forFeature([User]),
    UsersModule,
  ],
  controllers: [FriendsController],
  providers: [FriendsService, UsersService],
})
export class FriendsModule {}
