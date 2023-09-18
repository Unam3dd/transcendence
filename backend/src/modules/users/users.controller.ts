//import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { Body, Controller, Get, Post, Param, ParseIntPipe, Redirect } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
//import { Request, Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Maybe A Transformation/Validation Pipe required
  @Post()
  RegisterNewUser(@Body() User: CreateUserDto) {
    return (this.usersService.register(User));
  }

  @Get()
  findAll() {
    return (this.usersService.findAll());
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findOne(id);
    return (user === null ? {} : user);
  }
}
