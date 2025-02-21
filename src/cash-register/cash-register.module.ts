import { Module } from '@nestjs/common';
import { CashRegisterService } from './cash-register.service';
import { CashRegisterController } from './cash-register.controller';
import { CashRegister } from './entities/cash-register.entity';
import { Sale } from 'src/sales/entities/sale.entity';
import { User } from 'src/users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from 'src/payments/entities/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CashRegister, Sale, User, Payment])],
  controllers: [CashRegisterController],
  providers: [CashRegisterService],
})
export class CashRegisterModule {}
