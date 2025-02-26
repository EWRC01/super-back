import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from 'src/sales/entities/sale.entity';
import * as moment from 'moment-timezone';

@Injectable()
export class TaxService {
  constructor(
    @InjectRepository(Sale)
    private readonly salesRepository: Repository<Sale>,
  ) {}

  /**
   * Obtiene el total del IVA generado en un mes específico.
   * @param year Año de consulta
   * @param month Mes de consulta (1-12)
   * @returns Total del IVA generado en el mes
   */
  async getMonthlyTax(year: number, month: number): Promise<{ year: number; month: number; totalIVA: number }> {
    // Definir la zona horaria correcta (El Salvador)
    const timezone = 'America/El_Salvador';

    // Definir el rango del mes en la zona horaria correcta
    const startDate = moment.tz({ year, month: month - 1, day: 1 }, timezone).startOf('day').toDate();
    const endDate = moment.tz({ year, month: month - 1 }, timezone).endOf('month').toDate();

    const totalIVA = await this.salesRepository
      .createQueryBuilder('sale')
      .select('SUM(sale.totalIVA)', 'totalIVA')
      .where('sale.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getRawOne();

    return {
      year,
      month,
      totalIVA: totalIVA?.totalIVA || 0, // Si no hay ventas, devuelve 0
    };
  }
}
