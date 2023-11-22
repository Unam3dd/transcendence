import { Test, TestingModule } from '@nestjs/testing';
import { A2fController } from './a2f.controller';

describe('A2fController', () => {
  let controller: A2fController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [A2fController],
    }).compile();

    controller = module.get<A2fController>(A2fController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
