import { Module } from '@nestjs/common';
import { AccountsHoldingsService } from './accountsholdings.service';
import { AccountsHoldingsController } from './accountsholdings.controller';
import { AccountsHoldings } from './entities/accountsholding.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from 'src/customers/entities/customer.entity';
import { User } from 'src/users/entities/user.entity';
import { SoldProduct } from 'src/soldproducts/entities/soldproduct.entity';
import { Sale } from 'src/sales/entities/sale.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { Product } from 'src/products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AccountsHoldings, Customer, User, SoldProduct, Sale, Payment, Product])],
  controllers: [AccountsHoldingsController],
  providers: [AccountsHoldingsService],
  exports: [AccountsHoldingsService]
})
export class AccountsholdingsModule {}
