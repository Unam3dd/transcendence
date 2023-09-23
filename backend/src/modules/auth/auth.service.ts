import { Inject, Injectable } from '@nestjs/common';
import { ApiService } from '../api/api.service';
import { TokensFrom42API } from 'src/interfaces/api.interfaces';

@Injectable()
export class AuthService {

  @Inject(ApiService)
  private readonly apiService: ApiService;

  async AuthTo42API(code: string): Promise<TokensFrom42API> {
    console.log('Authenticate to 42 API !');
    return (await this.apiService.GetTokenFrom42API(code));
  }
}
