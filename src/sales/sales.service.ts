import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { FilterSalesDto } from './dto/filter-sales.dto';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private salesRepository: Repository<Sale>,
  ) {}

  async createSale(createSaleDto: CreateSaleDto) {
    const sale = this.salesRepository.create(createSaleDto);
    return await this.salesRepository.save(sale);
  }

  async getSales(filters: FilterSalesDto) {
    const query = this.salesRepository.createQueryBuilder('sale');
    if (filters.startDate) {
      query.andWhere('sale.date >= :startDate', { startDate: filters.startDate });
    }
    if (filters.endDate) {
      query.andWhere('sale.date <= :endDate', { endDate: filters.endDate });
    }
    return await query.getMany();
  }

  async getTotalSales(filters: FilterSalesDto) {
    const query = this.salesRepository.createQueryBuilder('sale')
      .select('SUM(sale.total)', 'totalAmount')
      .addSelect('COUNT(sale.id)', 'totalSales');

    if (filters.startDate) {
      query.andWhere('sale.date >= :startDate', { startDate: filters.startDate });
    }
    if (filters.endDate) {
      query.andWhere('sale.date <= :endDate', { endDate: filters.endDate });
    }

    return await query.getRawOne();
  }
}
