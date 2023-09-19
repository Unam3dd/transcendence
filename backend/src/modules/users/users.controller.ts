//import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async RegisterNewUser(@Body() User: CreateUserDto, @Res() res: Response) {
    try {
      await this.usersService.register(User);
      return res.status(201).send();
    } catch (e) {
      return res.status(409).send();
    }
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findOne(id);
    return user === null ? {} : user;
  }
}
