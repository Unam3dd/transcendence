import { Injectable } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { Game } from './entities/game.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';

@Injectable()
export class GameService {
  constructor(@InjectRepository(Game) private gameRepository: Repository<Game>, private readonly userService: UsersService,){}

  async create(createGameDto: CreateGameDto): Promise<Game> {
    return await this.gameRepository.save({...createGameDto});
  }

  async findGames(userId: number): Promise<Game[]> {
    return await this.gameRepository.find({ where: {user:userId}});
  }


  async remove(id: string): Promise<Game> {
    const game = await this.gameRepository.findOne({ where: {lobby:id}});
    await this.gameRepository.delete(game);
    return game;
  }

  async getJWTToken(authorization: string): Promise<string[] | null> {
    return await this.userService.decodeJWT(authorization);
  }
}
