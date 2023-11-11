import { Controller, ParseIntPipe, Query } from '@nestjs/common';
import { Get } from '@nestjs/common';
import { Res } from '@nestjs/common';
import { Param } from '@nestjs/common';
import { A2fService } from './a2f.service';
import { Response } from 'express';
import { UsersService } from '../users/users.service';

@Controller('a2f')
export class A2fController {

    constructor (private readonly a2fService: A2fService,
        private readonly userService: UsersService) {}
}
