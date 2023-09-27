import { Injectable } from '@nestjs/common';
import { AuthTo42Data } from 'src/interfaces/auth.interfaces';
import axios from 'axios';
import { TokensFrom42API, UserInfoAPI } from 'src/interfaces/api.interfaces';

@Injectable()
export class ApiService {
  async GetTokenFrom42API(code: string): Promise<TokensFrom42API> {
    const payload: AuthTo42Data = {
      grant_type: 'authorization_code',
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.SECRET_TOKEN,
      code: code,
      redirect_uri: process.env.REDIRECT_URI,
    };

    try {
      const { data } = await axios.post<TokensFrom42API>(
        process.env.AUTH_URL,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );
      return data;
    } catch (err) {
      throw new Error(`GetTokenFrom42API(): ${err}`);
    }
  }

  async Get42UserInfo(tokens: TokensFrom42API): Promise<UserInfoAPI> {
    try {
      const config = {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      };

      const { data } = await axios.get(
        `${process.env.API42_URL}/v2/me`,
        config,
      );

      return data;
    } catch (err) {
      throw new Error(`Get42UserInfo(): ${err}`);
    }
  }
}
