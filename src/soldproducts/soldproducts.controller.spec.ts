import { Test, TestingModule } from '@nestjs/testing';
import { SoldproductsController } from './soldproducts.controller';
import { SoldproductsService } from './soldproducts.service';

describe('SoldproductsController', () => {
  let controller: SoldproductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SoldproductsController],
      providers: [SoldproductsService],
    }).compile();

    controller = module.get<SoldproductsController>(SoldproductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
