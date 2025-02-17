import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';

@ApiTags('Sales')
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new sale' })
  @ApiResponse({ status: 201, description: 'The sale has been successfully created.' })
  @ApiResponse({ status: 404, description: 'Some of the Query Not Found' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(createSaleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sales within a date range' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'List of sales.' })
  findAll(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.salesService.findAll(startDate, endDate);
  }

  @Get('daily/:month/:year')
  @ApiOperation({ summary: 'Get daily sales for a specific month and year' })
  @ApiResponse({ status: 200, description: 'Daily sales data.' })
  getDailySales(@Param('month') month: string, @Param('year') year: string) {
    return this.salesService.getDailySales(+month, +year);
  }

  @Get('monthly/:year')
  @ApiOperation({ summary: 'Get monthly sales for a specific year' })
  @ApiResponse({ status: 200, description: 'Monthly sales data.' })
  getMonthlySales(@Param('year') year: string) {
    return this.salesService.getMonthlySales(+year);
  }

  @Get('total-income')
  @ApiOperation({ summary: 'Get total income from sales' })
  @ApiResponse({ status: 200, description: 'Total income.' })
  getTotalIncome() {
    return this.salesService.getTotalIncome();
  }

  @Get('today-income')
  @ApiOperation({ summary: 'Get income from sales for today' })
  @ApiResponse({ status: 200, description: 'Today\'s income.' })
  getTodayIncome() {
    return this.salesService.getTodayIncome();
  }

  @Get('weekly-income')
  @ApiOperation({ summary: 'Get income from sales for the current week' })
  @ApiResponse({ status: 200, description: 'Weekly income.' })
  getWeeklyIncome() {
    return this.salesService.getWeeklyIncome();
  }

  @Get('monthly-income')
  @ApiOperation({ summary: 'Get income from sales for the current month' })
  @ApiResponse({ status: 200, description: 'Monthly income.' })
  getMonthlyIncome() {
    return this.salesService.getMonthlyIncome();
  }

  @Get('pending-income')
  @ApiOperation({ summary: 'Get pending income from sales' })
  @ApiResponse({ status: 200, description: 'Pending income.' })
  getPendingIncome() {
    return this.salesService.getPendingIncome();
  }
}