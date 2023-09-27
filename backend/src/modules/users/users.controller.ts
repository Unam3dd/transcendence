import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Param,
  ParseIntPipe,
  Res,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Response } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';
import { isEmpty } from 'class-validator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async RegisterNewUser(@Body() User: CreateUserDto, @Res() res: Response) {
    try {
      await this.usersService.registerUser(User);
      return res.status(HttpStatus.CREATED).send();
    } catch (e) {
      return res.status(HttpStatus.CONFLICT).send();
    }
  }

  @Put()
  async UpdateUserInfo(@Body() User: UpdateUserDto, @Res() res: Response) {
    try {
      await this.usersService.updateUser(User.id, User);
      return res.status(HttpStatus.OK).send();
    } catch (e) {
      return res.status(HttpStatus.NOT_MODIFIED).send();
    }
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findOne(id);
    return isEmpty(user) ? {} : user;
  }

  @Delete(':id')
  async deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    try {
      await this.usersService.deleteUser(id);
      return res.status(HttpStatus.OK).send();
    } catch (e) {
      return res.status(HttpStatus.NO_CONTENT).send();
    }
  }
}
