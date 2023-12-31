import {
  Body,
  Controller,
  Get,
  Put,
  Param,
  ParseIntPipe,
  Req,
  Res,
  HttpStatus,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Response, Request } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';
import { isEmpty } from 'class-validator';
import { AuthGuard } from '../auth/auth.guard';
import { UserSchema } from './schemas/user.schema';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserSanitize } from 'src/interfaces/user.interfaces';
import { User } from './entities/user.entity';
import { AuthService } from '../auth/auth.service';
import { A2fService } from '../a2f/a2f.service';

@UseGuards(AuthGuard)
@ApiTags('Users Module')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly a2fService: A2fService,
  ) {}

  // Recieving a PUT request to update informations about an user
  @Put()
  @ApiOperation({ summary: 'Update user informations' })
  @ApiCreatedResponse({ description: 'User succesfully updated' })
  @ApiResponse({ status: 309, description: 'User not modified' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiBody({ type: UserSchema })
  async UpdateUserInfo(@Body() User: UpdateUserDto, @Res() res: Response) {
    try {
      await this.usersService.updateUser(User.id, User);

      const user: User = await this.usersService.findOne(User.id);

      if (user.a2f) {
        const { otpauthUrl } = JSON.parse(user.a2fsecret);
        return res.status(HttpStatus.OK).send({
          token: await this.authService.generateJwtByUser(user),
          qrcode: await this.a2fService.respondWithQRCode(otpauthUrl),
        });
      }

      return res.status(HttpStatus.OK).send({
        token: await this.authService.generateJwtByUser(user),
        qrcode: null,
      });
    } catch (e) {
      console.log(e);
      return res.status(HttpStatus.NOT_MODIFIED).send();
    }
  }

  @Get('me')
  @ApiOperation({ summary: 'Get all information of user logged in' })
  @ApiOkResponse({ description: 'Return all data of user logged in' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async GetMyInformation(@Req() req: Request, @Res() res: Response) {
    const [header, payload, signature] = await this.usersService.decodeJWT(
      req.headers.authorization,
    );
    if (!header || !payload || !signature)
      return res.status(HttpStatus.UNAUTHORIZED).send();
    const { sub } = JSON.parse(payload);
    return res.status(HttpStatus.OK).send(await this.usersService.findOne(sub));
  }

  // Recieving a GET request to get all users sanitized informations
  @Get()
  @ApiOperation({ summary: 'Get all users informations' })
  @ApiOkResponse({ description: 'Return all users informations' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async findAll(@Req() req: Request, @Res() res: Response) {
    return res.status(HttpStatus.OK).send(await this.usersService.getUsers());
  }

  // Recieving a GET request to get all informations about one user
  @Get(':id')
  @ApiOperation({ summary: 'Return an user' })
  @ApiParam({ name: 'id', type: 'number', description: 'The user id' })
  @ApiOkResponse({ description: 'User informations' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const user: UserSanitize = await this.usersService.findOneSanitize(id);
    return res.status(HttpStatus.OK).send(isEmpty(user) ? {} : user);
  }

  // Recieving a DELETE request to delete one user
  @Delete()
  @ApiOperation({ summary: 'Delete an user' })
  @ApiCreatedResponse({ description: 'User Deleted' })
  @ApiNoContentResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async deleteUser(@Req() req: Request, @Res() res: Response) {
    try {
      const data = await this.usersService.decodeJWT(req.headers.authorization);

      if (!data) return res.status(HttpStatus.UNAUTHORIZED).send();

      const { sub } = JSON.parse(data[1]);

      await this.usersService.deleteUser(sub);
      return res.status(HttpStatus.OK).send();
    } catch (e) {
      return res.status(HttpStatus.NO_CONTENT).send();
    }
  }
}
