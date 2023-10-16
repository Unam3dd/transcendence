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
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Response } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';
import { isEmpty } from 'class-validator';
import { User } from './entities/user.entity';
import { AuthGuard } from '../auth/auth.guard';
import { AuthService } from '../auth/auth.service';
import { UserSchema } from './schemas/user.schema';
import { ApiBody, ApiConflictResponse, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

@UseGuards(AuthGuard)
@ApiTags('Users Module')
@Controller('users')
export class UsersController {

  constructor(private readonly usersService: UsersService, private readonly authService: AuthService) {}

  // Recieving a POST request to create a new user
  @Post()
  @ApiOperation({summary: 'Register a new user'})
  @ApiCreatedResponse( {description: 'User Created'})
  @ApiConflictResponse({ description: 'User Already Exists' })
  @ApiUnauthorizedResponse({description: 'Unauthorized'}) 
  @ApiInternalServerErrorResponse({description: 'Internal server error'})
  @ApiBody({ type: UserSchema } )
  async RegisterNewUser(@Body() User: CreateUserDto, @Res() res: Response) {
    try {
      await this.usersService.registerUser(User);
      return res.status(HttpStatus.CREATED).send();
    } catch (e) {
      return res.status(HttpStatus.CONFLICT).send({ error: e });
    }
  }

  // Recieving a PUT request to update informations about an user
  @Put()
  @ApiOperation({summary: 'Update user informations'})
  @ApiCreatedResponse( {description: 'User succesfully updated'})
  @ApiResponse({ status:309, description: 'User not modified' })
  @ApiUnauthorizedResponse({description: 'Unauthorized'}) 
  @ApiInternalServerErrorResponse({description: 'Internal server error'})
  @ApiBody({ type: UserSchema } )
  async UpdateUserInfo(@Body() User: UpdateUserDto, @Res() res: Response) {
    try {
      await this.usersService.updateUser(User.id, User);

      const user: User = await this.usersService.findOne(User.id);

      return res.status(HttpStatus.OK).send({ 'token': await this.authService.generateJwtByUser(user)});
    } catch (e) {
      return res.status(HttpStatus.NOT_MODIFIED).send({ error: e });
    }
  }

  // Recieving a GET request to get all users data
  @Get()
  @ApiOperation({summary: 'Get all users informations'})
  @ApiOkResponse( {description: 'Return all users informations'})
  @ApiUnauthorizedResponse({description: 'Unauthorized'}) 
  @ApiInternalServerErrorResponse({description: 'Internal server error'})
  async findAll(@Res() res: Response) {
    return res.status(HttpStatus.OK).send(await this.usersService.findAll());
  }

  // Recieving a GET request to get informations about one user
  @Get(':id')
  @ApiOperation({summary: 'Return an user'})
  @ApiParam({name: 'id', type: 'number', description: 'The user id' })
  @ApiOkResponse({description: 'User informations'})
  @ApiUnauthorizedResponse({description: 'Unauthorized'}) 
  @ApiInternalServerErrorResponse({description: 'Internal server error'})
  async findOne(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const user: User = await this.usersService.findOne(id);
    return res.status(HttpStatus.OK).send(isEmpty(user) ? {} : user);
  }

  // Recieving a DELETE request to delete one user
  @Delete(':id')
  @ApiOperation({summary: 'Delete an user'})
  @ApiParam({ name: 'id', type: 'number', description: 'The user id' })
  @ApiCreatedResponse( {description: 'User Deleted'})
  @ApiNoContentResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({description: 'Unauthorized'}) 
  @ApiInternalServerErrorResponse({description: 'Internal server error'})
  async deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    try {
      await this.usersService.deleteUser(id);
      return res.status(HttpStatus.OK).send();
    } catch (e) {
      return res.status(HttpStatus.NO_CONTENT).send({ error: e });
    }
  }
}