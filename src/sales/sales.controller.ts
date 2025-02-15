import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { FilterSalesDto } from './dto/filter-sales.dto';
import { SalesResponseDto } from './dto/sales-response.dto';

@ApiTags('Sales')
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva venta' })
  @ApiResponse({ status: 201, description: 'Venta creada exitosamente' })
  createSale(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.createSale(createSaleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener ventas con filtros' })
  @ApiResponse({ status: 200, type: [SalesResponseDto] })
  getSales(@Query() filters: FilterSalesDto) {
    return this.salesService.getSales(filters);
  }

  @Get('/total')
  @ApiOperation({ summary: 'Obtener el total de ventas y monto' })
  @ApiResponse({ status: 200, type: SalesResponseDto })
  getTotalSales(@Query() filters: FilterSalesDto) {
    return this.salesService.getTotalSales(filters);
  }
}
