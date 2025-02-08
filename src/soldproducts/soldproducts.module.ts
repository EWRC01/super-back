import { Module } from '@nestjs/common';
import { SoldproductsService } from './soldproducts.service';
import { SoldproductsController } from './soldproducts.controller';

@Module({
  controllers: [SoldproductsController],
  providers: [SoldproductsService],
})
export class SoldproductsModule {}
