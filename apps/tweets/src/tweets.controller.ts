import { Controller, Get } from '@nestjs/common';
import { TweetsService } from './tweets.service';

@Controller()
export class TweetsController {
  constructor(private readonly tweetsService: TweetsService) {}

  @Get()
  getHello(): string {
    return this.tweetsService.getHello();
  }
}
