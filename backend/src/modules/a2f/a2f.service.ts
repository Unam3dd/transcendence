import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

@Injectable()
export class A2fService {

    constructor () {}

    generateSecret() {
        const secret = speakeasy.generateSecret({
            name: 'transcendence'
        });

        return ({ otpauthUrl: secret.otpauth_url, base32: secret.base32});
    }

    async respondWithQRCode(otpauthUrl: string) {
        return (await QRCode.toDataURL(otpauthUrl));
    }
}
