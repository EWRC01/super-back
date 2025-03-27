import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus, 
  UsePipes, 
  ValidationPipe, 
  NotFoundException, 
  BadRequestException, 
  Get,
  Param,
  Patch,
  Delete
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiBody 
} from '@nestjs/swagger';
import { OrderDetailsService } from './orderdetails.service';
import { CreateOrderDetailDto } from './dto/create-orderdetail.dto';
import { OrderDetail } from './entities/orderdetail.entity';
import { UpdateOrderDetailDto } from './dto/update-orderdetail.dto';

@ApiTags('Order Details')
@Controller('order-details')
export class OrderDetailsController {
  constructor(private readonly orderDetailsService: OrderDetailsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener todos los detalles de órdenes',
    description: 'Obtiene una lista completa de todos los detalles de órdenes registrados en el sistema'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de detalles de órdenes obtenida exitosamente',
    type: OrderDetail,
    isArray: true
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Error interno del servidor'
  })
  async findAll() {
    return await this.orderDetailsService.findAll();
  }

  @Get('findDeleted/')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener todos los detalles de órdenes eliminados',
    description: 'Obtiene una lista completa de todos los detalles de órdenes eliminadas registrados en el sistema'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de detalles de órdenes eliminadas obtenida exitosamente',
    type: OrderDetail,
    isArray: true
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Error interno del servidor'
  })
  async findAllDeleted() {
    return await this.orderDetailsService.findAllDeleted();
  }

  @Get('orderDetail/:invoiceNumber')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener detalles por número de factura',
    description: 'Obtiene todos los detalles de una orden específica usando el número de factura'
  })
  @ApiParam({
    name: 'invoiceNumber',
    type: String,
    description: 'Número de factura de la orden',
    example: 'INV-20240315'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Detalles de la orden obtenidos exitosamente',
    schema: {
      example: {
        orderDate: "2023-03-15",
        invoiceNumber: "INV-20240315",
        details: [
          {
            id: 1,
            quantity: 10,
            purchasePriceUnit: 1200.00,
            calculatedTaxUnit: 138.05,
            calculatedTotalPriceWithouthTax: 10619.47,
            calculatedTotalTax: 1380.53,
            product: {
              id: 3,
              code: "PROD123",
              name: "Laptop Gamer"
            }
          }
        ]
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No se encontraron detalles para el número de factura proporcionado'
  })
  async findByInvoiceNumber(
    @Param('invoiceNumber') invoiceNumber: string,
  ) {
    return this.orderDetailsService.findOne(invoiceNumber);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({
    summary: 'Crear nuevos detalles de orden',
    description: 'Crea nuevos detalles de orden. Puede crear múltiples productos en una sola solicitud'
  })
  @ApiBody({
    type: CreateOrderDetailDto,
    examples: {
      example1: {
        value: {
          invoiceNumber: "INV-202403",
          products: [
            { productId: 3, quantity: 10 },
            { 
              code: "PROD-001",
              name: "Nuevo Producto",
              purchasePrice: 100,
              salePrice: 150,
              touristPrice: 140,
              quantity: 5,
              brandId: 1,
              categoryId: 2
            }
          ]
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Detalles de orden creados exitosamente',
    type: OrderDetail,
    isArray: true
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos o faltantes'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Recursos relacionados no encontrados (Orden, Marca, Categoría)'
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Error interno del servidor'
  })
  async create(@Body() createOrderDetailDto: CreateOrderDetailDto): Promise<OrderDetail[]> {
    try {
      return await this.orderDetailsService.create(createOrderDetailDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw new Error('Error interno del servidor');
    }
  }

  @Get('summary/:invoiceNumber')
@ApiOperation({
    summary: 'Get financial summary for an order',
    description: 'Get detailed financial breakdown with VAT calculations for a specific invoice'
})
@ApiParam({
    name: 'invoiceNumber',
    type: String,
    example: 'INV-20240315',
    description: 'Invoice number to query'
})
@ApiResponse({
    status: HttpStatus.OK,
    description: 'Financial summary retrieved successfully',
    schema: {
        example: {
            details: [
                {
                    id: 1,
                    productId: 3,
                    unitPriceWithVAT: 1200.00,
                    unitPriceWithoutVAT: 1061.95,
                    quantity: 10,
                    totalPriceWithVAT: 12000.00,
                    totalPriceWithoutVAT: 10619.47
                }
            ],
            summary: {
                totalWithVAT: 12000.00,
                totalWithoutVAT: 10619.47,
                totalVAT: 1380.53,
                invoice: {
                    number: "INV-20240315",
                    date: "2024-03-15"
                }
            }
        }
    }
})
@ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Invoice not found'
})
async getOrderSummary(@Param('invoiceNumber') invoiceNumber: string) {
    return this.orderDetailsService.getOrderSummary(invoiceNumber);
}

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar un detalle de orden',
    description: 'Actualiza un detalle de orden existente por su ID'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del detalle de orden a actualizar',
    example: 1
  })
  @ApiBody({ type: UpdateOrderDetailDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Detalle de orden actualizado exitosamente',
    type: OrderDetail
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Detalle de orden no encontrado'
  })
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateOrderDetailDto,
  ): Promise<OrderDetail> {
    return this.orderDetailsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar un detalle de orden',
    description: 'Elimina permanentemente un detalle de orden por su ID'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del detalle de orden a eliminar',
    example: 1
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Detalle de orden eliminado exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Detalle de orden no encontrado'
  })
  async remove(@Param('id') id: number): Promise<void> {
    await this.orderDetailsService.remove(id);
  }

  @Post('active/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Activar un detalle de orden',
    description: 'Activar un detalle de orden por su ID'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del detalle de orden a activar',
    example: 1
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Detalle de orden activado exitosamente'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Detalle de orden no encontrado'
  })
  async active(@Param('id') id: number): Promise<void> {
    await this.orderDetailsService.active(id);
  }
}