import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { TaxService } from './tax.service';

@ApiTags('Tax') // Categoriza este controlador en Swagger
@Controller('Tax')
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  /**
   * Obtiene el IVA total de un mes específico.
   * 
   * @param year Año en formato numérico (ej. 2024)
   * @param month Mes en formato numérico (1-12)
   * @returns Total de IVA generado en el mes seleccionado
   */
  @ApiOperation({ summary: 'Obtener el IVA mensual', description: 'Obtiene el total de IVA generado en un mes específico.' })
  @ApiQuery({ name: 'year', example: 2024, description: 'Año en formato numérico (ejemplo: 2024)' })
  @ApiQuery({ name: 'month', example: 2, description: 'Mes en formato numérico (1-12)' })
  @ApiResponse({ status: 200, description: 'Retorna el IVA total del mes' })
  @ApiResponse({ status: 400, description: 'Parámetros inválidos' })
  @Get('monthly')
  async getMonthlyIVA(@Query('year') year: number, @Query('month') month: number) {
    return this.taxService.getMonthlyIVA(Number(year), Number(month));
  }

  /**
   * Obtiene el IVA en un rango de fechas específico.
   * 
   * @param startDate Fecha de inicio (ejemplo: "2024-01-01")
   * @param endDate Fecha de fin (ejemplo: "2024-01-31")
   * @returns IVA total dentro del rango de fechas
   */
  @ApiOperation({ summary: 'Obtener IVA en un rango de fechas', description: 'Obtiene el IVA generado entre dos fechas específicas.' })
  @ApiQuery({ name: 'startDate', example: '2024-01-01', description: 'Fecha de inicio en formato YYYY-MM-DD' })
  @ApiQuery({ name: 'endDate', example: '2024-01-31', description: 'Fecha de fin en formato YYYY-MM-DD' })
  @ApiResponse({ status: 200, description: 'Retorna el IVA total dentro del rango de fechas' })
  @ApiResponse({ status: 400, description: 'Parámetros inválidos' })
  @Get('range')
  async getIVAByDateRange(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.taxService.getIVAByDateRange(startDate, endDate);
  }
}
