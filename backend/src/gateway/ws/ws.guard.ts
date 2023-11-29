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

    let token = null;

    for (const i of arr) {
      const [key, value] = i.split('=');

      if (key.trim() === 'authorization') {
        const s = decodeURI(value).split(' ');

        if (s.length != 2) return false;

        token = s[1];
        break;
      }
    }

    if (!token) return false;

    try {
      this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
    } catch (e) {
      return false;
    }

    return true;
  }
}
