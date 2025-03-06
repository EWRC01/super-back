// src/sold-products/sold-products.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { SoldProductsService } from './soldproducts.service';
import { CreateSoldProductsDto } from './dto/create-soldproduct.dto';
import { UpdateSoldProductDto } from './dto/update-soldproduct.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@ApiTags('Sold-Products')
@Controller('sold-products')
export class SoldProductsController {
  constructor(private readonly soldProductsService: SoldProductsService) {}


  @Post('register')
  @ApiOperation({ summary: 'Registrar productos vendidos' })
  @ApiBody({ type: CreateSoldProductsDto })
  @ApiResponse({ status: 201, description: 'Productos registrados exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 404, description: 'Uno o más productos no existen.' })
  async registerSoldProducts(@Body() createSoldProductsDto: CreateSoldProductsDto) {
    try {
      return await this.soldProductsService.registerSoldProducts(createSoldProductsDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los productos vendidos' })
  @ApiResponse({ status: 200, description: 'Lista de productos vendidos.' })  
  @ApiResponse({ status: 404, description: 'No se encontraron productos vendidos.' })
  async find(@Query() paginationDto: PaginationDto) {
    return this.soldProductsService.find(paginationDto);
  }

  @Get(':id/:type')
  @ApiOperation({ summary: 'Obtener productos vendidos por ID y tipo' })
  @ApiParam({ name: 'id', description: 'ID de referencia', example: 1 })
  @ApiParam({ name: 'type', description: 'Tipo de referencia', example: 'sale' })
  @ApiResponse({ status: 200, description: 'Lista de productos vendidos' })
  @ApiResponse({ status: 404, description: 'No se encontraron productos vendidos.' })
  async getSoldProductsByIdAndType(
    @Param('id') id: number,
    @Param('type') type: string,
  ) {
    return this.soldProductsService.getSoldProductsByIdAndType(id, type);
  }

  @Get('top-sold')
  @ApiOperation({ summary: 'Obtener productos más vendidos' })
  @ApiQuery({ name: 'limit', description: 'Límite de resultados', example: 5 })
  @ApiResponse({ status: 200, description: 'Lista de productos más vendidos.' })
  @ApiResponse({ status: 404, description: 'No se encontraron productos vendidos.' })
  async getTopSoldProducts(@Query('limit') limit: number) {
    return this.soldProductsService.getTopSoldProducts(limit);
  }

  @Get('totals-by-brand')
  @ApiOperation({ summary: 'Obtener totales de ventas por marca' })
  @ApiResponse({ status: 200, description: 'Totales de ventas por marca.' })
  @ApiResponse({ status: 404, description: 'No se encontraron ventas por marca.' })
  async getSalesTotalsByBrand() {
    return this.soldProductsService.getSalesTotalsByBrand();
  }

  @Get('totals-by-category')
  @ApiOperation({ summary: 'Obtener totales de ventas por categoría' })
  @ApiResponse({ status: 200, description: 'Totales de ventas por categoría.' })
  @ApiResponse({ status: 404, description: 'No se encontraron ventas por categoría.' })
  async getSalesTotalsByCategory() {
    return this.soldProductsService.getSalesTotalsByCategory();
  }

  @Get('top-sold-by-brand')
  @ApiOperation({ summary: 'Obtener el producto más vendido por marca' })
  @ApiResponse({ status: 200, description: 'Producto más vendido por marca.' })
  @ApiResponse({ status: 404, description: 'No se encontraron productos vendidos por marca.' })
  async getTopSoldProductByBrand() {
    return this.soldProductsService.getTopSoldProductByBrand();
  }

  @Get('top-sold-by-category')
  @ApiOperation({ summary: 'Obtener el producto más vendido por categoría' })
  @ApiResponse({ status: 200, description: 'Producto más vendido por categoría.' })
  @ApiResponse({ status: 404, description: 'No se encontraron productos vendidos por categoría.' })
  async getTopSoldProductByCategory() {
    return this.soldProductsService.getTopSoldProductByCategory();
  }
}