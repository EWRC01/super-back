import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AccountsholdingsService } from './accountsholdings.service';
import { CreateAccountsholdingDto } from './dto/create-accountsholding.dto';
import { UpdateAccountsholdingDto } from './dto/update-accountsholding.dto';

@Controller('accountsholdings')
export class AccountsholdingsController {
  constructor(private readonly accountsholdingsService: AccountsholdingsService) {}

  @Post()
  create(@Body() createAccountsholdingDto: CreateAccountsholdingDto) {
    return this.accountsholdingsService.create(createAccountsholdingDto);
  }

  @Get()
  findAll() {
    return this.accountsholdingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountsholdingsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAccountsholdingDto: UpdateAccountsholdingDto) {
    return this.accountsholdingsService.update(+id, updateAccountsholdingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountsholdingsService.remove(+id);
  }
}
