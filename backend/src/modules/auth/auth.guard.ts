import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { isEmpty } from 'class-validator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor (private JwtService: JwtService) {}
  
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(req);
    
    if (!token) throw new UnauthorizedException();

    try {
      const payload = await this.JwtService.verifyAsync(
        token, { secret: process.env.JWT_SECRET }
      )
      req['user'] = payload;
    } catch (err) {
      throw new UnauthorizedException();
    }

    return (true);
  }

  private extractTokenFromHeader(req: Request): string | undefined {
    const authorization = req.headers['authorization'];

    if (isEmpty(authorization)) return (undefined);

    const [type, token] = authorization.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }
}
