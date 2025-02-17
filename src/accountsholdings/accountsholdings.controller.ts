import { Controller, Get, Post, Body, Param, Query, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AccountsHoldingsService } from './accountsholdings.service';
import { CreateAccountsholdingDto } from './dto/create-accountsholding.dto';
import { UpdateAccountsholdingDto } from './dto/update-accountsholding.dto';


@ApiTags('Accounts-Holdings')
@Controller('accounts-holdings')
export class AccountsHoldingsController {
  constructor(private readonly accountsHoldingsService: AccountsHoldingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new account or holding' })
  @ApiResponse({ status: 201, description: 'The account or holding has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  create(@Body() createAccountsHoldingsDto: CreateAccountsholdingDto) {
    return this.accountsHoldingsService.create(createAccountsHoldingsDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all accounts and holdings within a date range' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'List of accounts and holdings.' })
  findAll(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.accountsHoldingsService.findAll(startDate, endDate);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an account or holding' })
  @ApiResponse({ status: 200, description: 'The account or holding has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Account or holding not found.' })
  update(@Param('id') id: string, @Body() updateAccountsHoldingsDto: UpdateAccountsholdingDto) {
    return this.accountsHoldingsService.update(+id, updateAccountsHoldingsDto);
  }

  @Post(':id/pay')
  @ApiOperation({ summary: 'Make a payment towards an account or holding' })
  @ApiResponse({ status: 200, description: 'Payment successful.' })
  @ApiResponse({ status: 404, description: 'Account or holding not found.' })
  pay(@Param('id') id: string, @Body('amount') amount: number) {
    return this.accountsHoldingsService.pay(+id, amount);
  }
}