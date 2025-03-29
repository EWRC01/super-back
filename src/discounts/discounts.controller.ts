import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Discount } from './entities/discount.entity';
import * as moment from 'moment-timezone';
import { ParseFloatPipe } from 'src/common/pipe/parse-float.pipe';

@ApiTags('Discounts')
@Controller('discounts')
export class DiscountsController {
  private readonly timezone = 'America/El_Salvador';

  constructor(private readonly discountsService: DiscountsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo descuento' })
  @ApiResponse({
    status: 201,
    description: 'El descuento ha sido creado exitosamente',
    type: Discount,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  create(@Body() createDiscountDto: CreateDiscountDto) {
    // Formatear fechas con timezone
    if (createDiscountDto.startDate) {
      createDiscountDto.startDate = moment(createDiscountDto.startDate)
        .tz(this.timezone)
        .toDate();
    }
    if (createDiscountDto.endDate) {
      createDiscountDto.endDate = moment(createDiscountDto.endDate)
        .tz(this.timezone)
        .endOf('day')
        .toDate();
    }

    return this.discountsService.create(createDiscountDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los descuentos' })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'Filtrar por estado activo/inactivo',
  })
  @ApiQuery({
    name: 'productId',
    required: false,
    description: 'Filtrar por ID de producto',
  })
  @ApiQuery({
    name: 'includeExpired',
    required: false,
    description: 'Incluir descuentos expirados',
    type: Boolean,
  })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Fecha específica para verificar descuentos (formato YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de descuentos',
    type: [Discount],
  })
  findAll(
    @Query('isActive') isActive?: boolean,
    @Query('productId') productId?: number,
    @Query('includeExpired') includeExpired?: boolean,
    @Query('date') dateString?: string,
  ) {
    const filters: any = { isActive, productId, includeExpired };

    // Si se proporciona una fecha específica, convertirla a la zona horaria correcta
    if (dateString) {
      const date = moment(dateString).tz(this.timezone).toDate();
      return this.discountsService.findAll({
        ...filters,
        includeExpired: false, // Forzar a buscar solo descuentos vigentes en esa fecha
        date
      });
    }

    return this.discountsService.findAll(filters);
  }

  @Get('current')
  @ApiOperation({ summary: 'Obtener descuentos actualmente vigentes' })
  @ApiResponse({
    status: 200,
    description: 'Lista de descuentos vigentes',
    type: [Discount],
  })
  getCurrentDiscounts() {
    return this.discountsService.getCurrentDiscounts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un descuento por ID' })
  @ApiResponse({
    status: 200,
    description: 'Descuento encontrado',
    type: Discount,
  })
  @ApiResponse({ status: 404, description: 'Descuento no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.discountsService.findOne(id);
  }

  @Get(':id/check-validity')
  @ApiOperation({ summary: 'Verificar si un descuento es válido actualmente' })
  @ApiResponse({
    status: 200,
    description: 'Estado de validez del descuento',
    schema: {
      type: 'object',
      properties: {
        isValid: { type: 'boolean' },
        message: { type: 'string' },
        discount: { $ref: '#/components/schemas/Discount' }
      }
    }
  })
  async checkValidity(@Param('id', ParseIntPipe) id: number) {
    const discount = await this.discountsService.findOne(id);
    const isValid = await this.discountsService.checkDiscountValidity(id);
    
    return {
      isValid,
      message: isValid ? 'El descuento está vigente' : 'El descuento no está vigente',
      discount
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un descuento' })
  @ApiResponse({
    status: 200,
    description: 'Descuento actualizado',
    type: Discount,
  })
  @ApiResponse({ status: 404, description: 'Descuento no encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDiscountDto: UpdateDiscountDto,
  ) {
    // Formatear fechas con timezone
    if (updateDiscountDto.startDate) {
      updateDiscountDto.startDate = moment(updateDiscountDto.startDate)
        .tz(this.timezone)
        .toDate();
    }
    if (updateDiscountDto.endDate) {
      updateDiscountDto.endDate = moment(updateDiscountDto.endDate)
        .tz(this.timezone)
        .endOf('day')
        .toDate();
    }

    return this.discountsService.update(id, updateDiscountDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un descuento' })
  @ApiResponse({ status: 200, description: 'Descuento eliminado' })
  @ApiResponse({ status: 404, description: 'Descuento no encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.discountsService.remove(id);
  }

  @Get('product/:productId/calculate')
  @ApiOperation({ summary: 'Calcular descuentos aplicables para un producto' })
  @ApiQuery({
    name: 'quantity',
    required: true,
    description: 'Cantidad del producto',
    type: Number,
  })
  @ApiQuery({
    name: 'unitPrice',
    required: true,
    description: 'Precio unitario del producto',
    type: Number,
  })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Fecha específica para cálculo (formato YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de descuentos aplicables con cálculos',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          discount: { $ref: '#/components/schemas/Discount' },
          discountAmount: { type: 'number' },
          finalPrice: { type: 'number' },
          valid: { type: 'boolean' }
        }
      }
    }
  })
  async calculateApplicableDiscounts(
    @Param('productId', ParseIntPipe) productId: number,
    @Query('quantity', ParseIntPipe) quantity: number,
    @Query('unitPrice', ParseFloatPipe) unitPrice: number,
    @Query('date') dateString?: string,
  ) {
    const date = dateString ? moment(dateString).tz(this.timezone).toDate() : undefined;
    const discounts = await this.discountsService.getApplicableDiscounts(
      productId,
      quantity,
      date
    );

    return discounts.map(discount => {
      const discountAmount = this.discountsService.calculateDiscountAmount(
        discount, 
        unitPrice, 
        quantity
      );
      
      return {
        discount,
        discountAmount,
        finalPrice: (unitPrice * quantity) - discountAmount,
        valid: true,
        validFrom: moment(discount.startDate).tz(this.timezone).format('YYYY-MM-DD HH:mm:ss'),
        validTo: moment(discount.endDate).tz(this.timezone).format('YYYY-MM-DD HH:mm:ss'),
        timezone: this.timezone
      };
    });
  }
}
