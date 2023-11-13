import { Controller, Get, Post, Body, Param, Delete, UseGuards, HttpStatus } from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { Res, Req } from '@nestjs/common';
import { Request, Response } from 'express';
import { UpdateGameDto } from './dto/update-game.dto';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('/add')
  async create(@Body() createGameDto: CreateGameDto, @Res() res: Response) {
    await this.gameService.create(createGameDto);
    res.status(HttpStatus.OK).send();
  }

  @Get('/list')
  async listGames(@Req() req: Request, @Res() res: Response,) {

    const data = await this.gameService.getJWTToken(
      req.headers.authorization,
    );

    if (!data) return res.status(HttpStatus.UNAUTHORIZED).send();

    const { sub } = JSON.parse(data[1]);

    return res
    .status(HttpStatus.OK)
    .send(await this.gameService.findGames(sub));
  }

  @Delete('/delete/:id')
  async deleteGame(@Param('id') id: string, @Req() req: Request, @Res() res: Response,) {

    const data = await this.gameService.getJWTToken(
      req.headers.authorization,
    );

    if (!data) return res.status(HttpStatus.UNAUTHORIZED).send();

    await this.gameService.remove(id);

    return res.status(HttpStatus.OK).send();
  }
}