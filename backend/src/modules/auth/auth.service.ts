import { Injectable } from '@nestjs/common';
import { AuthTo42Data } from './../../interfaces/auth.interfaces';
import axios from 'axios';

@Injectable()
export class AuthService {
  async AuthTo42API(code: string) {
    
    const payload: AuthTo42Data = {
      grant_type: 'authorization_code',
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.SECRET_TOKEN,
      code: code,
      redirect_uri: process.env.REDIRECT_URI
    };

    try {
        const res = await axios.post<AuthTo42Data>(
            process.env.AUTH_URL, 
            payload,
            { 
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
            }
        );

        console.log(res);
    } catch (err) {
        console.log(err);
    }
  }
}
