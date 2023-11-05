import { Module } from '@nestjs/common';
import { EventsGateway } from './gateway';
import { LobbyManager } from 'src/game/lobbiesManager';
import { Tournament } from 'src/game/tournament';

@Module({
  providers: [EventsGateway, LobbyManager, Tournament],
})
export class GatewayModule {}
