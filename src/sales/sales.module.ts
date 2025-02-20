import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './entities/sale.entity';
import { Product } from 'src/products/entities/product.entity';
import { SoldProduct } from 'src/soldproducts/entities/soldproduct.entity';
import { User } from 'src/users/entities/user.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import { AccountsHoldings } from 'src/accountsholdings/entities/accountsholding.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, Product, SoldProduct, User, Customer, AccountsHoldings])],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
