import { Body, Controller, DefaultValuePipe, Delete, HttpStatus, Param, ParseBoolPipe, ParseIntPipe, Patch } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { Get, Post } from '@nestjs/common';
import { CreateFriendsDto } from './dto/create-friends.dto';
import { Res } from '@nestjs/common';
import { Response } from 'express';
import { Query } from '@nestjs/common';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post('/add')
  async add_friends(@Body() body: CreateFriendsDto, @Res() res: Response) {
    const new_friend = await this.friendsService.addFriends(body);
    res.status(HttpStatus.OK).send();
  }

  @Get('/list/:id')
  async list_friends(@Param('id') id: number,
  @Query('approved', new DefaultValuePipe(false), ParseBoolPipe) approved: boolean,
  @Res() res: Response) {
    return (res.status(HttpStatus.OK).send(await this.friendsService.listFriends(id, approved)))
  }

  @Patch('/update/:applicantid/:targetid')
  async updateFriendStatus(@Param('applicantid', ParseIntPipe) applicantid: number, @Param('targetid', ParseIntPipe) targetid: number, @Res() res: Response) {
    await this.friendsService.UpdateFriends(applicantid, targetid);
    return (res.status(HttpStatus.OK).send());
  }

  @Delete('/delete/:id/:friendid')
  async deleteFriends(@Param('id', ParseIntPipe) id: number, @Param('friendid', ParseIntPipe) friendId: number, @Res() res: Response) {
    await this.friendsService.deleteFriend(id, friendId);
    return (res.status(HttpStatus.OK).send());
  }
}
