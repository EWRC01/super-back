import { Test, TestingModule } from '@nestjs/testing';
import { SoldproductsService } from './soldproducts.service';

describe('SoldproductsService', () => {
  let service: SoldproductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SoldproductsService],
    }).compile();

    service = module.get<SoldproductsService>(SoldproductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
