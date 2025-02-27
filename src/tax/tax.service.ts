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
    const startDate = moment.tz(`${year}-${month}-01 00:00:00`, 'America/El_Salvador').format('YYYY-MM-DD HH:mm:ss');
    const endDate = moment.tz(`${year}-${month}-01 23:59:59`, 'America/El_Salvador').endOf('month').format('YYYY-MM-DD HH:mm:ss');
  
    const sales = await this.saleRepository.find({
      where: { date: Between(new Date(startDate), new Date(endDate) ) },
    });
  
    let totalIVA = 0;
    let totalSales = 0;
  
    for (const sale of sales) {
      totalIVA += Number(sale.totalIVA);
      totalSales += Number(sale.totalWithIVA);
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
    // Convertimos a Date asegurándonos de que sean válidos
    const start = moment.tz(startDate, 'America/El_Salvador').startOf('day').toDate();
    const end = moment.tz(endDate, 'America/El_Salvador').endOf('day').toDate();
  
    // Buscamos ventas en el rango de fechas
    const sales = await this.saleRepository.find({
      where: { date: Between(start, end) },
      relations: ['products'], // Relación corregida
    });
  
    let totalIVA = 0;
    let totalSales = 0;
  
    // Calculamos el IVA basado en las ventas
    for (const sale of sales) {
      for (const product of sale.products) {
        const iva = product.price * 0.13; // 13% de IVA
        totalIVA += iva * product.quantity;
        totalSales += product.price * product.quantity;
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
