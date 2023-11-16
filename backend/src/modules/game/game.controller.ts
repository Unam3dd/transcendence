import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { Res, Req } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('/add')
  async create(
    @Body() createGameDto: CreateGameDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const data = await this.gameService.getJWTToken(req.headers.authorization);
    if (!data) return res.status(HttpStatus.UNAUTHORIZED).send();

    const { sub } = JSON.parse(data[1]);
    createGameDto.user = sub;
    await this.gameService.create(createGameDto);
    return res.status(HttpStatus.OK).send();
  }

  @Get('/list/:id')
  async listGames(
    @Param('id') userId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const data = await this.gameService.getJWTToken(req.headers.authorization);

    if (!data) return res.status(HttpStatus.UNAUTHORIZED).send();

    return res
      .status(HttpStatus.OK)
      .send(await this.gameService.findGames(userId));
  }

  @Delete('/delete/:id')
  async deleteGame(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const data = await this.gameService.getJWTToken(req.headers.authorization);

    if (!data) return res.status(HttpStatus.UNAUTHORIZED).send();

    await this.gameService.remove(id);

    return res.status(HttpStatus.OK).send();
  }
}
