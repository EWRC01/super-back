import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Sale } from 'src/sales/entities/sale.entity';
import { SoldProduct } from 'src/soldproducts/entities/soldproduct.entity';
import * as moment from 'moment-timezone';

@Injectable()
export class TaxService {
  constructor(
    @InjectRepository(Sale) private readonly saleRepository: Repository<Sale>,
    @InjectRepository(SoldProduct) private readonly soldProductRepository: Repository<SoldProduct>,
  ) {}

  /**
   * Obtiene el IVA total recaudado en un mes específico
   */
  async getMonthlyIVA(year: number, month: number) {
    const startDate = moment.tz(`${year}-${month}-01`, 'America/El_Salvador').startOf('month').toDate();
    const endDate = moment.tz(`${year}-${month}-01`, 'America/El_Salvador').endOf('month').toDate();

    const sales = await this.saleRepository.find({
      where: { date: Between(startDate, endDate) },
      relations: ['soldProducts'],
    });

    let totalIVA = 0;
    let totalSales = 0;

    for (const sale of sales) {
      for (const soldProduct of sale.products) {
        const iva = soldProduct.price * 0.13; // IVA del 13%
        totalIVA += iva * soldProduct.quantity;
        totalSales += soldProduct.price * soldProduct.quantity;
      }
    }

    return {
      month,
      year,
      totalIVA: totalIVA.toFixed(2),
      totalSales: totalSales.toFixed(2),
    };
  }

  /**
   * Obtiene el IVA recaudado en un rango de fechas
   */
  async getIVAByDateRange(startDate: string, endDate: string) {
    const start = moment.tz(startDate, 'America/El_Salvador').startOf('day').toDate();
    const end = moment.tz(endDate, 'America/El_Salvador').endOf('day').toDate();

    const sales = await this.saleRepository.find({
      where: { date: Between(start, end) },
      relations: ['soldProducts'],
    });

    let totalIVA = 0;
    let totalSales = 0;

    for (const sale of sales) {
      for (const soldProduct of sale.products) {
        const iva = soldProduct.price * 0.13;
        totalIVA += iva * soldProduct.quantity;
        totalSales += soldProduct.price * soldProduct.quantity;
      }
    }

    return {
      startDate,
      endDate,
      totalIVA: totalIVA.toFixed(2),
      totalSales: totalSales.toFixed(2),
    };
  }
}
