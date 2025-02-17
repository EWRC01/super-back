import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { QuotationsService } from './quotations.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';

@ApiTags('Quotes')
@Controller('quotations')
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new quotation' })
  @ApiResponse({ status: 201, description: 'The quotation has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  create(@Body() createQuotationDto: CreateQuotationDto) {
    return this.quotationsService.create(createQuotationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all quotations within a date range' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'List of quotations.' })
  findAll(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.quotationsService.findAll(startDate, endDate);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a quotation' })
  @ApiResponse({ status: 200, description: 'The quotation has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Quotation not found.' })
  remove(@Param('id') id: string) {
    return this.quotationsService.remove(+id);
  }
}