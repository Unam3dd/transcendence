import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { Get, Post } from '@nestjs/common';
import { CreateBlockDto } from './dto/create-block.dto';
import { Res, Req } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { BlockService } from './block.service';

@UseGuards(AuthGuard)
@Controller('block')
export class BlockController {
  constructor(private readonly blockService: BlockService) {}

  @Post('/add/')
  async add_block(@Body() body: CreateBlockDto, @Res() res: Response) {
    console.log('heho0');
    await this.blockService.addBlock(body);
    res.status(HttpStatus.OK).send();
  }

  @Get('/exists/:id')
  async checkIfBlocked(
    @Param('id', ParseIntPipe) targetId: number,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<boolean> {
    const data = await this.blockService.getJWTToken(req.headers.authorization);

    if (!data) res.status(HttpStatus.UNAUTHORIZED).send();

    const { sub } = JSON.parse(data[1]);

    if (await this.blockService.findBlock(sub, targetId)) return true;

    return false;
  }

  @Delete('/delete/:id')
  async deleteBlock(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const data = await this.blockService.getJWTToken(req.headers.authorization);

    if (!data) return res.status(HttpStatus.UNAUTHORIZED).send();

    const { sub } = JSON.parse(data[1]);

    await this.blockService.deleteBlock(sub, id);

    return res.status(HttpStatus.OK).send();
  }
}
