import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AccountsHoldingsService } from './accountsholdings.service';
import { FilterAccountsHoldingsDto } from './dto/filter-account-holdings.dto';
import { AccountsHoldingsResponseDto } from './dto/accounts-holdings-response.dto';

@ApiTags('Accounts Holdings')
@Controller('accounts-holdings')
export class AccountsHoldingsController {
  constructor(private readonly accountsHoldingsService: AccountsHoldingsService) {}

  @Get('/total')
  @ApiOperation({ summary: 'Obtener el balance total de cuentas' })
  @ApiResponse({ status: 200, type: AccountsHoldingsResponseDto })
  getTotalBalance(@Query() filters: FilterAccountsHoldingsDto) {
    return this.accountsHoldingsService.getTotalBalance(filters);
  }
}
