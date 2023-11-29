import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class WsGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const arr: string[] = request.handshake.headers.cookie.split(';');

    let auth = null;

    for (const e of arr) {
      const [key, value] = e.split('=');

      console.log(key, value);

      if (key == 'authorization') {
        console.log('catch authorization');
        auth = value;
      }
    }

    if (!auth) return false;

    const token = decodeURI(auth).split(' ');

    if (token.length != 2) return false;

    try {
      this.jwtService.verify(token[1], {
        secret: process.env.JWT_SECRET,
      });
    } catch (e) {
      return false;
    }

    return true;
  }
}
