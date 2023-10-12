import { Body, Controller } from "@nestjs/common";
import { FriendsService } from "./friends.service";
import { Get, Post } from "@nestjs/common";
import { CreateFriendsDto } from "./dto/create-friends.dto";
import { Res } from "@nestjs/common";
import { Response} from "express";

@Controller('friends')
export class FriendsController {
    constructor (private readonly friendsService: FriendsService) {}

    @Get('/test')
    async test(@Res() res: Response) {
        res.send(await this.friendsService.listUser());
    }

    @Post('/add')
    async add_friends(@Body() body: CreateFriendsDto, @Res() res: Response) {
        res.status(201).send();
    }
}