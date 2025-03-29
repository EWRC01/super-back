import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './entities/sale.entity';
import { Product } from 'src/products/entities/product.entity';
import { SoldProduct } from 'src/soldproducts/entities/soldproduct.entity';
import { User } from 'src/users/entities/user.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import { Discount } from 'src/discounts/entities/discount.entity';
import { AppliedDiscount } from 'src/discounts/entities/applied-discount.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, Product, SoldProduct, User, Customer, Discount, AppliedDiscount])],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
