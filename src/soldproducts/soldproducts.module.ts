import { Module } from '@nestjs/common';
import { SoldProductsService } from './soldproducts.service';
import { SoldProductsController } from './soldproducts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SoldProduct } from './entities/soldproduct.entity';
import { Product } from 'src/products/entities/product.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Brand } from 'src/brands/entities/brand.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SoldProduct, Product, Category, Brand])],
  controllers: [SoldProductsController],
  providers: [SoldProductsService],
})
export class SoldproductsModule {}
