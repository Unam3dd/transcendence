import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { UsersService } from '../users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friends } from '../friends/entities/friends.entity';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Friends]),
    TypeOrmModule.forFeature([User]),
    UsersModule,
  ],
  controllers: [UploadController],
  providers: [UploadService, UsersService],
})
export class UploadModule {}
