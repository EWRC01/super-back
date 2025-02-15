import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quotation } from './entities/quotation.entity';
import { FilterQuotationsDto } from './dto/filter-quotations.dto';

@Injectable()
export class QuotationsService {
  constructor(
    @InjectRepository(Quotation)
    private quotationsRepository: Repository<Quotation>,
  ) {}

  async getQuotations(filters: FilterQuotationsDto) {
    const query = this.quotationsRepository.createQueryBuilder('quotation');
    if (filters.startDate) {
      query.andWhere('quotation.date >= :startDate', { startDate: filters.startDate });
    }
    if (filters.endDate) {
      query.andWhere('quotation.date <= :endDate', { endDate: filters.endDate });
    }
    return await query.getMany();
  }

  async getTotalQuotations(filters: FilterQuotationsDto) {
    const query = this.quotationsRepository.createQueryBuilder('quotation')
      .select('SUM(quotation.amount)', 'totalAmount')
      .addSelect('COUNT(quotation.id)', 'totalQuotations');

    if (filters.startDate) {
      query.andWhere('quotation.date >= :startDate', { startDate: filters.startDate });
    }
    if (filters.endDate) {
      query.andWhere('quotation.date <= :endDate', { endDate: filters.endDate });
    }

    return await query.getRawOne();
  }
}
