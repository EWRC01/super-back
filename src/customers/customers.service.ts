import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const customer = this.customersRepository.create(createCustomerDto);
    return this.customersRepository.save(customer);
  }

  async findAll(): Promise<Customer[]> {
    return this.customersRepository.find();
  }

  async findOne(id: number): Promise<Customer> {
    return this.customersRepository.findOne({ where: { id } });
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {

    const customer = await this.customersRepository.findOne({ where: { id } });

    if (!customer) {throw new NotFoundException(`Customer with ID ${id} not found`);}

    await this.customersRepository.update(id, updateCustomerDto);

    return this.customersRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {

    const customer = await this.customersRepository.findOne({ where: { id } });

    if (!customer) {throw new NotFoundException(`Customer with ID ${id} not found`);}

    await this.customersRepository.delete(id);
  }

  async getSalesByCustomer(id: number): Promise<any> {

    const customer = await this.customersRepository.findOne({ where: { id } });

    if (!customer) {throw new NotFoundException(`Customer with ID ${id} not found`);} 

    return this.customersRepository
      .createQueryBuilder('customer')
      .select('customer.id', 'id')
      .addSelect('SUM(sale.totalWithIVA)', 'totalSales')
      .leftJoin('customer.sales', 'sale')
      .groupBy('customer.id')
      .getRawMany();
  }

  async searchByName(name: string): Promise<Customer[]> {
    return this.customersRepository
      .createQueryBuilder('customer')
      .where('customer.name LIKE :name', { name: `%${name}%` })
      .getMany();
  }
}