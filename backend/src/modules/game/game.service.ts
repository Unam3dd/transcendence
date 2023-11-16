import { Injectable } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { Game } from './entities/game.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { GamePayload } from 'src/interfaces/game.interfaces';
import { User } from '../users/entities/user.entity';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game) private gameRepository: Repository<Game>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly userService: UsersService,
  ) {}

  async create(createGameDto: CreateGameDto): Promise<Game> {
    return await this.gameRepository.save({ ...createGameDto });
  }

  async findGames(userId: number): Promise<Game[]> {
    return await this.gameRepository.find({ where: { user: userId } });
  }

  async createRemote(payload: GamePayload): Promise<Game> {
    const { id } = await this.userRepository.findOne({
      where: { nickName: payload.nickname },
    });
    if (id === null) return;

    const createGameDto: CreateGameDto = {
      ...payload,
      user: id,
      local: false,
    };
    return await this.gameRepository.save({ ...createGameDto });
  }

  async remove(id: string): Promise<Game> {
    const game = await this.gameRepository.findOne({ where: { lobby: id } });
    await this.gameRepository.delete(game);
    return game;
  }

  async getJWTToken(authorization: string): Promise<string[] | null> {
    return await this.userService.decodeJWT(authorization);
  }
}
