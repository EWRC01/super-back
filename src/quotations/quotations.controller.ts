import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QuotationsService } from './quotations.service';
import { FilterQuotationsDto } from './dto/filter-quotations.dto';
import { QuotationResponseDto } from './dto/quotation-response.dto';

@ApiTags('Quotations')
@Controller('quotations')
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener cotizaciones con filtros' })
  @ApiResponse({ status: 200, type: [QuotationResponseDto] })
  getQuotations(@Query() filters: FilterQuotationsDto) {
    return this.quotationsService.getQuotations(filters);
  }

  @Get('/total')
  @ApiOperation({ summary: 'Obtener el total de cotizaciones y monto' })
  @ApiResponse({ status: 200, type: QuotationResponseDto })
  getTotalQuotations(@Query() filters: FilterQuotationsDto) {
    return this.quotationsService.getTotalQuotations(filters);
  }
}
