import { Module } from '@nestjs/common';
import { EventsGateway } from './gateway';
import { LobbyServices } from 'src/modules/remote-game/lobbiesServices';
import { RemoteGameModule } from 'src/modules/remote-game/remote-game.module';
import { GameService } from 'src/modules/game/game.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from 'src/modules/game/entities/game.entity';
import { UsersService } from 'src/modules/users/users.service';
import { User } from 'src/modules/users/entities/user.entity';
import { FriendsModule } from 'src/modules/friends/friends.module';
import { Friends } from 'src/modules/friends/entities/friends.entity';
import { FriendsService } from 'src/modules/friends/friends.service';

@Module({
  imports: [
    RemoteGameModule,
    FriendsModule,
    TypeOrmModule.forFeature([Game]),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Friends]),
  ],
  providers: [EventsGateway, LobbyServices, GameService, FriendsService, UsersService],
})
export class GatewayModule {}
