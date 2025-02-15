import { Module } from '@nestjs/common';
import { AccountsHoldingsService } from './accountsholdings.service';
import { AccountsHoldingsController } from './accountsholdings.controller';
import { AccountsHoldings } from './entities/accountsholding.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([AccountsHoldings])],
  controllers: [AccountsHoldingsController],
  providers: [AccountsHoldingsService],
})
export class AccountsholdingsModule {}
