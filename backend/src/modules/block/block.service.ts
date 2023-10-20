import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Block } from './entities/block.entity';
import { CreateBlockDto } from './dto/create-block.dto';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

export class BlockService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Block)
    private blockRepository: Repository<Block>,
    private readonly userService: UsersService,
  ) {}

  async addBlock(payload: CreateBlockDto): Promise<Block> {
    return await this.blockRepository.save({ ...payload });
  }

  async findBlock(id: number, targetId: number): Promise<Block> {
    return await this.blockRepository.findOne({
      where: { user1: id, user2: targetId },
    });
  }

  async deleteBlock(id: number, blockId: number): Promise<Block> {
    const block: Block = await this.blockRepository.findOne({
      where: { user1: id, user2: blockId },
    });

    await this.blockRepository.delete(block);

    return block;
  }

  async getJWTToken(authorization: string): Promise<string[] | null> {
    return await this.userService.decodeJWT(authorization);
  }
}
