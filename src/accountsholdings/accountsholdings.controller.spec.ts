import { Test, TestingModule } from '@nestjs/testing';
import { AccountsholdingsController } from './accountsholdings.controller';
import { AccountsholdingsService } from './accountsholdings.service';

describe('AccountsholdingsController', () => {
  let controller: AccountsholdingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountsholdingsController],
      providers: [AccountsholdingsService],
    }).compile();

    controller = module.get<AccountsholdingsController>(AccountsholdingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
