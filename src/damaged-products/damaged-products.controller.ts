// src/damaged-products/damaged-products.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { DamagedProductsService } from './damaged-products.service';
import { ReportDamagedProductDto } from './dto/report-damaged-product.dto';
import { ApproveReplacementDto } from './dto/approve-replacement.dto';
import { ProcessReplacementDto } from './dto/process-replacement.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DamagedProduct } from './entities/damaged-product.entity';

@ApiTags('Damaged Products - Gestión de Productos Dañados')
@ApiBearerAuth()
@Controller('damaged-products')
export class DamagedProductsController {
  constructor(
    private readonly damagedProductsService: DamagedProductsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener todos los productos dañados',
    description: 'Devuelve una lista completa de todos los registros de productos dañados con sus relaciones'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos dañados obtenida correctamente',
    type: [DamagedProduct] // Asegúrate de importar DamagedProduct desde su entidad
  })
  async find() {
    return await this.damagedProductsService.find();
  }

  @Get('product/:productId/stock-damaged')
  @ApiOperation({
    summary: 'Obtener stock dañado de un producto',
    description: 'Calcula y devuelve la cantidad total de unidades dañadas no repuestas para un producto específico'
  })
  @ApiParam({
    name: 'productId',
    description: 'ID del producto',
    example: 1,
    type: Number
  })
  @ApiResponse({
    status: 200,
    description: 'Stock dañado calculado correctamente',
    schema: {
      example: { damagedStock: 5 }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado'
  })
  async getDamagedStock(@Param('productId') productId: string) {
    const stock = await this.damagedProductsService.getDamagedStock(parseInt(productId));
    return { damagedStock: stock };
  }

  @Get('product/:productId/by-period')
  @ApiOperation({
    summary: 'Obtener productos dañados por período',
    description: 'Devuelve los registros de productos dañados para un producto específico en un rango de fechas'
  })
  @ApiParam({
    name: 'productId',
    description: 'ID del producto',
    example: 1,
    type: Number
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Fecha de inicio (YYYY-MM-DD)',
    example: '2023-01-01',
    type: String
  })
  @ApiQuery({
    name: 'endDate',
    description: 'Fecha de fin (YYYY-MM-DD)',
    example: '2023-12-31',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'Registros obtenidos correctamente',
    type: [DamagedProduct]
  })
  async getDamagedProductsByPeriod(
    @Param('productId') productId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.damagedProductsService.getDamagedProductsByPeriod(
      parseInt(productId),
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Post()
  @ApiOperation({
    summary: 'Reportar productos dañados',
    description: 'Registra productos que han llegado en mal estado o se han dañado en almacén',
  })
  @ApiBody({
    type: ReportDamagedProductDto,
    examples: {
      ejemplo1: {
        value: {
          productId: 123,
          quantity: 2,
          notes: "Paquetes mojados durante el transporte"
        }
      },
      ejemplo2: {
        value: {
          productId: 456,
          quantity: 5,
          notes: "Productos con fecha de caducidad vencida"
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Producto dañado registrado correctamente',
    type: DamagedProduct
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos o stock insuficiente',
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
  })
  async reportDamagedProduct(@Body() dto: ReportDamagedProductDto) {
    return this.damagedProductsService.reportDamagedProduct(
      dto.productId,
      dto.quantity,
      dto.notes,
    );
  }

  @Patch(':id/request-replacement')
  @ApiOperation({
    summary: 'Solicitar reposición al proveedor',
    description: 'Marca un producto dañado como solicitado para reposición al proveedor correspondiente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del registro de producto dañado',
    example: 1,
    type: Number
  })
  @ApiResponse({
    status: 200,
    description: 'Solicitud de reposición registrada',
    type: DamagedProduct
  })
  @ApiResponse({
    status: 400,
    description: 'El producto ya fue repuesto',
  })
  @ApiResponse({
    status: 404,
    description: 'Registro de producto dañado no encontrado',
  })
  async requestReplacement(@Param('id') id: string) {
    return this.damagedProductsService.requestReplacement(parseInt(id));
  }

  @Patch(':id/approve-replacement')
  @ApiOperation({
    summary: 'Aprobar reposición de productos',
    description: 'Aprueba la cantidad de productos que serán repuestos por el proveedor (solo administradores)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del registro de producto dañado',
    example: 1,
    type: Number
  })
  @ApiBody({
    type: ApproveReplacementDto,
    examples: {
      ejemplo1: {
        value: {
          approvedQuantity: 3
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Reposición aprobada correctamente',
    type: DamagedProduct
  })
  @ApiResponse({
    status: 400,
    description: 'Cantidad aprobada mayor que la cantidad dañada',
  })
  @ApiResponse({
    status: 404,
    description: 'Registro de producto dañado no encontrado',
  })
  async approveReplacement(
    @Param('id') id: string,
    @Body() dto: ApproveReplacementDto,
  ) {
    return this.damagedProductsService.approveReplacement(
      parseInt(id),
      dto.approvedQuantity,
    );
  }

  @Patch(':id/process-replacement')
  @ApiOperation({
    summary: 'Procesar reposición recibida',
    description: 'Registra la cantidad real de productos repuestos por el proveedor y actualiza el stock',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del registro de producto dañado',
    example: 1,
    type: Number
  })
  @ApiBody({
    type: ProcessReplacementDto,
    examples: {
      ejemplo1: {
        value: {
          actualReplacedQuantity: 3
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Reposición procesada correctamente',
    schema: {
      example: {
        damagedProduct: {
          id: 1,
          replaced: true,
          replacedQuantity: 3
        },
        product: {
          id: 123,
          stock: 15
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Cantidad repuesta mayor que la cantidad aprobada',
  })
  @ApiResponse({
    status: 404,
    description: 'Registro de producto dañado no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Reposición no ha sido aprobada previamente',
  })
  async processReplacement(
    @Param('id') id: string,
    @Body() dto: ProcessReplacementDto,
  ) {
    return this.damagedProductsService.processReplacement(
      parseInt(id),
      dto.actualReplacedQuantity,
    );
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'Obtener estadísticas de pérdidas',
    description: 'Devuelve un reporte de pérdidas por productos dañados, con opción de filtrar por proveedor',
  })
  @ApiQuery({
    name: 'providerId',
    required: false,
    description: 'ID del proveedor para filtrar las estadísticas',
    type: Number,
    example: 789
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas calculadas correctamente',
    schema: {
      example: {
        totalLoss: 125.50,
        replacedLoss: 75.30,
        netLoss: 50.20,
        byBrand: [
          {
            brandId: 456,
            brandName: "Marca de Refrescos",
            totalLoss: 100.00,
            replacedLoss: 60.00
          }
        ]
      }
    }
  })
  async getLossStatistics(@Query('providerId') providerId?: number) {
    return this.damagedProductsService.getLossStatistics(
      providerId ? parseInt(providerId as any) : undefined,
    );
  }
}