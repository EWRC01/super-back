import { Module } from '@nestjs/common';
import { AccountsHoldingsService } from './accountsholdings.service';
import { AccountsHoldingsController } from './accountsholdings.controller';
import { AccountsHoldings } from './entities/accountsholding.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from 'src/customers/entities/customer.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AccountsHoldings, Customer, User])],
  controllers: [AccountsHoldingsController],
  providers: [AccountsHoldingsService],
})
export class AccountsholdingsModule {}
