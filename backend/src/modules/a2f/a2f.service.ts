import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { Response } from 'express';

@Injectable()
export class A2fService {
    constructor () {}

    generateSecret() {
        const secret = speakeasy.generateSecret();
        return (secret);
    }

    getTwoFactorAuthenticationCode() {
        const secret = this.generateSecret()
        return ({
            otpauthUrl: secret.otpauth_url,
            base32: secret.base32
        });
    }

    responseWithQRCode(data: string, response: Response) {
        QRCode.toFileStream(response, data);
    }
}
