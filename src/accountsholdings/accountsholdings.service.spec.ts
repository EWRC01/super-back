import { Test, TestingModule } from '@nestjs/testing';
import { AccountsholdingsService } from './accountsholdings.service';

describe('AccountsholdingsService', () => {
  let service: AccountsholdingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountsholdingsService],
    }).compile();

    service = module.get<AccountsholdingsService>(AccountsholdingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
