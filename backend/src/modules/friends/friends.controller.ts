import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  HttpStatus,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { Get, Post } from '@nestjs/common';
import { CreateFriendsDto } from './dto/create-friends.dto';
import { Res, Req } from '@nestjs/common';
import { Request, Response } from 'express';
import { Query } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('friends')
export class FriendsController {
  constructor(
    private readonly friendsService: FriendsService
  ) {}

  @Post('/add')
  async add_friends(@Body() body: CreateFriendsDto, @Res() res: Response) {
    await this.friendsService.addFriends(body);
    res.status(HttpStatus.OK).send();
  }

  @Get('/list/')
  async list_friends(
    @Query('approved', new DefaultValuePipe(false), ParseBoolPipe)
    approved: boolean,
    @Req() req: Request,
    @Res() res: Response,
  ) {

    const data = await this.friendsService.getJWTToken(req.headers.authorization);

    if (!data) return (res.status(HttpStatus.UNAUTHORIZED).send());

    const { sub } = JSON.parse(data[1]);

    return res
      .status(HttpStatus.OK)
      .send(await this.friendsService.listFriends(sub, approved));
  }

  @Patch('/update/:applicantid/:targetid')
  async updateFriendStatus(
    @Param('applicantid', ParseIntPipe) applicantid: number,
    @Param('targetid', ParseIntPipe) targetid: number,
    @Res() res: Response,
  ) {
    await this.friendsService.UpdateFriends(applicantid, targetid);
    return res.status(HttpStatus.OK).send();
  }

  @Delete('/delete/:id/:friendid')
  async deleteFriends(
    @Param('id', ParseIntPipe) id: number,
    @Param('friendid', ParseIntPipe) friendId: number,
    @Res() res: Response,
  ) {
    await this.friendsService.deleteFriend(id, friendId);
    return res.status(HttpStatus.OK).send();
  }
}
