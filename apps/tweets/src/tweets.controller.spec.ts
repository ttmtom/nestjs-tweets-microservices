import { Test, TestingModule } from '@nestjs/testing';
import { TweetsController } from './tweets.controller';
import { TweetsService } from './tweets.service';

describe('TweetsController', () => {
  let tweetsController: TweetsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TweetsController],
      providers: [TweetsService],
    }).compile();

    tweetsController = app.get<TweetsController>(TweetsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(tweetsController.getHello()).toBe('Hello World!');
    });
  });
});
