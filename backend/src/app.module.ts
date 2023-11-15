import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import * as dotenv from 'dotenv';
import { AuthModule } from './modules/auth/auth.module';
import { ApiModule } from './modules/api/api.module';
import { LoggerModule } from './logger/logger.module';
import { LoggerMiddleware } from './logger/logger.middleware';
import { UsersController } from './modules/users/users.controller';
import { AuthController } from './modules/auth/auth.controller';
import { GatewayModule } from './gateway/events.module';
import { FriendsModule } from './modules/friends/friends.module';
import { BlockModule } from './modules/block/block.module';
import { GameModule } from './modules/game/game.module';
import { RemoteGameModule } from './modules/remote-game/remote-game.module';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: true,
      autoLoadEntities: true,
    }),
    UsersModule,
    AuthModule,
    ApiModule,
    LoggerModule,
    GatewayModule,
    FriendsModule,
    BlockModule,
    GameModule,
    RemoteGameModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(UsersController, AuthController);
  }
}
