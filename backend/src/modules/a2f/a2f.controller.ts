import { Controller, HttpStatus } from '@nestjs/common';
import { Post } from '@nestjs/common';
import { Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { UsersService } from '../users/users.service';
import * as speakeasy from 'speakeasy';
import { AuthService } from '../auth/auth.service';

@Controller('a2f')
export class A2fController {

    constructor (private readonly userService: UsersService,
        private readonly authService: AuthService) {}
    
    @Post('verify')
    async verify(@Req() req: Request, @Res() res: Response) {

        const data: string | string[] = req.headers.tmp_name;

        console.log(data);

        const login = 'supertoto';

        const { token } = JSON.parse(JSON.stringify(req.body));

        const user = await this.userService.findOneByLogin(login);

        if (!user) return (res.status(HttpStatus.BAD_REQUEST).send());

        const secret = JSON.parse(user.a2fsecret);
        
        const verify = speakeasy.totp.verify({
            secret: secret.base32,
            encoding: 'base32',
            token: token
        });

        if (!verify) return (res.status(HttpStatus.UNAUTHORIZED).send());

        return (res.status(HttpStatus.OK).send({ token: `Bearer ${await this.authService.generateJwt(login)}`}));
    }
}
