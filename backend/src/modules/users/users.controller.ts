//import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { Controller, Get, Param, ParseIntPipe, Redirect } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
//import { Request, Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /*@Get()
  async findAll(@Res() res: Response) {
    const data = await this.usersService.findAll();
    res.status(200).json(data);
  }*/

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
