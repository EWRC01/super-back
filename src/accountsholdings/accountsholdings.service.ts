import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountsHoldings } from './entities/accountsholding.entity';
import { FilterAccountsHoldingsDto } from './dto/filter-account-holdings.dto';

@Injectable()
export class AccountsHoldingsService {
  constructor(
    @InjectRepository(AccountsHoldings)
    private accountsHoldingsRepository: Repository<AccountsHoldings>,
  ) {}

  async getTotalBalance(filters: FilterAccountsHoldingsDto) {
    const query = this.accountsHoldingsRepository.createQueryBuilder('accounts_holdings')
      .select('SUM(accounts_holdings.balance)', 'totalBalance');

    if (filters.startDate) {
      query.andWhere('accounts_holdings.date >= :startDate', { startDate: filters.startDate });
    }
    if (filters.endDate) {
      query.andWhere('accounts_holdings.date <= :endDate', { endDate: filters.endDate });
    }

    return await query.getRawOne();
  }
}
