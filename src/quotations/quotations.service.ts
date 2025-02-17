import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Quotation } from './entities/quotation.entity';
import { CreateQuotationDto } from './dto/create-quotation.dto';

@Injectable()
export class QuotationsService {
  constructor(
    @InjectRepository(Quotation)
    private quotationsRepository: Repository<Quotation>,
  ) {}

  async create(createQuotationDto: CreateQuotationDto): Promise<Quotation> {
    const quotation = this.quotationsRepository.create(createQuotationDto);
    return this.quotationsRepository.save(quotation);
  }

  async findAll(startDate: string, endDate: string): Promise<Quotation[]> {
    return this.quotationsRepository.find({
      where: {
        date: Between(new Date(startDate), new Date(endDate)),
      },
    });
  }

  async remove(id: number): Promise<void> {
    await this.quotationsRepository.delete(id);
  }
}