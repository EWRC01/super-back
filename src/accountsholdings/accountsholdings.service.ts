import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AccountsHoldings } from './entities/accountsholding.entity';
import { CreateAccountsholdingDto } from './dto/create-accountsholding.dto';
import { UpdateAccountsholdingDto } from './dto/update-accountsholding.dto';
import { User } from 'src/users/entities/user.entity';
import { Customer } from 'src/customers/entities/customer.entity';

@Injectable()
export class AccountsHoldingsService {
  constructor(
    @InjectRepository(AccountsHoldings)
    private accountsHoldingsRepository: Repository<AccountsHoldings>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async create(createAccountsHoldingsDto: CreateAccountsholdingDto): Promise<AccountsHoldings> {

    const customer = await this.customerRepository.findOne({ where: {id: createAccountsHoldingsDto.customerId} });

    if (!customer) {throw new NotFoundException(`Customer with ID ${createAccountsHoldingsDto.customerId} not found`);}

    const user = await this.userRepository.findOne({ where: {id: createAccountsHoldingsDto.userId} });

    if (!user) {throw new NotFoundException(`User with ID ${createAccountsHoldingsDto.userId} not found`);}

    const accountsHoldings = this.accountsHoldingsRepository.create({...createAccountsHoldingsDto, customer, user});

    return this.accountsHoldingsRepository.save(accountsHoldings);
  }

  async findAll(startDate: string, endDate: string): Promise<AccountsHoldings[]> {
    return this.accountsHoldingsRepository.find({
      where: {
        date: Between(new Date(startDate), new Date(endDate)),
      },
    });
  }

  async update(id: number, updateAccountsHoldingsDto: UpdateAccountsholdingDto): Promise<AccountsHoldings> {

    const customer = await this.customerRepository.findOne({ where: {id: updateAccountsHoldingsDto.customerId} });

    if (!customer) {throw new NotFoundException(`Customer with ID ${updateAccountsHoldingsDto.customerId} not found`);}

    const user = await this.userRepository.findOne({ where: {id: updateAccountsHoldingsDto.userId} });

    if (!user) {throw new NotFoundException(`User with ID ${updateAccountsHoldingsDto.userId} not found`);} 
    
    await this.accountsHoldingsRepository.update(id, {...updateAccountsHoldingsDto, customer, user});

    return this.accountsHoldingsRepository.findOne({ where: { id } });
  }

  async pay(id: number, amount: number): Promise<AccountsHoldings> {
    const account = await this.accountsHoldingsRepository.findOne({ where: { id } });

    if (!account) {throw new NotFoundException(`Account with ID ${id} not found`);}
    
    account.paid += amount;
    account.toPay -= amount;
    return this.accountsHoldingsRepository.save(account);
  }
}