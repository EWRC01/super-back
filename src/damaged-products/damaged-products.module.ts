import { Module } from '@nestjs/common';
import { DamagedProductsService } from './damaged-products.service';
import { DamagedProductsController } from './damaged-products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DamagedProduct } from './entities/damaged-product.entity';
import { Product } from 'src/products/entities/product.entity';
import { Brand } from 'src/brands/entities/brand.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DamagedProduct, Product, Brand])],
  controllers: [DamagedProductsController],
  providers: [DamagedProductsService],
})
export class DamagedProductsModule {}
