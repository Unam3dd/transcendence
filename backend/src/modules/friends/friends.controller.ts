import { Body, Controller, DefaultValuePipe, HttpStatus, Param, ParseBoolPipe, Patch } from '@nestjs/common';
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
    res.status(201).send();
  }

  @Get('/list/:id')
  async list_friends(@Param('id') id: number,
  @Query('full', new DefaultValuePipe(false), ParseBoolPipe) full: boolean,
  @Res() res: Response) {
    return (res.status(200).send(await this.friendsService.listFriends(id, full)))
  }

  @Patch('/update/:applicantid/:targetid')
  async updateFriendStatus(@Param('applicantid') applicantid: number, @Param('targetid') targetid: number, @Res() res: Response) {
    return (res.status(200).send());
  }
}
