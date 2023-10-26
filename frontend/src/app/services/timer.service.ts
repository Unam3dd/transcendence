import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimerService {

  constructor () {}

  async sleep(ms: number) {
    return (new Promise((res) => setTimeout(res, ms)));
  }
}
