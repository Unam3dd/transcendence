import { Module } from '@nestjs/common';
import { Friends } from './entities/friends.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { User } from '../users/entities/user.entity';

@Module({
    imports: [ TypeOrmModule.forFeature([Friends]), TypeOrmModule.forFeature([User])],
    controllers: [ FriendsController],
    providers: [ FriendsService]
})
export class FriendsModule {}
