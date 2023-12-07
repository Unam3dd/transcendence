import { Module } from '@nestjs/common';
import { EventsGateway } from './gateway';
import { BlockModule } from '../modules/block/block.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { UsersService } from '../modules/users/users.service';
import { Block } from 'src/modules/block/entities/block.entity';
import { LobbyServices } from 'src/modules/remote-game/lobbiesServices';
import { RemoteGameModule } from 'src/modules/remote-game/remote-game.module';
import { GameService } from 'src/modules/game/game.service';
import { Game } from 'src/modules/game/entities/game.entity';
import { FriendsModule } from 'src/modules/friends/friends.module';
import { Friends } from 'src/modules/friends/entities/friends.entity';
import { FriendsService } from 'src/modules/friends/friends.service';
import { BlockService } from 'src/modules/block/block.service';
import { UsersModule } from 'src/modules/users/users.module';
import { MessageModule } from 'src/modules/message/message.module';

@Module({
  imports: [
    BlockModule,
    TypeOrmModule.forFeature([Block]),
    TypeOrmModule.forFeature([User]),
    RemoteGameModule,
    FriendsModule,
    UsersModule,
    MessageModule,
    TypeOrmModule.forFeature([Game]),
    TypeOrmModule.forFeature([Friends]),
  ],
  providers: [
    EventsGateway,
    LobbyServices,
    GameService,
    FriendsService,
    UsersService,
    BlockService,
  ],
})
export class GatewayModule {}
