import { Module } from '@nestjs/common';
import { EventsGateway } from './gateway';
import { LobbyManager } from 'src/game/lobbiesManager';

@Module({
  providers: [EventsGateway, LobbyManager],
})
export class GatewayModule {}
