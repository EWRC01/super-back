import { Module } from '@nestjs/common';
import { OrderDetailsService } from './orderdetails.service';
import { OrderDetailsController } from './orderdetails.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderDetail } from './entities/orderdetail.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Product } from 'src/products/entities/product.entity';
import { Brand } from 'src/brands/entities/brand.entity';
import { Category } from 'src/categories/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderDetail, Order, Product, Brand, Category])],
  controllers: [OrderDetailsController],
  providers: [OrderDetailsService],
})
export class OrderdetailsModule {}
