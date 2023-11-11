import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import { UsersService } from '../users/users.service';
import * as QRCode from 'qrcode';

@Injectable()
export class A2fService {

    constructor (private readonly userService: UsersService) {}

    generateSecret() {
        const secret = speakeasy.generateSecret({
            name: 'transcendence'
        });

        return ({ otpauthUrl: secret.otpauth_url, base32: secret.base32});
    }

    async getOtpUrl(login: string): Promise<string | null> {
        const user = await this.userService.findOneByLogin(login);

        if (!user) return null;

        const { otpauthUrl } = JSON.parse(user.a2fsecret);

        return (otpauthUrl);
    }

    async respondWithQRCode(otpauthUrl: string) {
        return (await QRCode.toDataURL(otpauthUrl));
    }
}
