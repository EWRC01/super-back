import { Module } from '@nestjs/common';
import { AccountsholdingsService } from './accountsholdings.service';
import { AccountsholdingsController } from './accountsholdings.controller';

@Module({
  controllers: [AccountsholdingsController],
  providers: [AccountsholdingsService],
})
export class AccountsholdingsModule {}
