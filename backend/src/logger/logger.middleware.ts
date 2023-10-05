import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    const date = new Date().toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    });

    let ip = req.ip.split(':');
    ip = ip.slice(ip.length - 1);

    console.log(
      `\x1b[32m[Nest] ${process.pid}  - \x1b[00m${date} \x1b[32m    ${ip} \x1b[33m[${req.method}] \x1b[32m${req.path}\x1b[00m HTTP/${req.httpVersion}`,
    );
    next();
  }
}
