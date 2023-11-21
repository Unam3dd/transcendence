import { Module } from '@nestjs/common';
import { Game } from '../game/entities/game.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LobbyServices } from 'src/modules/remote-game/lobbiesServices';
import { User } from '../users/entities/user.entity';
import { GameService } from '../game/game.service';
import { UsersService } from '../users/users.service';

@Module({
  imports: [TypeOrmModule.forFeature([Game]), TypeOrmModule.forFeature([User])],
  controllers: [],
  providers: [LobbyServices, GameService, UsersService],
})
export class RemoteGameModule {}
