import { Injectable } from '@nestjs/common';

@Injectable()
export class TweetsService {
  getHello(): string {
    return 'Hello World!';
  }
}
