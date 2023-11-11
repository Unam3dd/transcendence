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

    @Get(':id')
    async getQRCode(@Param('id', new ParseIntPipe()) id: number, @Res() res: Response) {
        const user = await this.userService.findOne(id);
        
        if (!user || user.a2f == false) return (res.status(401).send());
    
        const { otpauthUrl } = JSON.parse(user.a2fsecret)

       return (res.status(200).send(`<img src="${await this.a2fService.respondWithQRCode(otpauthUrl)}"/>`));
    }
}
