import { Module } from '@nestjs/common';
import { A2fService } from './a2f.service';
import { A2fController } from './a2f.controller';

@Module({
  providers: [A2fService],
  controllers: [A2fController]
})
export class A2fModule {}
