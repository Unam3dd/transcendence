import { Module } from '@nestjs/common';
import { BlockService } from './block.service';
import { Block } from './entities/block.entity';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockController } from './block.controller';
import { UsersService } from '../users/users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Block]),
    TypeOrmModule.forFeature([User]),
    UsersModule,
  ],
  controllers: [BlockController],
  providers: [BlockService, UsersService],
})
export class BlockModule {}
