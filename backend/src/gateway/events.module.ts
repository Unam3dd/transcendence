import { Module } from '@nestjs/common';
import { EventsGateway } from './gateway';
import { BlockModule } from '../modules/block/block.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { UsersService } from '../modules/users/users.service';
import { BlockService } from 'src/modules/block/block.service';
import { Block } from 'src/modules/block/entities/block.entity';
import { UsersModule } from 'src/modules/users/users.module';
import { LobbyServices } from 'src/modules/remote-game/lobbiesServices';
import { RemoteGameModule } from 'src/modules/remote-game/remote-game.module';
import { GameService } from 'src/modules/game/game.service';
import { Game } from 'src/modules/game/entities/game.entity';

@Module({
  imports: [
    BlockModule,
    TypeOrmModule.forFeature([Block]),
    TypeOrmModule.forFeature([User]),
    RemoteGameModule,
    TypeOrmModule.forFeature([Game]),
    UsersModule
  ],
  providers: [EventsGateway, BlockService, UsersService, GameService, LobbyServices],
})
export class GatewayModule {}
