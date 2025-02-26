import { Controller, Get, Query } from '@nestjs/common';
import { TaxService } from './tax.service';

@Controller('tax')
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  /**
   * Obtiene el IVA total generado en un mes específico.
   * @param year Año de consulta
   * @param month Mes de consulta (1-12)
   */
  @Get('monthly')
  async getMonthlyTax(
    @Query('year') year: number,
    @Query('month') month: number,
  ) {
    return this.taxService.getMonthlyTax(year, month);
  }
}
