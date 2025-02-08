import { Injectable } from '@nestjs/common';
import { CreateAccountsholdingDto } from './dto/create-accountsholding.dto';
import { UpdateAccountsholdingDto } from './dto/update-accountsholding.dto';

@Injectable()
export class AccountsholdingsService {
  create(createAccountsholdingDto: CreateAccountsholdingDto) {
    return 'This action adds a new accountsholding';
  }

  findAll() {
    return `This action returns all accountsholdings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} accountsholding`;
  }

  update(id: number, updateAccountsholdingDto: UpdateAccountsholdingDto) {
    return `This action updates a #${id} accountsholding`;
  }

  remove(id: number) {
    return `This action removes a #${id} accountsholding`;
  }
}
