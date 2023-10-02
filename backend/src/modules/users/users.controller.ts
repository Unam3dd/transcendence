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

//This controller handle client requests from the /users route
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Recieving a POST request to create a new user
  @Post()
  async RegisterNewUser(@Body() User: CreateUserDto, @Res() res: Response) {
    try {
      await this.usersService.registerUser(User);
      return res.status(HttpStatus.CREATED).send();
    } catch (e) {
      return res.status(HttpStatus.CONFLICT).send();
    }
  }

  // Recieving a PUT request to update informations about an user
  @Put()
  async UpdateUserInfo(@Body() User: UpdateUserDto, @Res() res: Response) {
    try {
      await this.usersService.updateUser(User.id, User);
      return res.status(HttpStatus.OK).send();
    } catch (e) {
      return res.status(HttpStatus.NOT_MODIFIED).send();
    }
  }

  // Recieving a GET request to get all users data
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // Recieving a GET request to get informations about one user 
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findOne(id);
    return isEmpty(user) ? {} : user;
  }

  // Recieving a DELETE request to delete one user
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
