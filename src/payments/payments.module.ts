import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { AccountsHoldings } from 'src/accountsholdings/entities/accountsholding.entity';
import { Product } from 'src/products/entities/product.entity';
import { PaymentsController } from './payments.controller';
import { AccountsholdingsModule } from 'src/accountsholdings/accountsholdings.module';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, AccountsHoldings, Product]),
AccountsholdingsModule],
  providers: [PaymentsService],
  controllers: [PaymentsController]
})
export class PaymentsModule {}
